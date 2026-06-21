from fastapi import APIRouter, Depends, HTTPException, Request, status
import stripe
from app.core.config import settings
from app.models.domain import User, Tenant
from app.api.deps import get_current_user, get_db
from sqlalchemy.orm import Session
import logging

router = APIRouter(tags=["Billing"])

stripe.api_key = settings.STRIPE_SECRET_KEY
logger = logging.getLogger(__name__)

# Plan Limits Configuration
PLAN_LIMITS = {
    "free": 50,
    "pro": 500,
    "enterprise": 999999
}

@router.post("/create-checkout-session")
def create_checkout_session(
    plan: str,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Cria uma sessão de checkout no Stripe para o plano escolhido.
    """
    if plan != "pro":
        raise HTTPException(status_code=400, detail="Plano inválido para checkout.")
        
    if not settings.STRIPE_PRO_PRICE_ID:
        raise HTTPException(status_code=500, detail="Configuração de preço do Stripe ausente no servidor.")

    tenant = current_user.tenant
    
    try:
        # Se o tenant já tem customer_id, use-o; senão, o Stripe criará um novo na sessão de checkout
        customer_id = tenant.stripe_customer_id

        session_params = {
            "payment_method_types": ["card"],
            "line_items": [
                {
                    "price": settings.STRIPE_PRO_PRICE_ID,
                    "quantity": 1,
                }
            ],
            "mode": "subscription",
            "success_url": f"{settings.FRONTEND_URL}/dashboard?session_id={{CHECKOUT_SESSION_ID}}",
            "cancel_url": f"{settings.FRONTEND_URL}/pricing",
            "client_reference_id": str(tenant.id), # Crucial para identificar qual tenant assinou no webhook
        }
        
        if customer_id:
            session_params["customer"] = customer_id
        else:
            session_params["customer_email"] = current_user.email
            
        checkout_session = stripe.checkout.Session.create(**session_params)
        
        return {"url": checkout_session.url}
    except Exception as e:
        logger.error(f"Erro ao criar checkout session: {str(e)}")
        raise HTTPException(status_code=500, detail="Não foi possível iniciar o pagamento.")


@router.post("/portal")
def create_customer_portal_session(
    current_user: User = Depends(get_current_user),
):
    """
    Cria uma sessão no portal do cliente (para gerenciar assinaturas, ver faturas, etc).
    """
    tenant = current_user.tenant
    if not tenant.stripe_customer_id:
        raise HTTPException(status_code=400, detail="Tenant não possui assinatura ativa no Stripe.")
        
    try:
        portal_session = stripe.billing_portal.Session.create(
            customer=tenant.stripe_customer_id,
            return_url=f"{settings.FRONTEND_URL}/dashboard",
        )
        return {"url": portal_session.url}
    except Exception as e:
        logger.error(f"Erro ao criar portal session: {str(e)}")
        raise HTTPException(status_code=500, detail="Não foi possível acessar o portal de faturamento.")


@router.post("/webhook")
async def stripe_webhook(request: Request, db: Session = Depends(get_db)):
    """
    Recebe eventos assíncronos do Stripe (assinatura criada, cancelada, falha no pagamento).
    """
    payload = await request.body()
    sig_header = request.headers.get("stripe-signature")
    
    if not settings.STRIPE_WEBHOOK_SECRET:
        logger.warning("Stripe webhook ignorado (STRIPE_WEBHOOK_SECRET não configurado).")
        return {"status": "ignored"}

    try:
        event = stripe.Webhook.construct_event(
            payload, sig_header, settings.STRIPE_WEBHOOK_SECRET
        )
    except ValueError as e:
        # Invalid payload
        raise HTTPException(status_code=400, detail="Invalid payload")
    except stripe.error.SignatureVerificationError as e:
        # Invalid signature
        raise HTTPException(status_code=400, detail="Invalid signature")

    event_type = event["type"]
    
    if event_type == "checkout.session.completed":
        session = event["data"]["object"]
        
        # Recuperar o tenant_id que passamos no checkout
        tenant_id = session.get("client_reference_id")
        if not tenant_id:
            logger.error("Checkout session completada sem client_reference_id.")
            return {"status": "error", "message": "Missing client_reference_id"}
            
        customer_id = session.get("customer")
        subscription_id = session.get("subscription")
        
        tenant = db.query(Tenant).filter(Tenant.id == tenant_id).first()
        if tenant:
            tenant.stripe_customer_id = customer_id
            tenant.stripe_subscription_id = subscription_id
            tenant.plan_name = "pro"
            tenant.plan_status = "active"
            tenant.candidate_count_limit = PLAN_LIMITS["pro"]
            db.commit()
            logger.info(f"Tenant {tenant_id} atualizado para plano PRO.")
        else:
            logger.warning(f"Webhook checkout.session.completed: Tenant {tenant_id} não encontrado no banco.")
            
    elif event_type == "customer.subscription.updated":
        subscription = event["data"]["object"]
        sub_id = subscription.get("id")
        status = subscription.get("status")
        
        tenant = db.query(Tenant).filter(Tenant.stripe_subscription_id == sub_id).first()
        if tenant:
            tenant.plan_status = status
            # Se a assinatura estiver cancelada ou past_due, podemos fazer downgrade automático
            if status in ["canceled", "unpaid"]:
                tenant.plan_name = "free"
                tenant.candidate_count_limit = PLAN_LIMITS["free"]
            elif status == "active":
                tenant.plan_name = "pro"
                tenant.candidate_count_limit = PLAN_LIMITS["pro"]
            db.commit()
        else:
            logger.warning(f"Webhook customer.subscription.updated: Tenant com assinatura {sub_id} não encontrado no banco.")
            
    elif event_type == "customer.subscription.deleted":
        subscription = event["data"]["object"]
        sub_id = subscription.get("id")
        
        tenant = db.query(Tenant).filter(Tenant.stripe_subscription_id == sub_id).first()
        if tenant:
            tenant.plan_status = "canceled"
            tenant.plan_name = "free"
            tenant.candidate_count_limit = PLAN_LIMITS["free"]
            tenant.stripe_subscription_id = None
            db.commit()
            logger.info(f"Assinatura cancelada. Tenant {tenant.id} rebaixado para plano FREE.")
        else:
            logger.warning(f"Webhook customer.subscription.deleted: Tenant com assinatura {sub_id} não encontrado no banco.")

    return {"status": "success"}

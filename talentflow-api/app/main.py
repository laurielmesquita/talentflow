import logging
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from slowapi import _rate_limit_exceeded_handler
from slowapi.errors import RateLimitExceeded
from app.api.candidates import router as candidates_router
from app.api.jobs import router as jobs_router
from app.api.categories import router as categories_router
from app.api.dashboard import router as dashboard_router
from app.api.auth import router as auth_router
from app.api.billing import router as billing_router
from app.api.sandbox import router as sandbox_router
from app.api.public_jobs import router as public_jobs_router
from app.api.sandbox import limiter
from app.core.config import settings

logger = logging.getLogger(__name__)

app = FastAPI(
    title="TalentFlow API",
    description="Motor de Ingestão e Triagem Inteligente",
    version=settings.VERSION,
)

app.state.limiter = limiter
app.add_exception_handler(RateLimitExceeded, _rate_limit_exceeded_handler)

app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:3000",
        "https://talentflow-web-flame.vercel.app",
        "https://talentflow-web.vercel.app",
        "https://tlntflow.vercel.app"
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.on_event("startup")
def startup_event():
    logger.info(f"Iniciando TalentFlow API v{settings.VERSION}")
    print(f"Iniciando TalentFlow API v{settings.VERSION}")

@app.get("/health")
def health_check():
    return {"status": "ok", "message": "TalentFlow API is running", "version": settings.VERSION}

@app.get("/api/health")
def api_health_check():
    return {"status": "ok", "message": "TalentFlow API is running", "version": settings.VERSION}

app.include_router(candidates_router, prefix="/api")
app.include_router(jobs_router, prefix="/api")
app.include_router(categories_router, prefix="/api")
app.include_router(dashboard_router, prefix="/api")
app.include_router(auth_router, prefix="/api")
app.include_router(billing_router, prefix="/api/billing")
app.include_router(sandbox_router, prefix="/api/sandbox")
app.include_router(public_jobs_router, prefix="/api")

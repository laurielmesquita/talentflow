# Deploy da API no Render Free

## Objetivo

Executar o `talentflow-api` em um Web Service gratuito do Render durante a fase de validação do produto, mantendo o Neon como banco e o Cloudinary como storage.

## Configuração

O Blueprint está em `/render.yaml` e usa o Dockerfile existente em `/talentflow-api/Dockerfile`.

- Plano: `free`
- Runtime: Docker
- Diretório raiz: `talentflow-api`
- Health check: `/health`
- Inicialização: `alembic upgrade head` seguido de Uvicorn
- Porta: fornecida pelo Render através de `$PORT`
- Suspensão: automática após inatividade, conforme as limitações do plano gratuito

O plano gratuito não disponibiliza `preDeployCommand`. Por isso, a migração Alembic é executada antes da inicialização da API. As migrações devem permanecer idempotentes e nunca devem ser executadas manualmente contra produção sem autorização do PO.

## Variáveis de ambiente

Os nomes das variáveis estão declarados no Blueprint sem valores sensíveis. Os valores devem ser preenchidos no Render Dashboard ou sincronizados por um segredo seguro. Nenhum `.env` deve ser commitado.

## Validação registrada

1. Confirmar resposta `2xx` em `/health`.
2. Conferir que a versão exibida na raiz é `2.5.0`.
3. Validar login, logout e cookies dual-cookie.
4. Validar isolamento entre tenants.
5. Validar upload e recuperação de PDF pelo Cloudinary.
6. Validar processamento Groq/Gemini e status de lote.
7. Validar OTP, e-mails e webhook Stripe.
8. Testar o primeiro acesso depois de o serviço entrar em suspensão.

## Rollback

O Fly.io está parado e permanece disponível como fallback manual. Para reativá-lo, será necessário iniciar a máquina e executar manualmente o workflow de deploy correspondente.

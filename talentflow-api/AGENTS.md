# AGENTS.md — talentflow-api

> Contrato técnico operacional para agentes de IA atuando neste repositório.
> Leia este arquivo integralmente antes de escrever qualquer linha de código.

---

## 1. Visão Geral do Serviço

**talentflow-api** é o motor de inteligência e ingestão de dados do TalentFlow. Responsável por orquestrar autenticação, processamento de currículos via IA, match inteligente de candidatos e toda a lógica de negócio da plataforma.

| Atributo       | Valor                                          |
|----------------|------------------------------------------------|
| Runtime        | Python 3.11+                                   |
| Package Manager| **uv** (PEP 621 — `pyproject.toml` & `uv.lock`) |
| Framework      | FastAPI (assíncrono, ASGI via Uvicorn)         |
| Banco de dados | PostgreSQL 15 — Neon.tech (serverless)         |
| ORM            | SQLAlchemy 2.x (async-compatible)              |
| Migrações      | Alembic                                        |
| Deploy         | Fly.io — região `dfw` (Dallas)                 |
| Porta local    | `8000`                                         |
| Docs Swagger   | `http://localhost:8000/docs`                   |

---

## 2. Estrutura de Diretórios

```
talentflow-api/
├── app/
│   ├── main.py              ← ponto de entrada FastAPI, registro de routers
│   ├── api/
│   │   ├── auth.py          ← login, register, logout, change-password
│   │   ├── deps.py          ← get_current_user (cookie → Bearer fallback)
│   │   ├── candidates.py    ← CRUD candidatos + flag/unflag
│   │   ├── jobs.py          ← CRUD vagas
│   │   ├── dashboard.py     ← estatísticas por tenant
│   │   ├── categories.py    ← CRUD de tags/categorias
│   │   ├── billing.py       ← integração Stripe
│   │   ├── public_apply.py  ← candidatura pública + OTP
│   │   ├── public_jobs.py   ← vagas públicas (sem auth)
│   │   └── sandbox.py       ← endpoint de demonstração (com Lock)
│   ├── core/
│   │   └── config.py        ← Settings (Pydantic), versão do app
│   ├── models/
│   │   └── domain.py        ← SQLAlchemy ORM models (todas as entidades)
│   ├── schemas/
│   │   ├── auth.py          ← Login, Register, Token, ResetPassword (min_length=8)
│   │   ├── extraction.py    ← CandidateExtraction, ExperienceItem (canonical AI output)
│   │   └── job.py           ← JobResponse, PublicJobResponse (from_attributes=True)
│   └── services/
│       ├── auth.py          ← JWT (exp=4h, claim `iss`), hash/verify password
│       ├── email.py         ← SMTP Brevo, send_email(), send_reset_password_email()
│       ├── features.py      ← Feature Flags B2B, get_plan_features(), check_feature_access()
│       ├── job_lookup.py    ← resolve_job_id() — UUID ou slug semântico
│       ├── match_engine.py  ← Smart Match com Groq + Gemini fallback + static fallback
│       ├── quality_score.py ← CV Quality Score 0-100 com score_tier() high/medium/low
│       └── slug.py          ← slugify() + generate_slug() com deduplicação
├── alembic/                 ← histórico de migrações SQL
├── alembic.ini
├── ingest.py                ← script de ingestão em lote (CLI)
├── measure_performance.py   ← benchmark de queries (P50/P95/P99)
├── backfill_quality_score.py← Data Engineering retrospectivo
├── seed.py                  ← seed de categorias estáticas
├── seed_jobs.py             ← seed de vagas de teste
├── Dockerfile
├── docker-compose.yml
├── fly.toml                 ← config de deploy Fly.io
└── requirements.txt
```

---

## 3. Princípios de Arquitetura — NUNCA Violar

### 3.1 Multi-Tenancy
- **Todo acesso a dados deve passar por `get_scoped_db`** — a dependência que injeta um `db` pré-filtrado por `tenant_id`.
- Queries diretas que não filtrem por `tenant_id` são bugs de segurança críticos (vazamento de dados entre tenants).
- A restrição de unicidade composta `UniqueConstraint('tenant_id', 'name')` em tags/categorias é intencional — não remover.

```python
# ✅ Correto — scoped DB
async def get_candidates(db: AsyncSession = Depends(get_scoped_db)):
    result = await db.execute(select(Candidate))  # já filtrado por tenant

# 🚫 Proibido — raw DB sem escopo
async def get_candidates(db: AsyncSession = Depends(get_db)):
    result = await db.execute(select(Candidate))  # VAZA dados de todos os tenants
```

### 3.2 Concorrência
- O semáforo `asyncio.Semaphore(3)` no pipeline de ingestão é um **guardrail de memória** — a máquina Fly.io tem 512MB de RAM.
- Nunca aumentar a concorrência sem calcular o impacto de memória.
- O `threading.Lock` no `sandbox.py` é intencional para o endpoint de demonstração.

### 3.3 Autenticação (Dual-Cookie)
- A API define `Set-Cookie: token; HttpOnly; Secure; SameSite=Lax` na resposta do login.
- O `get_current_user` em `deps.py` tem fallback: lê o cookie HttpOnly primeiro, depois tenta `Authorization: Bearer`.
- **Não alterar esta lógica sem aprovação** — ela é acoplada ao comportamento do Edge Middleware no frontend.

### 3.4 N+1 Queries
- Rotas de listagem **devem** usar `selectinload` para relações aninhadas.
- Nunca usar lazy loading em loops — isso dispara N+1 queries e foi a causa de degradação de 70%+ de latência que já corrigimos.

---

## 4. Setup de Desenvolvimento Local

```bash
# 1. Clonar o repo e acessar o diretório
cd talentflow-api

# 2. Criar e ativar ambiente virtual
python -m venv venv
source venv/bin/activate  # Windows: venv\Scripts\activate

# 3. Instalar dependências
pip install -r requirements.txt

# 4. Configurar variáveis de ambiente
cp .env.example .env
# Preencher: DATABASE_URL, SECRET_KEY, JWT_SECRET_KEY,
#            GROQ_API_KEY, GEMINI_API_KEY,
#            CLOUDINARY_URL, STRIPE_SECRET_KEY, STRIPE_WEBHOOK_SECRET

# 5. Rodar migrações
alembic upgrade head

# 6. Iniciar servidor de desenvolvimento
uvicorn app.main:app --reload --port 8000
```

---

## 5. Variáveis de Ambiente Obrigatórias

| Variável                | Serviço       | Descrição                              |
|-------------------------|---------------|----------------------------------------|
| `DATABASE_URL`          | Neon.tech     | Connection string PostgreSQL            |
| `SECRET_KEY`            | FastAPI       | Chave para sessões gerais              |
| `JWT_SECRET_KEY`        | PyJWT         | Assina tokens HMAC-SHA256              |
| `GROQ_API_KEY`          | Groq          | Extração de texto (Llama 3.3 70B)      |
| `GEMINI_API_KEY`        | Google        | OCR de PDFs escaneados (Gemini 2.5 Flash)|
| `CLOUDINARY_URL`        | Cloudinary    | Storage de fotos de perfil. Auto-parsed: `cloudinary://key:secret@name` → cloud_name, api_key, api_secret |
| `STRIPE_SECRET_KEY`     | Stripe        | Billing/assinaturas                    |
| `STRIPE_WEBHOOK_SECRET` | Stripe        | Verificação de webhooks                |

> [!CAUTION]
> Nunca commitar `.env` — está no `.gitignore`. Em caso de dúvida, consultar `.env.example` que contém as chaves sem valores.

---

## 6. Scripts de Operação

| Script                      | Uso                                                     |
|-----------------------------|---------------------------------------------------------|
| `ingest.py /path/to/pdfs`   | Ingestão em lote de currículos (PDF → banco de dados)  |
| `measure_performance.py`    | Benchmark de latência e contagem de queries (P50/P95/P99)|
| `backfill_quality_score.py` | Recalcular Quality Score em candidatos legados         |
| `seed.py`                   | Popular categorias de domínio estático                 |
| `seed_jobs.py`              | Popular vagas de teste no banco                        |

> [!WARNING]
> Os scripts `ingest.py`, `backfill_quality_score.py` e `seed_jobs.py` fazem escrita direta no banco. **Nunca executar em produção sem autorização explícita do PO.**

---

## 7. Endpoints da API

### Autenticação
| Método | Rota | Auth | Descrição |
|--------|------|------|-----------|
| POST | `/api/auth/login` | Não | Login (emite JWT + cookie HttpOnly) |
| POST | `/api/auth/register` | Não | Cadastro de novo tenant + admin |
| POST | `/api/auth/logout` | Cookie | Limpa cookie HttpOnly |
| POST | `/api/auth/change-password` | Cookie | Alterar senha |
| POST | `/api/auth/forgot-password` | Não | Gera token de reset + envia e-mail |
| POST | `/api/auth/reset-password` | Não | Redefine senha via token |

### Dashboard
| Método | Rota | Auth | Descrição |
|--------|------|------|-----------|
| GET | `/api/dashboard/stats` | Cookie | Estatísticas agregadas do tenant |

### Candidatos
| Método | Rota | Auth | Descrição |
|--------|------|------|-----------|
| GET | `/api/candidates` | Cookie | Lista candidatos (paginado, filtrável) |
| GET | `/api/candidates/:id` | Cookie | Detalhe completo do candidato |
| GET | `/api/candidates/:id/pdf` | Cookie+Query | Proxy inline do PDF original (Cloudinary signed URL) |
| GET | `/api/candidates/:id/versions` | Cookie | Histórico de versões do currículo |
| POST | `/api/candidates/:id/replace` | Cookie | Substitui currículo por nova versão |
| POST | `/api/candidates/:id/flag` | Cookie | Marcar candidato (blacklist) |
| POST | `/api/candidates/:id/unflag` | Cookie | Desmarcar candidato |
| DELETE | `/api/candidates/:id` | Cookie | Soft delete (preenche deleted_at) |

### Upload
| Método | Rota | Auth | Descrição |
|--------|------|------|-----------|
| POST | `/api/upload` | Cookie | Upload individual de PDF + extração IA |
| POST | `/api/batches/upload` | Cookie | Upload em lote assíncrono (BackgroundTasks) |
| GET | `/api/batches/:batch_id` | Cookie | Status do processamento em lote |

### Vagas
| Método | Rota | Auth | Descrição |
|--------|------|------|-----------|
| GET | `/api/jobs` | Cookie | Lista vagas do tenant |
| GET | `/api/jobs/:id` | Cookie | Detalhe da vaga |
| POST | `/api/jobs` | Cookie | Criar vaga (slug auto-gerado) |
| PUT | `/api/jobs/:id` | Cookie | Atualizar vaga (invalida cache de match) |
| DELETE | `/api/jobs/:id` | Cookie | Soft delete da vaga |
| GET | `/api/jobs/:id/match` | Cookie | Smart Match (cache Warm Path < 50ms) |

### Categorias
| Método | Rota | Auth | Descrição |
|--------|------|------|-----------|
| GET | `/api/categories` | Cookie | Lista categorias do tenant |
| POST | `/api/categories` | Cookie | Criar categoria |
| PUT | `/api/categories/:id` | Cookie | Atualizar categoria |
| DELETE | `/api/categories/:id` | Cookie | Remover categoria |

### Público (sem auth)
| Método | Rota | Auth | Descrição |
|--------|------|------|-----------|
| GET | `/api/public/vagas` | Não | Lista vagas ativas |
| GET | `/api/public/vagas/:slug` | Não | Detalhe da vaga por slug |
| POST | `/api/public/apply/:job_slug` | Não | Candidatura pública + upload PDF + envia OTP |
| POST | `/api/public/apply/verify-otp` | Não | Verifica código OTP (SHA-256) |
| GET | `/api/public/apply/status/:application_id` | Não | Polling de status da candidatura |

### Billing (Stripe)
| Método | Rota | Auth | Descrição |
|--------|------|------|-----------|
| POST | `/api/billing/create-checkout-session` | Cookie | Cria sessão de checkout Stripe (Pro) |
| POST | `/api/billing/portal` | Cookie | Gera sessão do Customer Portal |
| POST | `/api/billing/webhook` | Stripe | Processa eventos de assinatura |

### Sandbox
| Método | Rota | Auth | Descrição |
|--------|------|------|-----------|
| POST | `/api/sandbox/extract` | Não | Demo pública de extração IA (rate-limited) |

### Sistema
| Método | Rota | Auth | Descrição |
|--------|------|------|-----------|
| GET | `/` | Não | Raiz: status + versão |
| GET | `/health` | Não | Health check |
| GET | `/api/health` | Não | Health check (prefixado) |

---

## 8. Pipeline de Ingestão de IA

```
PDF recebido
    │
    ▼
pdfplumber → texto extraível?
    ├── SIM → Groq API (Llama 3.3 70B)  ← texto puro, baixa latência
    └── NÃO → Gemini 2.5 Flash (OCR)    ← multimodal, PDFs escaneados
                    │
                    ▼
            Extração JSON estruturada (response_schema)
                    │
                    ▼
            Quality Score + Quality Tier (High/Medium/Low)
            + Alertas de qualidade para dados ausentes
                    │
                    ▼
            INSERT no PostgreSQL (scoped por tenant_id)
```

---

## 9. Deploy

```bash
# Deploy manual via Fly.io CLI (requer flyctl instalado)
fly deploy

# Deploy automático via GitHub Actions
# Configurado em: .github/workflows/fly-deploy.yml
# Trigger: push na branch main
```

> [!IMPORTANT]
> O `fly.toml` define a configuração de hardware. A máquina atual tem 512MB de RAM — qualquer mudança de hardware deve ser validada em relação ao `asyncio.Semaphore(3)` no pipeline de ingestão.

---

## 10. Regras de Modificação

### ✅ Seguro modificar
- Schemas Pydantic em `schemas/` (desde que sem breaking changes de campo)
- Lógica de business em `services/`
- Adição de novos endpoints em `api/`
- Seeds e scripts em raiz

### ⚠️ Modificar com cautela (exige revisão)
- `models/domain.py` — qualquer mudança exige nova migration com Alembic
- `api/deps.py` — lógica central de autenticação e scoping
- `api/auth.py` — fluxo de login/cookie
- `services/auth.py` — geração de JWT

### 🚫 Proibido alterar sem aprovação do PO
- Lógica de `tenant_id` scoping no `get_scoped_db`
- Configurações de `fly.toml` (hardware, concorrência)
- `.env` de qualquer ambiente

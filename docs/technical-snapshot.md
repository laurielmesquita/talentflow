# Technical Snapshot — TalentFlow v2.2.0
**Gerado em:** 2026-08-04 · **Sessão:** Review de Arquitetura & Refatorações de Produção  
**Status do Projeto:** v2.2.0 (Refatorado & Estabilizado)

---

## 1. Stack & Arquitetura Atual

```
Frontend:  Next.js 16 (App Router) · React 19 · Tailwind CSS v4 · Framer Motion 12
           └── Novas Camadas: src/types/ (Tipagem de Domínio) · src/lib/data/ (Server Fetches)
Backend:   FastAPI (Python 3.11) · Uvicorn · uv (PEP 621 — pyproject.toml & uv.lock) · SQLAlchemy 2.x Sync (pool_size=5, max_overflow=10)
           └── Novas Camadas: app/schemas/extraction.py · app/schemas/job.py · app/services/job_lookup.py
DB:        PostgreSQL 15 via Neon.tech (serverless, sa-east-1)
Storage:   Cloudinary (fotos de perfil e PDFs)
AI:        Groq API (Llama 3.3 70B) · Google Gemini 2.5 Flash (OCR)
Auth:      PyJWT + Bcrypt · Dual-Cookie (HttpOnly API + Non-HttpOnly Edge)
Deploy:    Vercel (web: tlntflow.vercel.app) · Fly.io (API: talentflow-api.fly.dev)
Repo:      github.com/laurielmesquita/talentflow.git
Versão:    2.2.0
```

---

## 2. Resumo de Melhorias Implementadas na v2.2.0

### 🚨 Backend (`talentflow-api`)
1. **Gerenciamento com `uv` (PEP 621):** Migração do `requirements.txt` legado para `pyproject.toml` e `uv.lock` determinístico com Dockerfile otimizado no Fly.io.
2. **P0 Connection Leak Fix:** Adicionado `finally: fallback_db.close()` no handler de erro do pipeline de IA em [`public_apply.py`](file:///Users/laurielmesquita/Space%20Square/02-Customers/TalentFlow/05-Projetos/talentflow-api/app/api/public_apply.py).
3. **Pool DB Explícito:** `pool_size=5` e `max_overflow=10` declarados no `create_engine` em [`database.py`](file:///Users/laurielmesquita/Space%20Square/02-Customers/TalentFlow/05-Projetos/talentflow-api/app/core/database.py).
4. **Fonte Única para `PLAN_LIMITS`:** Centralizado em [`config.py`](file:///Users/laurielmesquita/Space%20Square/02-Customers/TalentFlow/05-Projetos/talentflow-api/app/core/config.py) e consumido por `auth.py` e `billing.py`.
5. **Schemas Canônicos de Ingestão:** Criado [`app/schemas/extraction.py`](file:///Users/laurielmesquita/Space%20Square/02-Customers/TalentFlow/05-Projetos/talentflow-api/app/schemas/extraction.py) (`CandidateExtraction`, `ExperienceItem`), removendo acoplamentos diretos com `ingest.py`.
6. **Schemas Pydantic de Resposta:** Criado [`app/schemas/job.py`](file:///Users/laurielmesquita/Space%20Square/02-Customers/TalentFlow/05-Projetos/talentflow-api/app/schemas/job.py) (`JobResponse`, `PublicJobResponse`) e aplicado em `jobs.py` e `public_jobs.py`.
7. **Lookup de Vagas Desacoplado:** Criado [`app/services/job_lookup.py`](file:///Users/laurielmesquita/Space%20Square/02-Customers/TalentFlow/05-Projetos/talentflow-api/app/services/job_lookup.py) (`resolve_job_id`), eliminando blocos duplicados de `try/except uuid.UUID`.

### 🎨 Frontend (`talentflow-web`)
1. **Memory Leak do Polling:** Resolvido `setInterval` sem cleanup em [`BatchUploadButton.tsx`](file:///Users/laurielmesquita/Space%20Square/02-Customers/TalentFlow/05-Projetos/talentflow-web/src/components/BatchUploadButton.tsx) utilizando `useRef` e hook de unmount.
2. **Tratamento de Status 401:** Adicionado `redirect('/login')` nas buscas em Server Components (`jobs/page.tsx` e `smart-match/page.tsx`).
3. **Classes Tailwind Inválidas:** Corrigidas variações `emerald-550`, `rose-550`, `amber-550` para tokens padrão em [`ConflictModal.tsx`](file:///Users/laurielmesquita/Space%20Square/02-Customers/TalentFlow/05-Projetos/talentflow-web/src/components/ConflictModal.tsx).
4. **Design System Tokens:** Ajustados os estados de `BatchUploadButton.tsx` para `primary` e `primary-foreground` OKLCH.
5. **Tipagem Centralizada de Domínio:** Criado [`src/types/`](file:///Users/laurielmesquita/Space%20Square/02-Customers/TalentFlow/05-Projetos/talentflow-web/src/types/) (`job.ts`, `candidate.ts`, `category.ts`, `index.ts`) e tipado `CandidateTable.tsx`.
6. **Camada de Data Fetching:** Criado [`src/lib/data/`](file:///Users/laurielmesquita/Space%20Square/02-Customers/TalentFlow/05-Projetos/talentflow-web/src/lib/data/) (`jobs.ts`, `candidates.ts`, `categories.ts`) reduzindo duplicação de requisições.

---

## 3. Tarefas Pendentes para v2.3.0

- [ ] **Extração do `CandidateService`:** Decompor `app/api/candidates.py` em serviço dedicado.
- [ ] **Otimização da Árvore de Versões:** Substituir a query `db.query(Candidate).all()` por busca recursiva direcionada por `parent_id`.
- [ ] **Modal de Exclusão Único para Vagas:** Generalizar `DeleteConfirmModal.tsx` para aceitar `itemName` e substituir as implementações inline restantes.

---

## 4. Diretrizes de Governança (`AGENTS.md`)

- **Multi-Tenancy:** Toda query no backend DEVE obrigatoriamente usar `get_scoped_db`.
- **Dual-Cookie Auth:** Manter cookies síncronos (HttpOnly API + Non-HttpOnly Edge).
- **Conventional Commits:** Todas as alterações de repositório devem ser registradas de forma atômica por escopo.

# Technical Snapshot — TalentFlow

> Snapshot gerado em 2026-07-22 após sessão de auditoria full-stack (12 commits, 21 correções).
> Destinado a migrar o contexto técnico para o novo workspace unificado.

---

## 1. Visão Geral

| Atributo | Valor |
|----------|-------|
| Produto | TalentFlow — Banco de Talentos Inteligente |
| Cliente | Lauriel Mesquita |
| Estúdio | Space Square |
| Versão atual | **2.1.0** |
| Stack | FastAPI + Next.js 16 + PostgreSQL (Neon) |
| Deploy API | Fly.io (SP — gru) |
| Deploy Web | Vercel (tlntflow.vercel.app) |
| Repositório | `github.com/laurielmesquita/talentflow.git` |
| Monorepo root | `05-Projetos/` |
| Estrutura | `talentflow-api/` + `talentflow-web/` |

---

## 2. Time e Acordo de Colaboração

### Participantes

- **Lauriel Mesquita** — cliente / product owner
- **Antigravity** — agente de arquitetura e code review
- **OpenCode (deepseek-v4-flash-free)** — agente de implementação

### Acordo firmado

1. **Alinhar antes de agir** — quando um tópico for levantado, perguntar se é pra discutir ou só implementar.
2. **Tom de parceiro de squad** — sugerir, não impor; perguntar "o que você acha?" e aguardar.
3. **Erros como aprendizado coletivo** — "bora corrigir juntos" ao invés de fingir que não aconteceu.

---

## 3. Arquitetura do Projeto

### 3.1 Stack

```
Frontend (Vercel)
├── Next.js 16 (App Router)
├── Tailwind v4 + Framer Motion
├── Lucide React (ícones)
├── next-themes (dual theme)

Backend (Fly.io)
├── FastAPI (Python 3.11+)
├── SQLAlchemy 2.x + Alembic
├── Groq SDK (Llama 3.3) + Gemini API
├── Pydantic v2

Banco
├── PostgreSQL 15 (Neon — sa-east-1)
└── Pool: pool_pre_ping + pool_recycle
```

### 3.2 Estrutura de Diretórios (relevante)

```
talentflow-api/
├── app/
│   ├── api/
│   │   ├── auth.py          ← cookie helper + logout endpoint
│   │   ├── deps.py          ← get_current_user (cookie fallback)
│   │   ├── candidates.py
│   │   ├── jobs.py
│   │   ├── dashboard.py
│   │   ├── categories.py
│   │   └── public_apply.py  ← OTP rate-limit + hash
│   ├── core/
│   │   └── config.py        ← version, settings
│   ├── models/
│   ├── schemas/
│   │   └── auth.py          ← min_length=8
│   └── services/
│       ├── auth.py          ← JWT (4h, iss claim)
│       └── sandbox.py       ← threading.Lock
├── Dockerfile
└── docker-compose.yml

talentflow-web/
├── src/
│   ├── app/
│   │   ├── layout.tsx       ← title.template + metadata
│   │   ├── middleware.ts    ← edge auth validation
│   │   ├── login/page.tsx
│   │   ├── dashboard/page.tsx
│   │   ├── candidates/page.tsx
│   │   ├── jobs/page.tsx    ← skeleton cards
│   │   ├── smart-match/page.tsx
│   │   ├── categories/page.tsx
│   │   └── change-password/page.tsx
│   ├── components/
│   │   ├── SmartMatchDashboard.tsx  ← empty state
│   │   ├── CandidateTable.tsx
│   │   ├── CandidateModal.tsx
│   │   ├── DashboardClient.tsx      ← cache Map
│   │   ├── JobsDashboard.tsx
│   │   ├── JobsListDashboard.tsx
│   │   └── ...
│   └── lib/
│       ├── api.ts           ← wrapper fetch + Bearer injection
│       └── auth.ts          ← get/set/clear cookie session
├── next.config.ts           ← security headers + CSP
└── vercel.json              ← cache headers
```

---

## 4. Sistema de Autenticação (após F04)

### Arquitetura Final

```
                     ┌─────────────────────┐
                     │   Navegador          │
                     │   (tlntflow.app)     │
                     │                      │
                     │  Cookie: token       │ ← não-HttpOnly
                     │  Set by setSession() │    para middleware
                     │                      │
                     │  Cookie: token       │ ← HttpOnly; Secure
                     │  Set by API (Set-Cookie) │ para API
                     └──────┬───────────────┘
                            │
              ┌─────────────┴─────────────┐
              │                           │
     ┌────────▼────────┐         ┌────────▼────────┐
     │ Next.js          │         │ FastAPI          │
     │ Middleware        │         │ (Fly.io)         │
     │ (Vercel Edge)    │         │                  │
     │                  │         │ Lê cookie        │
     │ Lê cookie 'token'│         │ HttpOnly da      │
     │ do domínio       │         │ requisição OR    │
     │ tlntflow.app     │         │ Bearer header    │
     └─────────────────┘         └─────────────────┘
```

### Fluxo de Login

1. Usuário preenche email+senha → `apiFetch('/api/auth/login')`
2. API valida credenciais, emite JWT, responde com `Set-Cookie: token=<jwt>; HttpOnly; Secure; SameSite=Lax` + corpo `{ access_token, role, ... }`
3. `setSession(data.access_token, ...)` salva o token também como cookie **não-HttpOnly** no domínio do frontend (para o middleware ler)
4. `window.location.href = '/dashboard'` — hard redirect força o middleware a executar
5. Middleware lê o cookie `token` do domínio do frontend, decodifica JWT, valida `exp`
6. Se válido → renderiza dashboard
7. Se inválido → redireciona para `/login`

### Arquivos-chave

| Arquivo | Função |
|---------|--------|
| `api.ts` | Wrapper `fetch` com `credentials: 'include'` + `Authorization: Bearer` do cookie client-side |
| `auth.ts` | `getSession()`, `setSession()`, `clearSession()` — gerencia cookies do frontend |
| `middleware.ts` | Valida JWT na borda (Edge), redireciona se expirado |
| `api/auth.py` | Endpoints login/register/logout + helper de cookie `HttpOnly` |
| `api/deps.py` | `get_current_user` com fallback: cookie → Bearer header |

---

## 5. Itens de Auditoria Implementados

### Segurança (B01-B10)

| ID | Descrição | Arquivos |
|----|-----------|----------|
| **B01** | Isolamento multi-tenant em queries agregadas | `deps.py`, `dashboard.py`, `candidates.py` |
| **B03** | Rate-limit OTP (5/min) | `public_apply.py` |
| **B04** | Lock assíncrono no sandbox | `sandbox.py` |
| **B05** | Eliminar N+1 em get_candidate_versions | `candidates.py` |
| **B06** | JWT: expiração 4h + claim `iss` | `services/auth.py` |
| **B07** | OTP armazenado com SHA-256 | `public_apply.py` |
| **B08** | Versionamento sincronizado | `config.py` |
| **B09** | Remover import não utilizado | `jobs.py` |
| **B10** | Corrigir shadowing de variável `fallback_db` | `public_apply.py` |

### Frontend & UX (F02-F10)

| ID | Descrição | Arquivos |
|----|-----------|----------|
| **F02** | Security headers (CSP, XFO, HSTS, etc.) | `next.config.ts` |
| **F03** | Cookie `Secure` condicional | `auth.ts` |
| **F04** | Migração auth para HttpOnly cookie | 17 arquivos (api + web) |
| **F05** | `min_length=8` em password fields | `schemas/auth.py` |
| **F06** | Cache de match results no DashboardClient | `DashboardClient.tsx` |
| **F07** | Skeleton cards no Suspense | `jobs/page.tsx`, `smart-match/page.tsx` |
| **F08** | Empty state SmartMatchDashboard | `SmartMatchDashboard.tsx` |
| **F09** | Page titles dinâmicos | `layout.tsx` + 5 pages |
| **F10** | Feedback visual pós-login | `login/page.tsx` |

### DTO & Padronização

| ID | Descrição | Arquivos |
|----|-----------|----------|
| **I03** | `company`→`company_name`, `title`→`job_title`, `desc`→`description` | `candidates.py`, `CandidateTable.tsx`, `CandidateModal.tsx` |

---

## 6. Bugs Identificados e Corrigidos (pós-auditoria)

### Bug 1: `res.json()` duplicado no login
- **Sintoma:** `TypeError` no console após login bem-sucedido
- **Causa:** `apiFetch()` já retorna o dado desserializado, mas `login/page.tsx` chamava `res.json()` novamente
- **Correção:** Remover `const data = await res.json()` e `if (!res.ok)` — o `apiFetch` já lida com ambos
- **Commit:** `6a9099a`

### Bug 2: CHANGELOG com versões mescladas
- **Sintoma:** Conteúdo do `[1.3.0]` foi fundido dentro do `[2.1.0]` e entrada original deletada
- **Causa:** Edição direta na seção ao invés de adicionar nova
- **Correção:** Restaurar `[1.3.0]` imutável; criar `[2.1.0]` apenas com itens novos
- **Commit:** `e912bfa`

### Bug 3: Tela de login travada em "Redirecionando..."
- **Sintoma:** Após login bem-sucedido, usuário vê CheckCircle2 + "Redirecionando..." infinitamente
- **Causa:** Cookie `token` não era salvo no domínio do frontend → Middleware da Vercel não via sessão → redirecionava de volta ao login → estado React `success: true` mantinha a tela travada. Soma-se a isso que `router.push()` não força o middleware a executar (navegação soft).
- **Correção:** `setSession()` agora salva `token` como cookie não-HttpOnly + `window.location.href` para hard redirect
- **Commits:** `367b429`, `2d92fc0`

---

## 7. Histórico de Commits (sessão)

```
2d92fc0 fix(api): inject Authorization Bearer token in apiFetch
367b429 fix(auth): set token cookie in setSession and use hard redirect
e912bfa docs: fix changelog structure - restore 1.3.0, keep 2.1.0
6a9099a fix(web): remove redundant res.json() in login
e9d281e chore: bump version to 2.1.0
f02ff33 fix: sync version to 2.0.0 across API and web
a750cc6 docs: add audit fixes to CHANGELOG v1.3.0
b9ccdb4 feat(web): UX improvements - skeleton, empty state, titles, login
9fb51f1 feat(api+web): migrate auth to HttpOnly cookie (F04)
a826a33 fix(api+web): standardize experience DTO fields (I03)
4cdd74e perf(web): cache match results per job (F06)
33f8317 fix(api): enforce min_length=8 on password fields (F05)
bf7a541 chore(api): sync version and remove unused import (B08+B09)
6ee096e fix(api): tighten JWT expiry to 4h + iss claim (B06)
4f84b48 perf(api): eliminate N+1 query (B05)
7e30ea6 fix(api): add async-safe lock to sandbox (B04)
3c2d024 fix(web): add security headers + Secure cookie flag (F02+F03)
ff5b9dc fix(api): OTP security - rate limit, hash, shadowing (B03+B07+B10)
ab9d7ba fix(api): enforce tenant isolation in queries (B01)
```

---

## 8. Endpoints da API

| Método | Rota | Auth | Descrição |
|--------|------|------|-----------|
| POST | `/api/auth/login` | Não | Login |
| POST | `/api/auth/register` | Não | Cadastro |
| POST | `/api/auth/logout` | Cookie | Logout (limpa cookie) |
| POST | `/api/auth/change-password` | Cookie | Alterar senha |
| GET | `/api/dashboard/stats` | Cookie | Estatísticas do tenant |
| GET | `/api/candidates` | Cookie | Lista candidatos |
| GET | `/api/candidates/:id` | Cookie | Detalhe candidato |
| POST | `/api/candidates/:id/flag` | Cookie | Marcar candidato |
| POST | `/api/candidates/:id/unflag` | Cookie | Desmarcar candidato |
| DELETE | `/api/candidates/:id` | Cookie | Remover candidato |
| GET | `/api/jobs` | Cookie | Lista vagas |
| POST | `/api/jobs` | Cookie | Criar vaga |
| PUT | `/api/jobs/:id` | Cookie | Atualizar vaga |
| DELETE | `/api/jobs/:id` | Cookie | Remover vaga |
| GET | `/api/jobs/:id/match` | Cookie | Smart match |
| GET | `/api/categories` | Cookie | Lista categorias |
| POST | `/api/categories` | Cookie | Criar categoria |
| PUT | `/api/categories/:id` | Cookie | Atualizar categoria |
| DELETE | `/api/categories/:id` | Cookie | Remover categoria |
| POST | `/api/public/apply` | Não | Candidatura pública |
| POST | `/api/public/apply/verify-otp` | Não | Verificar OTP |
| POST | `/api/public/apply/resend-otp` | Não | Reenviar OTP |
| GET | `/api/health` | Não | Health check |

---

## 9. Variáveis de Ambiente

```
# API (.env)
DATABASE_URL=postgresql://...
SECRET_KEY=...
JWT_SECRET_KEY=...
GROQ_API_KEY=...
GEMINI_API_KEY=...
CLOUDINARY_URL=...
STRIPE_SECRET_KEY=...
STRIPE_WEBHOOK_SECRET=...
NEXT_PUBLIC_API_URL=https://talentflow-api.fly.dev

# Web (.env.local)
NEXT_PUBLIC_API_URL=https://talentflow-api.fly.dev
```

---

## 10. Pendências Conhecidas

- [ ] N/A — 0 TODOs, 0 FIXMEs no código

---

## 11. Referências

| Recurso | Local |
|---------|-------|
| Código-fonte | `05-Projetos/talentflow-api/`, `05-Projetos/talentflow-web/` |
| Documentos | `01-Documentos/` |
| Branding | `02-Branding/` |
| Mídia | `03-Midia/` |
| Redes sociais | `04-Social-Media/` |
| Clientes | `06-Clientes/` |
| Changelog | `05-Projetos/CHANGELOG.md` |

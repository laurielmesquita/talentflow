# Graph Report - 05-Projetos  (2026-08-23)

## Corpus Check
- 160 files · ~145,973 words
- Verdict: corpus is large enough that graph structure adds value.

## Summary
- 1041 nodes · 1548 edges · 105 communities (86 shown, 19 thin omitted)
- Extraction: 96% EXTRACTED · 4% INFERRED · 0% AMBIGUOUS · INFERRED: 68 edges (avg confidence: 0.51)
- Token cost: 0 input · 0 output

## Graph Freshness
- Built from commit: `80b83094`
- Run `git rev-parse HEAD` and compare to check if the graph is stale.
- Run `graphify update .` after code changes (no API cost).

## Community Hubs (Navigation)
- candidates.py
- ScopedSession
- apiFetch
- devDependencies
- resolve_job_id
- dependencies
- compilerOptions
- deps.py
- DashboardClient.tsx
- api/auth.py
- components.json
- public_apply.py
- main.py
- app/page.tsx
- JobApplicationForm.tsx
- index.ts
- candidates/page.tsx
- Job
- Navbar.tsx
- services/auth.py
- jobs/page.tsx
- schemas/auth.py
- sandbox.py
- generate-og.js
- CandidateAuditWorkspace.tsx
- layout.tsx
- send_reset_password_email
- generate_slug
- optimize-images.js
- preset-provider.tsx
- ConflictModal.tsx
- PDFViewer.tsx
- button.tsx
- proxy.ts
- jobs/[slug]/page.tsx
- Footer.tsx
- SearchAndFilters.tsx
- Settings
- CandidateCard.tsx
- DeleteConfirmModal.tsx
- SandboxDemo.tsx
- number-ticker.tsx
- shimmer-button.tsx
- shine-border.tsx
- migrate_db_data.py
- eslint.config.mjs
- next.config.ts
- postcss.config.mjs
- design-switcher.tsx
- ThemeProvider.tsx
- vercel.json
- talentflow-api
- BaseModel
- Navbar.tsx
- 2. Padrões por Módulo de Negócio
- Fases de Execução do Review
- Guia de Troubleshooting: Resolução de Tarefas Travadas e `manage_task`
- 2. Padrões por Módulo de Negócio
- vagas/page.tsx
- categories/page.tsx
- Design Presets — Standby Archive
- architecture-review-api.md
- architecture-review-web.md
- [2.2.0] — 2026-08-04
- [2.4.0] — 2026-08-04
- [2.5.0] — 2026-08-17
- test_billing_webhook.py
- SearchAndFilters.tsx
- ThreeOrbBackdrop.tsx
- ApiError
- [1.2.0] — 2026-06-23
- [2.3.0] — 2026-08-04
- DeleteConfirmModal.tsx
- [0.2.0] — 2026-06-17
- [0.3.0] — 2026-06-18
- [0.5.0] — 2026-06-20
- [0.6.0] — 2026-06-20
- [0.9.0] — 2026-06-21
- pre-commit.sh

## God Nodes (most connected - your core abstractions)
1. `ScopedSession` - 47 edges
2. `User` - 38 edges
3. `JobPosition` - 24 edges
4. `apiFetch()` - 23 edges
5. `Candidate` - 22 edges
6. `RoleChecker` - 19 edges
7. `Changelog — TalentFlow` - 19 edges
8. `extract_candidate_from_pdf()` - 18 edges
9. `get_current_user()` - 16 edges
10. `Category` - 16 edges

## Surprising Connections (you probably didn't know these)
- `ReplaceRequest` --uses--> `RoleChecker`  [INFERRED]
  talentflow-api/app/api/candidates.py → talentflow-api/app/api/deps.py
- `ReplaceRequest` --uses--> `ScopedSession`  [INFERRED]
  talentflow-api/app/api/candidates.py → talentflow-api/app/api/deps.py
- `ReplaceRequest` --uses--> `Candidate`  [INFERRED]
  talentflow-api/app/api/candidates.py → talentflow-api/app/models/domain.py
- `ReplaceRequest` --uses--> `Category`  [INFERRED]
  talentflow-api/app/api/candidates.py → talentflow-api/app/models/domain.py
- `ReplaceRequest` --uses--> `JobMatch`  [INFERRED]
  talentflow-api/app/api/candidates.py → talentflow-api/app/models/domain.py

## Import Cycles
- None detected.

## Communities (105 total, 19 thin omitted)

### Community 0 - "candidates.py"
Cohesion: 0.07
Nodes (47): Candidate, extract_resume_sandbox(), BaseModel, Request, UploadFile, SandboxExperience, SandboxResponse, CandidateExtraction (+39 more)

### Community 1 - "ScopedSession"
Cohesion: 0.19
Nodes (19): Base, create_job(), JobCreate, JobUpdate, match_candidates(), BaseModel, update_job(), OTPVerifyRequest (+11 more)

### Community 2 - "apiFetch"
Cohesion: 0.20
Nodes (15): ChangePasswordPage(), LoginContent(), CategoriesDashboard(), Category, UserMenu(), apiFetch(), ApiOptions, AuthSession (+7 more)

### Community 3 - "devDependencies"
Cohesion: 0.06
Nodes (31): eslint, eslint-config-next, jsdom, tailwindcss, @tailwindcss/postcss, devDependencies, eslint, eslint-config-next (+23 more)

### Community 4 - "resolve_job_id"
Cohesion: 0.19
Nodes (23): delete_candidate(), extract_cloudinary_public_id(), flag_candidate(), FlagRequest, get_candidate_pdf(), get_cloudinary_pdf_bytes(), BackgroundTasks, BaseModel (+15 more)

### Community 5 - "dependencies"
Cohesion: 0.05
Nodes (38): @base-ui/react, class-variance-authority, clsx, date-fns, framer-motion, lucide-react, motion, next (+30 more)

### Community 6 - "compilerOptions"
Cohesion: 0.07
Nodes (28): dom, dom.iterable, esnext, **/*.mts, .next/dev/types/**/*.ts, next-env.d.ts, .next/types/**/*.ts, node_modules (+20 more)

### Community 7 - "deps.py"
Cohesion: 0.11
Nodes (20): create_customer_portal_session(), Cria uma sessão no portal do cliente (para gerenciar assinaturas, ver faturas, e, get_current_user(), get_db(), Any, Request, Session, Dependency to get a SQLAlchemy database session. (+12 more)

### Community 8 - "DashboardClient.tsx"
Cohesion: 0.13
Nodes (15): Avatar(), CandidateStats, CategoryStats, container, DashboardClient(), DashboardStats, formatTimeAgo(), getInitials() (+7 more)

### Community 9 - "api/auth.py"
Cohesion: 0.13
Nodes (31): Response, change_password(), forgot_password(), login(), logout(), Request, Session, Redefine a senha do usuário com base no token recebido por e-mail. (+23 more)

### Community 10 - "components.json"
Cohesion: 0.09
Nodes (21): aliases, components, hooks, lib, ui, utils, iconLibrary, menuAccent (+13 more)

### Community 11 - "public_apply.py"
Cohesion: 0.11
Nodes (24): apply_to_job(), _detect_divergences(), _generate_otp(), get_application_status(), BackgroundTasks, Path, Request, Session (+16 more)

### Community 12 - "main.py"
Cohesion: 0.13
Nodes (10): main(), print_report(), Any, run_benchmark(), Testa se o endpoint GET /health responde adequadamente, Testa se o endpoint GET /api/health responde adequadamente, Testa se o endpoint raiz GET / responde com status ok e versão 2.5.0, test_api_health_endpoint() (+2 more)

### Community 13 - "app/page.tsx"
Cohesion: 0.13
Nodes (11): metadata, signals, RevealSection(), RevealSectionProps, RevealVariant, variants, SandboxDemo, SandboxDemoWrapper() (+3 more)

### Community 14 - "JobApplicationForm.tsx"
Cohesion: 0.08
Nodes (21): react, react, getPublicJobs(), metadata, PublicJobsPage(), generateMetadata(), getPublicJob(), PageProps (+13 more)

### Community 15 - "index.ts"
Cohesion: 0.29
Nodes (3): metadata, PageProps, CandidateAuditWorkspaceProps

### Community 16 - "candidates/page.tsx"
Cohesion: 0.17
Nodes (11): CandidatesPage(), metadata, CandidateTable(), getCandidates(), getCategories(), Candidate, CandidatesResponse, CandidateStats (+3 more)

### Community 17 - "Job"
Cohesion: 0.18
Nodes (12): getJobDetail(), JobDetailPage(), PageProps, DashboardClientProps, JobCardProps, JobDetailView(), JobFormDrawer(), JobFormDrawerProps (+4 more)

### Community 18 - "Navbar.tsx"
Cohesion: 0.15
Nodes (5): JobMatchViewer(), Match, MatchResponse, NAV_LINKS, PageHeaderProps

### Community 19 - "services/auth.py"
Cohesion: 0.13
Nodes (16): get_batch_job_status(), get_candidate_versions(), Consulta o estado de processamento de um lote de upload.     Retorna percentual, CategoryCreate, CategoryUpdate, create_category(), delete_category(), list_categories() (+8 more)

### Community 20 - "jobs/page.tsx"
Cohesion: 0.29
Nodes (7): Job, JobsPage(), metadata, Job, metadata, SmartMatchPage(), getJobs()

### Community 21 - "schemas/auth.py"
Cohesion: 0.17
Nodes (11): [0.1.0] — 2026-06-16, [0.4.0] — 2026-06-19, [0.7.0] — 2026-06-21, [0.8.0] — 2026-06-21, [1.0.0] — 2026-06-21, Adicionado, Adicionado, Adicionado (+3 more)

### Community 22 - "sandbox.py"
Cohesion: 0.14
Nodes (17): get_public_job(), list_public_jobs(), Session, Retorna a listagem de todas as vagas ativas no portal público.     Não exige aut, Retorna os detalhes de uma vaga pública específica identificada pelo slug semânt, _serialize_public_job(), PublicJobResponse, BaseModel (+9 more)

### Community 23 - "generate-og.js"
Cohesion: 0.33
Nodes (6): backupDir, brandDir, fs, generateOgImage(), path, sharp

### Community 24 - "CandidateAuditWorkspace.tsx"
Cohesion: 0.05
Nodes (39): 1. Ingestão e Processamento Inteligente de Currículos, 2. Banco de Talentos e Gestão de Candidatos, 3. Gestão de Vagas e Compatibilidade (Smart Match com IA), 4. Arquitetura SaaS Multi-Tenant (B2B), 5. Auditoria Interativa de Currículos (Workspace Side-by-Side), 6. Portal Público de Vagas e Candidatura, 7. Landing Page de Marketing e Captação de Leads, TalentFlow: Funcionalidades e Diferenciais (Visão Comercial) (+31 more)

### Community 25 - "layout.tsx"
Cohesion: 0.25
Nodes (6): Footer, inter, jetbrainsMono, metadata, { version }, ThemeProvider()

### Community 26 - "send_reset_password_email"
Cohesion: 0.07
Nodes (27): 1. Objetivo, 2. Diagnóstico, 3.1 Conceito, 3.2 Estratégia híbrida aprovada, 3.3 Moodboards aprovados, 3. Direção Visual Principal, 3D e motion, 4. O que foi entregue (fundação técnica) (+19 more)

### Community 27 - "generate_slug"
Cohesion: 0.07
Nodes (28): 10. Regras de Modificação, 1. Visão Geral do Serviço, 2. Estrutura de Diretórios, 3.1 Multi-Tenancy, 3.2 Concorrência, 3.3 Autenticação (Dual-Cookie), 3.4 N+1 Queries, 3. Princípios de Arquitetura — NUNCA Violar (+20 more)

### Community 28 - "optimize-images.js"
Cohesion: 0.40
Nodes (5): brandDir, fs, optimizeImages(), path, sharp

### Community 29 - "preset-provider.tsx"
Cohesion: 0.18
Nodes (14): get_dashboard_stats(), Factory de dependência FastAPI que verifica se o tenant do usuário logado tem ac, require_feature(), delete_job(), get_job(), list_jobs(), _serialize_job(), JobResponse (+6 more)

### Community 30 - "ConflictModal.tsx"
Cohesion: 0.24
Nodes (9): get_candidate(), list_candidates(), Lista candidatos com filtros de categoria e busca textual (nome, skills, cargo,, Testa se a listagem de candidatos inclui original_pdf_url e pdf_url em cada item, Testa se o detalhe do candidato retorna os campos pdf_url e original_pdf_url cor, test_get_candidate_returns_original_pdf_url(), test_list_candidates_includes_original_pdf_url(), test_candidate_from_another_tenant_is_not_found() (+1 more)

### Community 31 - "PDFViewer.tsx"
Cohesion: 0.50
Nodes (3): getCookie(), PDFViewer(), PDFViewerProps

### Community 32 - "button.tsx"
Cohesion: 0.23
Nodes (9): Button(), buttonVariants, NumberTicker(), NumberTickerProps, ShimmerButton, ShimmerButtonProps, ShineBorder(), ShineBorderProps (+1 more)

### Community 33 - "proxy.ts"
Cohesion: 0.70
Nodes (4): decodeJwt(), middleware(), proxy(), PUBLIC_ROUTES

### Community 34 - "jobs/[slug]/page.tsx"
Cohesion: 0.07
Nodes (26): 10. Deploy, 11. Regras de Modificação, 1. Visão Geral do Serviço, 2. Estrutura de Diretórios, 3. Design System — Tailwind CSS v4 + OKLCH, 4. Arquitetura de Componentes, 5. Autenticação no Frontend, 6. Setup de Desenvolvimento Local (+18 more)

### Community 36 - "SearchAndFilters.tsx"
Cohesion: 0.25
Nodes (9): check_feature_access(), get_plan_features(), Any, Verifica se o plano especificado possui acesso à feature solicitada., Retorna o mapa de recursos e feature flags disponíveis para o plano do tenant., Testa a checagem booleana de acesso às features por plano, Testa se get_plan_features retorna o mapa correto para planos Free, Pro e Enterp, test_check_feature_access() (+1 more)

### Community 54 - "CandidateCard.tsx"
Cohesion: 0.29
Nodes (6): API — segurança e confiabilidade, Decisões e limites, Objetivo, Registro de evolução — Hardening e consolidação, Validação prevista, Web — consolidação estrutural

### Community 57 - "number-ticker.tsx"
Cohesion: 0.13
Nodes (14): 1. Visão Geral da Pipeline de CI/CD, 2. Passo a Passo Completo para Salvar & Subir Alterações (Git Workflow), 3. Monitoramento dos Deploys em Produção, 4. Deploys Manuais de Emergência (Se a pipeline falhar), 5. Padrão de Mensagens de Commit (Conventional Commits), A. Deploy Manual do Backend (Fly.io), A. Frontend (Vercel), B. Backend (Fly.io) (+6 more)

### Community 58 - "shimmer-button.tsx"
Cohesion: 0.13
Nodes (14): 1. Requisitos, 1. Stack Base, 2. Configurando o Ambiente, 2. Ingestão de Dados e IA, 3. Gerenciamento com `uv` (PEP 621), 4. Executando a Bateria de Testes Automatizados (`pytest`), 5. Executando as Migrações, 6. Executando o Servidor Localmente (+6 more)

### Community 59 - "shine-border.tsx"
Cohesion: 0.31
Nodes (9): process_batch_uploads_task(), process_single_file(), Path, Atualiza com segurança o progresso de um BatchJob.     Trabalha com uma nova ses, Executa a extração síncrona de um PDF e persiste no banco de dados.     Verifica, Envolve a execução da extração síncrona dentro do semáforo global     e executa, Task de Background que consome arquivos do lote de forma sequencial,     garanti, run_extraction_and_save() (+1 more)

### Community 62 - "migrate_db_data.py"
Cohesion: 0.33
Nodes (6): create_checkout_session(), Request, Session, Cria uma sessão de checkout no Stripe para o plano escolhido., Recebe eventos assíncronos do Stripe (assinatura criada, cancelada, falha no pag, stripe_webhook()

### Community 70 - "design-switcher.tsx"
Cohesion: 0.40
Nodes (5): generate_slug(), Session, Gera um slug único global para uma vaga a partir do seu título.     Caso o slug, Gera um slug URL-friendly a partir de uma string de texto.     Normaliza acentos, slugify()

### Community 71 - "ThemeProvider.tsx"
Cohesion: 0.17
Nodes (11): 1. Instalação de Dependências, 1. Stack Base, 2. Camadas de Engenharia (`src/`), 2. Executando o Servidor de Desenvolvimento, 3. Build de Produção, 🏗 Arquitetura e Engenharia de Frontend, 🚢 Deploy, 🚀 Guia de Desenvolvimento (Setup Local) (+3 more)

### Community 74 - "BaseModel"
Cohesion: 0.24
Nodes (9): CandidateStats, CategoryStats, DashboardPage(), DashboardStats, getJobs(), getStats(), JobStats, metadata (+1 more)

### Community 76 - "Navbar.tsx"
Cohesion: 0.40
Nodes (4): downgrade(), Upgrade schema: substitui indice global por indice composto por tenant., Downgrade schema: restaura indice global (nao recomendado)., upgrade()

### Community 77 - "2. Padrões por Módulo de Negócio"
Cohesion: 0.25
Nodes (7): 1. Filosofia Visual, 2. Padrões por Módulo de Negócio, 3. Animações e Microinterações, A. Gestão de Candidatos & Kanban (`/candidates`), B. Smart Match & Inteligência Artificial (`/smart-match`), C. Dashboard & Tabelas (`/dashboard`, `/jobs`), Sistema de Design & UX - TalentFlow (ATS & AI Recruitment Platform)

### Community 78 - "Fases de Execução do Review"
Cohesion: 0.20
Nodes (7): Directriz de Validação, Fase 1: Síntese e Extração de Apontamentos, Fase 2: Auditoria Cruzada com o Codebase Real, Fase 3: Matriz de Priorização e ROI Técnico, Fase 4: Apresentação Executiva & Alinhamento de Decisões, Fases de Execução do Review, Plano de Ação: Review Estruturado de Arquitetura (TalentFlow API & Web)

### Community 79 - "Guia de Troubleshooting: Resolução de Tarefas Travadas e `manage_task`"
Cohesion: 0.25
Nodes (7): 1. O Que É o `manage_task`, 2. Diagnóstico Técnico do Travamento na UI, 3. Como Solicitar a Limpeza ao Agente, 4. Fluxo de Execução Interno do Agente, Causa Raiz, Guia de Troubleshooting: Resolução de Tarefas Travadas e `manage_task`, Prompts Recomendados:

### Community 80 - "2. Padrões por Módulo de Negócio"
Cohesion: 0.25
Nodes (7): 1. Filosofia Visual, 2. Padrões por Módulo de Negócio, 3. Animações e Microinterações, A. Gestão de Candidatos & Kanban (`/candidates`), B. Smart Match & Inteligência Artificial (`/smart-match`), C. Dashboard & Tabelas (`/dashboard`, `/jobs`), Sistema de Design & UX - TalentFlow (ATS & AI Recruitment Platform)

### Community 81 - "vagas/page.tsx"
Cohesion: 0.50
Nodes (4): [1.1.0] — 2026-06-22, Adicionado, Corrigido, Modificado

### Community 82 - "categories/page.tsx"
Cohesion: 0.50
Nodes (4): CategoriesPage(), Category, getCategories(), metadata

### Community 83 - "Design Presets — Standby Archive"
Cohesion: 0.50
Nodes (3): 🔄 Como Reativar o Design Presets no Futuro, Design Presets — Standby Archive, 📁 Estrutura dos Arquivos em Standby

### Community 85 - "architecture-review-api.md"
Cohesion: 0.50
Nodes (4): [1.3.0] — 2026-06-24, Adicionado, Corrigido, Modificado

### Community 86 - "architecture-review-web.md"
Cohesion: 0.50
Nodes (4): [2.1.0] — 2026-07-20, Adicionado, Corrigido, Modificado

### Community 88 - "[2.2.0] — 2026-08-04"
Cohesion: 0.50
Nodes (4): [2.2.0] — 2026-08-04, Adicionado, Corrigido, Modificado

### Community 89 - "[2.4.0] — 2026-08-04"
Cohesion: 0.50
Nodes (4): [2.4.0] — 2026-08-04, Adicionado, Corrigido, Modificado

### Community 90 - "[2.5.0] — 2026-08-17"
Cohesion: 0.50
Nodes (4): [2.5.0] — 2026-08-17, Adicionado, Corrigido, Modificado

### Community 91 - "test_billing_webhook.py"
Cohesion: 0.83
Nodes (3): _request(), test_checkout_webhook_updates_tenant_and_is_idempotent(), test_webhook_is_unavailable_without_secret()

### Community 95 - "[1.2.0] — 2026-06-23"
Cohesion: 0.67
Nodes (3): [1.2.0] — 2026-06-23, Adicionado, Corrigido

### Community 96 - "[2.3.0] — 2026-08-04"
Cohesion: 0.67
Nodes (3): [2.3.0] — 2026-08-04, Adicionado, Modificado

## Knowledge Gaps
- **347 isolated node(s):** `pre-commit.sh script`, `talentflow-api`, `$schema`, `style`, `rsc` (+342 more)
  These have ≤1 connection - possible missing edges or undocumented components.
- **19 thin communities (<3 nodes) omitted from report** — run `graphify query` to explore isolated nodes.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **Why does `ThemeToggle()` connect `JobApplicationForm.tsx` to `apiFetch`, `Navbar.tsx`?**
  _High betweenness centrality (0.034) - this node is a cross-community bridge._
- **Why does `dependencies` connect `dependencies` to `JobApplicationForm.tsx`?**
  _High betweenness centrality (0.032) - this node is a cross-community bridge._
- **Why does `react` connect `JobApplicationForm.tsx` to `dependencies`?**
  _High betweenness centrality (0.029) - this node is a cross-community bridge._
- **Are the 7 inferred relationships involving `ScopedSession` (e.g. with `FlagRequest` and `ReplaceRequest`) actually correct?**
  _`ScopedSession` has 7 INFERRED edges - model-reasoned connections that need verification._
- **Are the 8 inferred relationships involving `User` (e.g. with `FlagRequest` and `ReplaceRequest`) actually correct?**
  _`User` has 8 INFERRED edges - model-reasoned connections that need verification._
- **Are the 4 inferred relationships involving `JobPosition` (e.g. with `JobCreate` and `JobUpdate`) actually correct?**
  _`JobPosition` has 4 INFERRED edges - model-reasoned connections that need verification._
- **Are the 6 inferred relationships involving `Candidate` (e.g. with `FlagRequest` and `ReplaceRequest`) actually correct?**
  _`Candidate` has 6 INFERRED edges - model-reasoned connections that need verification._
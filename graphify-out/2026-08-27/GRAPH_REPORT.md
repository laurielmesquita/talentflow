# Graph Report - 05-Projetos  (2026-08-26)

## Corpus Check
- 197 files · ~155,419 words
- Verdict: corpus is large enough that graph structure adds value.

## Summary
- 1239 nodes · 1985 edges · 119 communities (104 shown, 15 thin omitted)
- Extraction: 96% EXTRACTED · 4% INFERRED · 0% AMBIGUOUS · INFERRED: 82 edges (avg confidence: 0.52)
- Token cost: 0 input · 0 output

## Graph Freshness
- Built from commit: `6196c30a`
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
- save_candidate_to_db
- [0.5.0] — 2026-06-20
- [0.6.0] — 2026-06-20
- [0.9.0] — 2026-06-21
- pre-commit.sh
- 6c1d2e3f4a50_backfill_missing_tenant_owner.py
- [2.5.1] — 2026-08-25
- [2.6.0] — 2026-08-26
- start-render.sh
- HeroVisual.tsx
- [0.9.0] — 2026-06-21
- [Unreleased]
- [1.0.0] — 2026-06-21

## God Nodes (most connected - your core abstractions)
1. `User` - 65 edges
2. `ScopedSession` - 55 edges
3. `apiFetch()` - 30 edges
4. `JobPosition` - 26 edges
5. `Candidate` - 24 edges
6. `Changelog — TalentFlow` - 22 edges
7. `RoleChecker` - 20 edges
8. `Tenant` - 18 edges
9. `Category` - 18 edges
10. `extract_candidate_from_pdf()` - 18 edges

## Surprising Connections (you probably didn't know these)
- `ReplaceRequest` --uses--> `RoleChecker`  [INFERRED]
  talentflow-api/app/api/candidates.py → talentflow-api/app/api/deps.py
- `ReplaceRequest` --uses--> `ScopedSession`  [INFERRED]
  talentflow-api/app/api/candidates.py → talentflow-api/app/api/deps.py
- `ReplaceRequest` --uses--> `User`  [INFERRED]
  talentflow-api/app/api/candidates.py → talentflow-api/app/models/domain.py
- `ReplaceRequest` --uses--> `CandidateExtraction`  [INFERRED]
  talentflow-api/app/api/candidates.py → talentflow-api/app/schemas/extraction.py
- `ReplaceRequest` --uses--> `ExperienceItem`  [INFERRED]
  talentflow-api/app/api/candidates.py → talentflow-api/app/schemas/extraction.py

## Import Cycles
- None detected.

## Communities (119 total, 15 thin omitted)

### Community 0 - "candidates.py"
Cohesion: 0.12
Nodes (29): upload_resume(), _detect_divergences(), TalentFlow — Public Apply Router (Step 6)  Endpoints públicos para o fluxo de ca, Compara os dados submetidos pelo candidato no formulário com os extraídos pelo G, Tarefa de background: extrai o PDF com Gemini, calcula quality score,     detect, _run_ai_pipeline_background(), calculate_file_hash(), _cleanup() (+21 more)

### Community 1 - "ScopedSession"
Cohesion: 0.24
Nodes (18): Base, flag_candidate(), FlagRequest, BaseModel, ReplaceRequest, AuditLog, BatchJob, Candidate (+10 more)

### Community 2 - "apiFetch"
Cohesion: 0.18
Nodes (16): LoginContent(), ConfirmEmailPage(), UsersPage(), CategoriesDashboard(), Category, UserMenu(), apiFetch(), ApiOptions (+8 more)

### Community 3 - "devDependencies"
Cohesion: 0.06
Nodes (31): eslint, eslint-config-next, jsdom, tailwindcss, @tailwindcss/postcss, devDependencies, eslint, eslint-config-next (+23 more)

### Community 4 - "resolve_job_id"
Cohesion: 0.13
Nodes (22): delete_candidate(), extract_cloudinary_public_id(), get_batch_job_status(), get_candidate_pdf(), get_cloudinary_pdf_bytes(), process_batch_uploads_task(), process_single_file(), BackgroundTasks (+14 more)

### Community 5 - "dependencies"
Cohesion: 0.05
Nodes (38): @base-ui/react, class-variance-authority, clsx, date-fns, framer-motion, lucide-react, motion, next (+30 more)

### Community 6 - "compilerOptions"
Cohesion: 0.07
Nodes (28): dom, dom.iterable, esnext, **/*.mts, .next/dev/types/**/*.ts, next-env.d.ts, .next/types/**/*.ts, node_modules (+20 more)

### Community 7 - "deps.py"
Cohesion: 0.17
Nodes (9): emptyForm, ManagedUser, UserRole, CandidateTable(), DeleteConfirmModal(), DeleteConfirmModalProps, Dialog(), DialogProps (+1 more)

### Community 8 - "DashboardClient.tsx"
Cohesion: 0.13
Nodes (15): Avatar(), CandidateStats, CategoryStats, container, DashboardClient(), DashboardStats, formatTimeAgo(), getInitials() (+7 more)

### Community 9 - "api/auth.py"
Cohesion: 0.07
Nodes (53): Response, change_password(), confirm_email_change(), export_personal_data(), forgot_password(), get_profile(), login(), logout() (+45 more)

### Community 10 - "components.json"
Cohesion: 0.09
Nodes (21): aliases, components, hooks, lib, ui, utils, iconLibrary, menuAccent (+13 more)

### Community 11 - "public_apply.py"
Cohesion: 0.14
Nodes (15): apply_to_job(), _generate_otp(), get_application_status(), OTPVerifyRequest, BackgroundTasks, BaseModel, Path, Request (+7 more)

### Community 12 - "main.py"
Cohesion: 0.13
Nodes (10): main(), print_report(), Any, run_benchmark(), Testa se o endpoint GET /health responde adequadamente, Testa se o endpoint GET /api/health responde adequadamente, Testa se o endpoint raiz GET / responde com status ok e versão 2.6.0, test_api_health_endpoint() (+2 more)

### Community 13 - "app/page.tsx"
Cohesion: 0.24
Nodes (6): metadata, SandboxDemo, SandboxDemoWrapper(), ScrollToTop(), ThreeOrbBackdrop, ThreeOrbBackdropDynamic()

### Community 14 - "JobApplicationForm.tsx"
Cohesion: 0.33
Nodes (6): react, react, getClientSnapshot(), getServerSnapshot(), subscribe(), ThemeToggle()

### Community 15 - "index.ts"
Cohesion: 0.22
Nodes (6): ClosureState, ClosureStatus, formatDate(), ManagedUser, OrganizationPage(), ApiError

### Community 16 - "candidates/page.tsx"
Cohesion: 0.09
Nodes (15): CandidatesPage(), metadata, metadata, PageProps, CandidateAuditWorkspaceProps, Category, SearchAndFiltersProps, getCandidates() (+7 more)

### Community 17 - "Job"
Cohesion: 0.14
Nodes (20): Candidate, replace_candidate(), CandidateExtraction, ExperienceItem, BaseModel, _alert(), calculate_quality_score(), TalentFlow — CV Quality Score Engine (v1.0)  Responsabilidade única: calcular a (+12 more)

### Community 18 - "Navbar.tsx"
Cohesion: 0.13
Nodes (6): AppShellProps, JobMatchViewer(), Match, MatchResponse, NAV_LINKS, PageHeaderProps

### Community 19 - "services/auth.py"
Cohesion: 0.06
Nodes (37): create_checkout_session(), create_customer_portal_session(), Request, Session, Cria uma sessão de checkout no Stripe para o plano escolhido., Cria uma sessão no portal do cliente (para gerenciar assinaturas, ver faturas, e, Recebe eventos assíncronos do Stripe (assinatura criada, cancelada, falha no pag, stripe_webhook() (+29 more)

### Community 20 - "jobs/page.tsx"
Cohesion: 0.29
Nodes (7): Job, JobsPage(), metadata, Job, metadata, SmartMatchPage(), getJobs()

### Community 21 - "schemas/auth.py"
Cohesion: 0.12
Nodes (15): [0.1.0] — 2026-06-16, [0.2.0] — 2026-06-17, [0.3.0] — 2026-06-18, [0.4.0] — 2026-06-19, [0.5.0] — 2026-06-20, [0.7.0] — 2026-06-21, [0.8.0] — 2026-06-21, Adicionado (+7 more)

### Community 22 - "sandbox.py"
Cohesion: 0.12
Nodes (22): datetime, extract_resume_sandbox(), BaseModel, Request, UploadFile, SandboxExperience, SandboxResponse, _cloudinary_assets() (+14 more)

### Community 23 - "generate-og.js"
Cohesion: 0.33
Nodes (6): backupDir, brandDir, fs, generateOgImage(), path, sharp

### Community 24 - "CandidateAuditWorkspace.tsx"
Cohesion: 0.04
Nodes (41): 1. Ingestão e Processamento Inteligente de Currículos, 2. Banco de Talentos e Gestão de Candidatos, 3. Gestão de Vagas e Compatibilidade (Smart Match com IA), 4. Arquitetura SaaS Multi-Tenant (B2B), 5. Auditoria Interativa de Currículos (Workspace Side-by-Side), 6. Portal Público de Vagas e Candidatura, 7. Landing Page de Marketing e Captação de Leads, TalentFlow: Funcionalidades e Diferenciais (Visão Comercial) (+33 more)

### Community 25 - "layout.tsx"
Cohesion: 0.25
Nodes (6): Footer, inter, jetbrainsMono, metadata, { version }, ThemeProvider()

### Community 26 - "send_reset_password_email"
Cohesion: 0.07
Nodes (27): 1. Objetivo, 2. Diagnóstico, 3.1 Conceito, 3.2 Estratégia híbrida aprovada, 3.3 Moodboards aprovados, 3. Direção Visual Principal, 3D e motion, 4. O que foi entregue (fundação técnica) (+19 more)

### Community 27 - "generate_slug"
Cohesion: 0.06
Nodes (30): 10. Regras de Modificação, 1. Visão Geral do Serviço, 2. Estrutura de Diretórios, 3.1 Multi-Tenancy, 3.2 Concorrência, 3.3 Autenticação (Dual-Cookie), 3.4 N+1 Queries, 3. Princípios de Arquitetura — NUNCA Violar (+22 more)

### Community 28 - "optimize-images.js"
Cohesion: 0.40
Nodes (5): brandDir, fs, optimizeImages(), path, sharp

### Community 29 - "preset-provider.tsx"
Cohesion: 0.28
Nodes (8): get_candidate(), list_candidates(), UUID, Lista candidatos com filtros de categoria e busca textual (nome, skills, cargo,, Testa se a listagem de candidatos inclui original_pdf_url e pdf_url em cada item, Testa se o detalhe do candidato retorna os campos pdf_url e original_pdf_url cor, test_get_candidate_returns_original_pdf_url(), test_list_candidates_includes_original_pdf_url()

### Community 31 - "PDFViewer.tsx"
Cohesion: 0.21
Nodes (22): _active_manager_count(), create_user(), deactivate_user(), _get_user_or_404(), list_users(), _protect_last_manager(), _protect_owner(), _protect_super_admin_grant() (+14 more)

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
Cohesion: 0.17
Nodes (14): get_candidate_versions(), unflag_candidate(), CategoryCreate, CategoryUpdate, create_category(), delete_category(), list_categories(), BaseModel (+6 more)

### Community 54 - "CandidateCard.tsx"
Cohesion: 0.29
Nodes (6): API — segurança e confiabilidade, Decisões e limites, Objetivo, Registro de evolução — Hardening e consolidação, Validação prevista, Web — consolidação estrutural

### Community 55 - "DeleteConfirmModal.tsx"
Cohesion: 0.14
Nodes (13): getJobDetail(), JobDetailPage(), PageProps, BatchUploadButtonProps, UploadStatus, DashboardClientProps, JobCardProps, JobDetailView() (+5 more)

### Community 57 - "number-ticker.tsx"
Cohesion: 0.12
Nodes (15): 1. Visão Geral da Pipeline de CI/CD, 2. Passo a Passo Completo para Salvar & Subir Alterações (Git Workflow), 3. Monitoramento dos Deploys em Produção, 4. Deploys Manuais de Emergência (Se a pipeline falhar), 5. Padrão de Mensagens de Commit (Conventional Commits), A. Deploy Manual do Backend fallback (Fly.io), A. Frontend (Vercel), B. Backend principal (Render Free) (+7 more)

### Community 58 - "shimmer-button.tsx"
Cohesion: 0.06
Nodes (29): Contexto, Decisão de rollout, Implementação registrada, Incidentes e correções, Próximos passos, Registro de mudança — Migração da API para Render Free, Validação realizada, Configuração (+21 more)

### Community 59 - "shine-border.tsx"
Cohesion: 0.28
Nodes (20): cancel_closure(), get_closure_status(), _get_current_tenant(), request_closure(), _require_owner(), transfer_owner(), BaseModel, TenantClosureRequest (+12 more)

### Community 62 - "migrate_db_data.py"
Cohesion: 0.07
Nodes (45): get_dashboard_stats(), create_job(), delete_job(), get_job(), JobCreate, JobUpdate, list_jobs(), match_candidates() (+37 more)

### Community 70 - "design-switcher.tsx"
Cohesion: 0.33
Nodes (3): EmptyStateProps, PageSkeleton(), PageSkeletonProps

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
Cohesion: 0.22
Nodes (8): 1. Filosofia Visual, 2. Padrões por Módulo de Negócio, 3. Animações e Microinterações, 4. Primitivos compartilhados, A. Gestão de Candidatos & Kanban (`/candidates`), B. Smart Match & Inteligência Artificial (`/smart-match`), C. Dashboard & Tabelas (`/dashboard`, `/jobs`), Sistema de Design & UX - TalentFlow (ATS & AI Recruitment Platform)

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

### Community 92 - "SearchAndFilters.tsx"
Cohesion: 0.25
Nodes (6): FieldError, FormData, JobApplicationForm(), JobApplicationFormProps, Step, validateForm()

### Community 94 - "ApiError"
Cohesion: 0.13
Nodes (10): Preferences, messageFor(), Profile, SettingsProfilePage(), JobsListDashboard(), icons, StatusMessageProps, StatusTone (+2 more)

### Community 95 - "[1.2.0] — 2026-06-23"
Cohesion: 0.67
Nodes (3): [1.2.0] — 2026-06-23, Adicionado, Corrigido

### Community 96 - "[2.3.0] — 2026-08-04"
Cohesion: 0.50
Nodes (3): getCookie(), PDFViewer(), PDFViewerProps

### Community 98 - "DeleteConfirmModal.tsx"
Cohesion: 0.38
Nodes (3): items, SettingsNavigation(), SettingsShell()

### Community 99 - "[0.2.0] — 2026-06-17"
Cohesion: 0.32
Nodes (5): generateMetadata(), getPublicJob(), PageProps, PublicJobPage(), PublicJobDetailProps

### Community 101 - "[0.5.0] — 2026-06-20"
Cohesion: 0.33
Nodes (4): getPublicJobs(), metadata, PublicJobsPage(), PublicJob

### Community 102 - "[0.6.0] — 2026-06-20"
Cohesion: 0.40
Nodes (4): RevealSection(), RevealSectionProps, RevealVariant, variants

### Community 103 - "[0.9.0] — 2026-06-21"
Cohesion: 0.67
Nodes (3): [2.3.0] — 2026-08-04, Adicionado, Modificado

### Community 105 - "6c1d2e3f4a50_backfill_missing_tenant_owner.py"
Cohesion: 0.40
Nodes (4): downgrade(), Repair only tenants that do not have an explicit owner yet., Do not remove ownership data during a schema rollback., upgrade()

### Community 106 - "[2.5.1] — 2026-08-25"
Cohesion: 0.50
Nodes (4): [2.5.1] — 2026-08-25, Adicionado, Corrigido, Validado

### Community 107 - "[2.6.0] — 2026-08-26"
Cohesion: 0.67
Nodes (3): [2.6.0] — 2026-08-26, Adicionado, Segurança

### Community 115 - "[Unreleased]"
Cohesion: 0.40
Nodes (5): Administração organizacional, Configurações de conta, Fundação UX/UI, Preparação do encerramento de organização, [Unreleased]

## Knowledge Gaps
- **393 isolated node(s):** `pre-commit.sh script`, `talentflow-api`, `start-render.sh script`, `$schema`, `style` (+388 more)
  These have ≤1 connection - possible missing edges or undocumented components.
- **15 thin communities (<3 nodes) omitted from report** — run `graphify query` to explore isolated nodes.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **Why does `ThemeToggle()` connect `JobApplicationForm.tsx` to `Navbar.tsx`?**
  _High betweenness centrality (0.034) - this node is a cross-community bridge._
- **Why does `dependencies` connect `dependencies` to `JobApplicationForm.tsx`?**
  _High betweenness centrality (0.032) - this node is a cross-community bridge._
- **Why does `react` connect `JobApplicationForm.tsx` to `dependencies`?**
  _High betweenness centrality (0.028) - this node is a cross-community bridge._
- **Are the 9 inferred relationships involving `User` (e.g. with `FlagRequest` and `ReplaceRequest`) actually correct?**
  _`User` has 9 INFERRED edges - model-reasoned connections that need verification._
- **Are the 7 inferred relationships involving `ScopedSession` (e.g. with `FlagRequest` and `ReplaceRequest`) actually correct?**
  _`ScopedSession` has 7 INFERRED edges - model-reasoned connections that need verification._
- **Are the 5 inferred relationships involving `JobPosition` (e.g. with `JobCreate` and `JobUpdate`) actually correct?**
  _`JobPosition` has 5 INFERRED edges - model-reasoned connections that need verification._
- **Are the 7 inferred relationships involving `Candidate` (e.g. with `FlagRequest` and `ReplaceRequest`) actually correct?**
  _`Candidate` has 7 INFERRED edges - model-reasoned connections that need verification._
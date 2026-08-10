# Graph Report - 05-Projetos  (2026-08-10)

## Corpus Check
- 159 files · ~122,405 words
- Verdict: corpus is large enough that graph structure adds value.

## Summary
- 1027 nodes · 1492 edges · 88 communities (80 shown, 8 thin omitted)
- Extraction: 96% EXTRACTED · 4% INFERRED · 0% AMBIGUOUS · INFERRED: 58 edges (avg confidence: 0.52)
- Token cost: 0 input · 0 output

## Graph Freshness
- Built from commit: `c9a39410`
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
- DeleteConfirmModal.tsx
- SandboxDemo.tsx
- number-ticker.tsx
- shimmer-button.tsx
- shine-border.tsx
- eslint.config.mjs
- next.config.ts
- postcss.config.mjs
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

## God Nodes (most connected - your core abstractions)
1. `ScopedSession` - 44 edges
2. `User` - 32 edges
3. `apiFetch()` - 28 edges
4. `JobPosition` - 23 edges
5. `Candidate` - 19 edges
6. `Plano de Redesign — TalentFlow` - 19 edges
7. `extract_candidate_from_pdf()` - 18 edges
8. `Changelog — TalentFlow` - 18 edges
9. `compilerOptions` - 16 edges
10. `Category` - 15 edges

## Surprising Connections (you probably didn't know these)
- `ReplaceRequest` --uses--> `ScopedSession`  [INFERRED]
  talentflow-api/app/api/candidates.py → talentflow-api/app/api/deps.py
- `ReplaceRequest` --uses--> `Candidate`  [INFERRED]
  talentflow-api/app/api/candidates.py → talentflow-api/app/models/domain.py
- `ReplaceRequest` --uses--> `Category`  [INFERRED]
  talentflow-api/app/api/candidates.py → talentflow-api/app/models/domain.py
- `ReplaceRequest` --uses--> `JobMatch`  [INFERRED]
  talentflow-api/app/api/candidates.py → talentflow-api/app/models/domain.py
- `ReplaceRequest` --uses--> `Skill`  [INFERRED]
  talentflow-api/app/api/candidates.py → talentflow-api/app/models/domain.py

## Import Cycles
- None detected.

## Communities (88 total, 8 thin omitted)

### Community 0 - "candidates.py"
Cohesion: 0.13
Nodes (27): upload_resume(), Tarefa de background: extrai o PDF com Gemini, calcula quality score,     detect, _run_ai_pipeline_background(), calculate_file_hash(), _cleanup(), _configure_cloudinary(), extract_and_upload_photo(), extract_candidate_from_pdf() (+19 more)

### Community 1 - "ScopedSession"
Cohesion: 0.06
Nodes (54): Base, list_candidates(), Lista candidatos com filtros de categoria e busca textual (nome, skills, cargo,, create_job(), get_job(), JobCreate, JobUpdate, list_jobs() (+46 more)

### Community 2 - "apiFetch"
Cohesion: 0.16
Nodes (17): LoginContent(), CategoriesDashboard(), Category, JobDetailView(), JobFormDrawer(), JobsDashboard(), JobsListDashboard(), LogoutButton() (+9 more)

### Community 3 - "devDependencies"
Cohesion: 0.05
Nodes (38): eslint, eslint-config-next, jsdom, tailwindcss, @tailwindcss/postcss, devDependencies, eslint, eslint-config-next (+30 more)

### Community 4 - "resolve_job_id"
Cohesion: 0.23
Nodes (19): delete_candidate(), extract_cloudinary_public_id(), flag_candidate(), FlagRequest, get_batch_job_status(), get_candidate(), get_candidate_pdf(), get_cloudinary_pdf_bytes() (+11 more)

### Community 5 - "dependencies"
Cohesion: 0.07
Nodes (29): @base-ui/react, class-variance-authority, clsx, date-fns, framer-motion, lucide-react, motion, next (+21 more)

### Community 6 - "compilerOptions"
Cohesion: 0.07
Nodes (28): dom, dom.iterable, esnext, **/*.mts, .next/dev/types/**/*.ts, next-env.d.ts, .next/types/**/*.ts, node_modules (+20 more)

### Community 7 - "deps.py"
Cohesion: 0.08
Nodes (25): create_checkout_session(), create_customer_portal_session(), Request, Session, Cria uma sessão de checkout no Stripe para o plano escolhido., Cria uma sessão no portal do cliente (para gerenciar assinaturas, ver faturas, e, Recebe eventos assíncronos do Stripe (assinatura criada, cancelada, falha no pag, stripe_webhook() (+17 more)

### Community 8 - "DashboardClient.tsx"
Cohesion: 0.12
Nodes (16): Avatar(), CandidateStats, CategoryStats, container, DashboardClient(), DashboardClientProps, DashboardStats, formatTimeAgo() (+8 more)

### Community 9 - "api/auth.py"
Cohesion: 0.13
Nodes (30): Response, change_password(), forgot_password(), login(), logout(), Session, Permite ao usuário autenticado alterar sua própria senha., Registra uma nova empresa (Tenant) e o usuário administrador principal dela. (+22 more)

### Community 10 - "components.json"
Cohesion: 0.09
Nodes (21): aliases, components, hooks, lib, ui, utils, iconLibrary, menuAccent (+13 more)

### Community 11 - "public_apply.py"
Cohesion: 0.11
Nodes (22): apply_to_job(), _detect_divergences(), _generate_otp(), get_application_status(), BackgroundTasks, Path, Request, Session (+14 more)

### Community 12 - "main.py"
Cohesion: 0.13
Nodes (10): main(), print_report(), Any, run_benchmark(), Testa se o endpoint GET /health responde adequadamente, Testa se o endpoint GET /api/health responde adequadamente, Testa se o endpoint raiz GET / responde com status ok e versão 2.4.0, test_api_health_endpoint() (+2 more)

### Community 13 - "app/page.tsx"
Cohesion: 0.18
Nodes (7): metadata, signals, RevealSection(), RevealSectionProps, SandboxDemo, SandboxDemoWrapper(), ScrollToTop()

### Community 14 - "JobApplicationForm.tsx"
Cohesion: 0.14
Nodes (11): generateMetadata(), getPublicJob(), PageProps, PublicJobPage(), FieldError, FormData, JobApplicationForm(), JobApplicationFormProps (+3 more)

### Community 15 - "index.ts"
Cohesion: 0.12
Nodes (8): metadata, PageProps, CandidateAuditWorkspaceProps, CandidateTable(), DeleteConfirmModalProps, Candidate, CandidateStats, Experience

### Community 16 - "candidates/page.tsx"
Cohesion: 0.15
Nodes (11): Candidate, CandidatesPage(), CandidatesResponse, Category, metadata, Category, SearchAndFiltersProps, getCandidates() (+3 more)

### Community 17 - "Job"
Cohesion: 0.19
Nodes (7): getJobDetail(), JobDetailPage(), PageProps, JobCardProps, JobFormDrawerProps, Job, JobFormData

### Community 18 - "Navbar.tsx"
Cohesion: 0.40
Nodes (3): JobMatchViewer(), Match, MatchResponse

### Community 19 - "services/auth.py"
Cohesion: 0.11
Nodes (21): get_candidate_versions(), CategoryCreate, CategoryUpdate, create_category(), delete_category(), list_categories(), BaseModel, update_category() (+13 more)

### Community 20 - "jobs/page.tsx"
Cohesion: 0.29
Nodes (7): Job, JobsPage(), metadata, Job, metadata, SmartMatchPage(), getJobs()

### Community 21 - "schemas/auth.py"
Cohesion: 0.04
Nodes (47): [0.1.0] — 2026-06-16, [0.2.0] — 2026-06-17, [0.3.0] — 2026-06-18, [0.4.0] — 2026-06-19, [0.5.0] — 2026-06-20, [0.6.0] — 2026-06-20, [0.7.0] — 2026-06-21, [0.8.0] — 2026-06-21 (+39 more)

### Community 22 - "sandbox.py"
Cohesion: 0.43
Nodes (6): extract_resume_sandbox(), BaseModel, Request, UploadFile, SandboxExperience, SandboxResponse

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
Cohesion: 0.05
Nodes (41): 10. Skills e Ferramentas, 11. Tokens e Componentes, 12. Ordem de Implementação, 13. Critérios de Sucesso, 14. Limites de Segurança, 15. Processo de Aprovação, 16. Primeira Referência de Design System, 17. Primeiro Vertical Slice (+33 more)

### Community 27 - "generate_slug"
Cohesion: 0.07
Nodes (28): 10. Regras de Modificação, 1. Visão Geral do Serviço, 2. Estrutura de Diretórios, 3.1 Multi-Tenancy, 3.2 Concorrência, 3.3 Autenticação (Dual-Cookie), 3.4 N+1 Queries, 3. Princípios de Arquitetura — NUNCA Violar (+20 more)

### Community 28 - "optimize-images.js"
Cohesion: 0.40
Nodes (5): brandDir, fs, optimizeImages(), path, sharp

### Community 29 - "preset-provider.tsx"
Cohesion: 0.33
Nodes (3): PresetConfig, PresetId, PRESETS

### Community 30 - "ConflictModal.tsx"
Cohesion: 0.40
Nodes (3): CandidateConflictPayload, ConflictModalProps, ExperienceDiffItem

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
Cohesion: 0.14
Nodes (19): Candidate, CandidateExtraction, ExperienceItem, BaseModel, _alert(), calculate_quality_score(), TalentFlow — CV Quality Score Engine (v1.0)  Responsabilidade única: calcular a, Gera uma mensagem de alerta padronizada para um campo ausente/insuficiente. (+11 more)

### Community 55 - "DeleteConfirmModal.tsx"
Cohesion: 0.17
Nodes (7): BatchUploadButtonProps, UploadStatus, PageHeaderProps, Portal(), PortalProps, ApiError, ApiOptions

### Community 57 - "number-ticker.tsx"
Cohesion: 0.13
Nodes (14): 1. Visão Geral da Pipeline de CI/CD, 2. Passo a Passo Completo para Salvar & Subir Alterações (Git Workflow), 3. Monitoramento dos Deploys em Produção, 4. Deploys Manuais de Emergência (Se a pipeline falhar), 5. Padrão de Mensagens de Commit (Conventional Commits), A. Deploy Manual do Backend (Fly.io), A. Frontend (Vercel), B. Backend (Fly.io) (+6 more)

### Community 58 - "shimmer-button.tsx"
Cohesion: 0.13
Nodes (14): 1. Requisitos, 1. Stack Base, 2. Configurando o Ambiente, 2. Ingestão de Dados e IA, 3. Gerenciamento com `uv` (PEP 621), 4. Executando a Bateria de Testes Automatizados (`pytest`), 5. Executando as Migrações, 6. Executando o Servidor Localmente (+6 more)

### Community 59 - "shine-border.tsx"
Cohesion: 0.19
Nodes (13): process_batch_uploads_task(), process_single_file(), BackgroundTasks, Path, UploadFile, Atualiza com segurança o progresso de um BatchJob.     Trabalha com uma nova ses, Executa a extração síncrona de um PDF e persiste no banco de dados.     Verifica, Envolve a execução da extração síncrona dentro do semáforo global     e executa (+5 more)

### Community 71 - "ThemeProvider.tsx"
Cohesion: 0.17
Nodes (11): 1. Instalação de Dependências, 1. Stack Base, 2. Camadas de Engenharia (`src/`), 2. Executando o Servidor de Desenvolvimento, 3. Build de Produção, 🏗 Arquitetura e Engenharia de Frontend, 🚢 Deploy, 🚀 Guia de Desenvolvimento (Setup Local) (+3 more)

### Community 74 - "BaseModel"
Cohesion: 0.24
Nodes (9): CandidateStats, CategoryStats, DashboardPage(), DashboardStats, getJobs(), getStats(), JobStats, metadata (+1 more)

### Community 76 - "Navbar.tsx"
Cohesion: 0.31
Nodes (3): ChangePasswordPage(), NAV_LINKS, ThemeToggle()

### Community 77 - "2. Padrões por Módulo de Negócio"
Cohesion: 0.25
Nodes (7): 1. Filosofia Visual, 2. Padrões por Módulo de Negócio, 3. Animações e Microinterações, A. Gestão de Candidatos & Kanban (`/candidates`), B. Smart Match & Inteligência Artificial (`/smart-match`), C. Dashboard & Tabelas (`/dashboard`, `/jobs`), Sistema de Design & UX - TalentFlow (ATS & AI Recruitment Platform)

### Community 78 - "Fases de Execução do Review"
Cohesion: 0.25
Nodes (7): Directriz de Validação, Fase 1: Síntese e Extração de Apontamentos, Fase 2: Auditoria Cruzada com o Codebase Real, Fase 3: Matriz de Priorização e ROI Técnico, Fase 4: Apresentação Executiva & Alinhamento de Decisões, Fases de Execução do Review, Plano de Ação: Review Estruturado de Arquitetura (TalentFlow API & Web)

### Community 79 - "Guia de Troubleshooting: Resolução de Tarefas Travadas e `manage_task`"
Cohesion: 0.25
Nodes (7): 1. O Que É o `manage_task`, 2. Diagnóstico Técnico do Travamento na UI, 3. Como Solicitar a Limpeza ao Agente, 4. Fluxo de Execução Interno do Agente, Causa Raiz, Guia de Troubleshooting: Resolução de Tarefas Travadas e `manage_task`, Prompts Recomendados:

### Community 80 - "2. Padrões por Módulo de Negócio"
Cohesion: 0.25
Nodes (7): 1. Filosofia Visual, 2. Padrões por Módulo de Negócio, 3. Animações e Microinterações, A. Gestão de Candidatos & Kanban (`/candidates`), B. Smart Match & Inteligência Artificial (`/smart-match`), C. Dashboard & Tabelas (`/dashboard`, `/jobs`), Sistema de Design & UX - TalentFlow (ATS & AI Recruitment Platform)

### Community 81 - "vagas/page.tsx"
Cohesion: 0.33
Nodes (4): getPublicJobs(), metadata, PublicJobsPage(), PublicJob

### Community 82 - "categories/page.tsx"
Cohesion: 0.50
Nodes (4): CategoriesPage(), Category, getCategories(), metadata

### Community 83 - "Design Presets — Standby Archive"
Cohesion: 0.50
Nodes (3): 🔄 Como Reativar o Design Presets no Futuro, Design Presets — Standby Archive, 📁 Estrutura dos Arquivos em Standby

## Knowledge Gaps
- **353 isolated node(s):** `talentflow-api`, `$schema`, `style`, `rsc`, `tsx` (+348 more)
  These have ≤1 connection - possible missing edges or undocumented components.
- **8 thin communities (<3 nodes) omitted from report** — run `graphify query` to explore isolated nodes.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **Why does `ThemeToggle()` connect `Navbar.tsx` to `dependencies`?**
  _High betweenness centrality (0.025) - this node is a cross-community bridge._
- **Why does `dependencies` connect `dependencies` to `devDependencies`?**
  _High betweenness centrality (0.020) - this node is a cross-community bridge._
- **Why does `react` connect `dependencies` to `Navbar.tsx`?**
  _High betweenness centrality (0.019) - this node is a cross-community bridge._
- **Are the 7 inferred relationships involving `ScopedSession` (e.g. with `FlagRequest` and `ReplaceRequest`) actually correct?**
  _`ScopedSession` has 7 INFERRED edges - model-reasoned connections that need verification._
- **Are the 8 inferred relationships involving `User` (e.g. with `FlagRequest` and `ReplaceRequest`) actually correct?**
  _`User` has 8 INFERRED edges - model-reasoned connections that need verification._
- **Are the 4 inferred relationships involving `JobPosition` (e.g. with `JobCreate` and `JobUpdate`) actually correct?**
  _`JobPosition` has 4 INFERRED edges - model-reasoned connections that need verification._
- **Are the 6 inferred relationships involving `Candidate` (e.g. with `FlagRequest` and `ReplaceRequest`) actually correct?**
  _`Candidate` has 6 INFERRED edges - model-reasoned connections that need verification._
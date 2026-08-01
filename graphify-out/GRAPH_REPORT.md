# Graph Report - 05-Projetos  (2026-07-25)

## Corpus Check
- cluster-only mode — file stats not available

## Summary
- 642 nodes · 1044 edges · 67 communities (60 shown, 7 thin omitted)
- Extraction: 94% EXTRACTED · 6% INFERRED · 0% AMBIGUOUS · INFERRED: 66 edges (avg confidence: 0.51)
- Token cost: 0 input · 0 output

## Community Hubs (Navigation)
- candidates.py
- ScopedSession
- api/auth.py
- compilerOptions
- dependencies
- devDependencies
- public_apply.py
- components.json
- app/page.tsx
- JobApplicationForm.tsx
- JobDetailView.tsx
- DashboardClient.tsx
- JobsDashboard.tsx
- run_extraction_and_save
- candidates/page.tsx
- dashboard/page.tsx
- measure_performance.py
- api.ts
- apiFetch
- layout.tsx
- auth.ts
- sandbox.py
- generate-og.js
- vagas/page.tsx
- JobsListDashboard.tsx
- public_jobs.py
- optimize-images.js
- Footer.tsx
- Navbar.tsx
- categories/page.tsx
- jobs/page.tsx
- jobs/[slug]/page.tsx
- smart-match/page.tsx
- ConflictModal.tsx
- button.tsx
- middleware.ts
- Settings
- SandboxDemo.tsx
- eslint.config.mjs
- next.config.ts
- postcss.config.mjs
- vercel.json

## God Nodes (most connected - your core abstractions)
1. `ScopedSession` - 43 edges
2. `User` - 30 edges
3. `apiFetch()` - 27 edges
4. `Candidate` - 20 edges
5. `JobPosition` - 18 edges
6. `extract_candidate_from_pdf()` - 18 edges
7. `Category` - 17 edges
8. `CandidateExtraction` - 16 edges
9. `compilerOptions` - 16 edges
10. `ReplaceRequest` - 14 edges

## Surprising Connections (you probably didn't know these)
- `ReplaceRequest` --uses--> `ScopedSession`  [INFERRED]
  talentflow-api/app/api/candidates.py → talentflow-api/app/api/deps.py
- `ReplaceRequest` --uses--> `User`  [INFERRED]
  talentflow-api/app/api/candidates.py → talentflow-api/app/models/domain.py
- `FlagRequest` --uses--> `ScopedSession`  [INFERRED]
  talentflow-api/app/api/candidates.py → talentflow-api/app/api/deps.py
- `FlagRequest` --uses--> `User`  [INFERRED]
  talentflow-api/app/api/candidates.py → talentflow-api/app/models/domain.py
- `CategoryCreate` --uses--> `Category`  [INFERRED]
  talentflow-api/app/api/categories.py → talentflow-api/app/models/domain.py

## Import Cycles
- None detected.

## Communities (67 total, 7 thin omitted)

### Community 0 - "candidates.py"
Cohesion: 0.07
Nodes (72): Base, Candidate, delete_candidate(), extract_cloudinary_public_id(), flag_candidate(), FlagRequest, get_candidate(), list_candidates() (+64 more)

### Community 1 - "ScopedSession"
Cohesion: 0.05
Nodes (49): create_checkout_session(), create_customer_portal_session(), Request, Session, Cria uma sessão de checkout no Stripe para o plano escolhido., Cria uma sessão no portal do cliente (para gerenciar assinaturas, ver faturas, e, Recebe eventos assíncronos do Stripe (assinatura criada, cancelada, falha no pag, stripe_webhook() (+41 more)

### Community 2 - "api/auth.py"
Cohesion: 0.13
Nodes (30): Response, change_password(), forgot_password(), login(), logout(), Session, Permite ao usuário autenticado alterar sua própria senha., Registra uma nova empresa (Tenant) e o usuário administrador principal dela. (+22 more)

### Community 3 - "compilerOptions"
Cohesion: 0.07
Nodes (28): dom, dom.iterable, esnext, **/*.mts, .next/dev/types/**/*.ts, next-env.d.ts, .next/types/**/*.ts, node_modules (+20 more)

### Community 4 - "dependencies"
Cohesion: 0.07
Nodes (27): @base-ui/react, class-variance-authority, clsx, date-fns, framer-motion, lucide-react, next, next-themes (+19 more)

### Community 5 - "devDependencies"
Cohesion: 0.08
Nodes (25): eslint, eslint-config-next, tailwindcss, @tailwindcss/postcss, devDependencies, eslint, eslint-config-next, tailwindcss (+17 more)

### Community 6 - "public_apply.py"
Cohesion: 0.11
Nodes (24): apply_to_job(), _detect_divergences(), _generate_otp(), get_application_status(), BackgroundTasks, Path, Request, Session (+16 more)

### Community 7 - "components.json"
Cohesion: 0.09
Nodes (21): aliases, components, hooks, lib, ui, utils, iconLibrary, menuAccent (+13 more)

### Community 8 - "app/page.tsx"
Cohesion: 0.14
Nodes (9): metadata, EXTRACTED, Phase, STEPS, RevealSection(), RevealSectionProps, SandboxDemo, SandboxDemoWrapper() (+1 more)

### Community 9 - "JobApplicationForm.tsx"
Cohesion: 0.14
Nodes (11): generateMetadata(), getPublicJob(), PageProps, PublicJobPage(), FieldError, FormData, JobApplicationForm(), JobApplicationFormProps (+3 more)

### Community 10 - "JobDetailView.tsx"
Cohesion: 0.15
Nodes (9): BatchUploadButtonProps, UploadStatus, Job, JobDetailView(), Job, JobFormDrawer(), JobFormDrawerProps, Portal() (+1 more)

### Community 11 - "DashboardClient.tsx"
Cohesion: 0.15
Nodes (13): CategoriesDashboard(), Category, CandidateStats, CategoryStats, DashboardClient(), DashboardClientProps, DashboardStats, Job (+5 more)

### Community 12 - "JobsDashboard.tsx"
Cohesion: 0.15
Nodes (7): JobMatchViewer(), Match, MatchResponse, Job, JobsDashboard(), PageHeaderProps, Job

### Community 13 - "run_extraction_and_save"
Cohesion: 0.19
Nodes (13): process_batch_uploads_task(), process_single_file(), BackgroundTasks, Path, UploadFile, Atualiza com segurança o progresso de um BatchJob.     Trabalha com uma nova ses, Executa a extração síncrona de um PDF e persiste no banco de dados.     Verifica, Envolve a execução da extração síncrona dentro do semáforo global     e executa (+5 more)

### Community 14 - "candidates/page.tsx"
Cohesion: 0.20
Nodes (9): Candidate, CandidatesPage(), CandidatesResponse, Category, getCandidates(), getCategories(), metadata, Category (+1 more)

### Community 15 - "dashboard/page.tsx"
Cohesion: 0.22
Nodes (10): CandidateStats, CategoryStats, DashboardPage(), DashboardStats, getJobs(), getStats(), Job, JobStats (+2 more)

### Community 16 - "measure_performance.py"
Cohesion: 0.27
Nodes (4): main(), print_report(), Any, run_benchmark()

### Community 17 - "api.ts"
Cohesion: 0.20
Nodes (4): CandidateTable(), DeleteConfirmModalProps, ApiError, ApiOptions

### Community 18 - "apiFetch"
Cohesion: 0.42
Nodes (6): ChangePasswordPage(), LogoutButton(), UserMenu(), apiFetch(), clearSession(), deleteCookie()

### Community 19 - "layout.tsx"
Cohesion: 0.25
Nodes (6): Footer, inter, jetbrainsMono, metadata, { version }, ThemeProvider()

### Community 20 - "auth.ts"
Cohesion: 0.36
Nodes (4): LoginContent(), AuthSession, setCookie(), setSession()

### Community 21 - "sandbox.py"
Cohesion: 0.43
Nodes (6): extract_resume_sandbox(), BaseModel, Request, UploadFile, SandboxExperience, SandboxResponse

### Community 22 - "generate-og.js"
Cohesion: 0.33
Nodes (6): backupDir, brandDir, fs, generateOgImage(), path, sharp

### Community 23 - "vagas/page.tsx"
Cohesion: 0.33
Nodes (4): getPublicJobs(), metadata, PublicJobsPage(), PublicJob

### Community 24 - "JobsListDashboard.tsx"
Cohesion: 0.29
Nodes (4): Job, JobCardProps, Job, JobsListDashboard()

### Community 25 - "public_jobs.py"
Cohesion: 0.40
Nodes (5): get_public_job(), list_public_jobs(), Session, Retorna a listagem de todas as vagas ativas no portal público.     Não exige aut, Retorna os detalhes de uma vaga pública específica identificada pelo slug semânt

### Community 26 - "optimize-images.js"
Cohesion: 0.40
Nodes (5): brandDir, fs, optimizeImages(), path, sharp

### Community 27 - "Footer.tsx"
Cohesion: 0.33
Nodes (4): containerVariants, FooterProps, itemVariants, navLinks

### Community 29 - "categories/page.tsx"
Cohesion: 0.50
Nodes (4): CategoriesPage(), Category, getCategories(), metadata

### Community 30 - "jobs/page.tsx"
Cohesion: 0.50
Nodes (4): getJobs(), Job, JobsPage(), metadata

### Community 31 - "jobs/[slug]/page.tsx"
Cohesion: 0.50
Nodes (4): getJobDetail(), Job, JobDetailPage(), PageProps

### Community 32 - "smart-match/page.tsx"
Cohesion: 0.50
Nodes (4): getJobs(), Job, metadata, SmartMatchPage()

### Community 33 - "ConflictModal.tsx"
Cohesion: 0.40
Nodes (3): CandidateConflictPayload, ConflictModalProps, ExperienceDiffItem

### Community 34 - "button.tsx"
Cohesion: 0.70
Nodes (3): Button(), buttonVariants, cn()

### Community 35 - "middleware.ts"
Cohesion: 0.83
Nodes (3): decodeJwt(), middleware(), PUBLIC_ROUTES

## Knowledge Gaps
- **156 isolated node(s):** `$schema`, `style`, `rsc`, `tsx`, `config` (+151 more)
  These have ≤1 connection - possible missing edges or undocumented components.
- **7 thin communities (<3 nodes) omitted from report** — run `graphify query` to explore isolated nodes.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **Why does `ThemeToggle()` connect `Navbar.tsx` to `apiFetch`, `dependencies`?**
  _High betweenness centrality (0.057) - this node is a cross-community bridge._
- **Why does `dependencies` connect `dependencies` to `devDependencies`?**
  _High betweenness centrality (0.046) - this node is a cross-community bridge._
- **Why does `react` connect `dependencies` to `Navbar.tsx`?**
  _High betweenness centrality (0.043) - this node is a cross-community bridge._
- **Are the 7 inferred relationships involving `ScopedSession` (e.g. with `FlagRequest` and `ReplaceRequest`) actually correct?**
  _`ScopedSession` has 7 INFERRED edges - model-reasoned connections that need verification._
- **Are the 8 inferred relationships involving `User` (e.g. with `FlagRequest` and `ReplaceRequest`) actually correct?**
  _`User` has 8 INFERRED edges - model-reasoned connections that need verification._
- **Are the 8 inferred relationships involving `Candidate` (e.g. with `FlagRequest` and `ReplaceRequest`) actually correct?**
  _`Candidate` has 8 INFERRED edges - model-reasoned connections that need verification._
- **Are the 4 inferred relationships involving `JobPosition` (e.g. with `JobCreate` and `JobUpdate`) actually correct?**
  _`JobPosition` has 4 INFERRED edges - model-reasoned connections that need verification._
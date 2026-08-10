# Graph Report - .  (2026-08-04)

## Corpus Check
- cluster-only mode — file stats not available

## Summary
- 767 nodes · 1074 edges · 76 communities (62 shown, 14 thin omitted)
- Extraction: 97% EXTRACTED · 3% INFERRED · 0% AMBIGUOUS · INFERRED: 29 edges (avg confidence: 0.53)
- Token cost: 0 input · 0 output

## Graph Freshness
- Built from commit: `0a590295`
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
- vercel.json
- talentflow-api
- BaseModel

## God Nodes (most connected - your core abstractions)
1. `ScopedSession` - 43 edges
2. `extract_candidate_from_pdf()` - 18 edges
3. `compilerOptions` - 16 edges
4. `Job` - 15 edges
5. `CandidateExtraction` - 14 edges
6. `apiFetch()` - 13 edges
7. `get_current_user()` - 12 edges
8. `ExperienceItem` - 12 edges
9. `resolve_job_id()` - 12 edges
10. `JobPosition` - 11 edges

## Surprising Connections (you probably didn't know these)
- `ReplaceRequest` --uses--> `ScopedSession`  [INFERRED]
  talentflow-api/app/api/candidates.py → talentflow-api/app/api/deps.py
- `FlagRequest` --uses--> `ScopedSession`  [INFERRED]
  talentflow-api/app/api/candidates.py → talentflow-api/app/api/deps.py
- `CategoryCreate` --uses--> `ScopedSession`  [INFERRED]
  talentflow-api/app/api/categories.py → talentflow-api/app/api/deps.py
- `CategoryCreate` --uses--> `Category`  [INFERRED]
  talentflow-api/app/api/categories.py → talentflow-api/app/models/domain.py
- `CategoryCreate` --uses--> `User`  [INFERRED]
  talentflow-api/app/api/categories.py → talentflow-api/app/models/domain.py

## Import Cycles
- None detected.

## Communities (76 total, 14 thin omitted)

### Community 0 - "candidates.py"
Cohesion: 0.05
Nodes (71): delete_candidate(), extract_cloudinary_public_id(), flag_candidate(), FlagRequest, get_candidate_pdf(), get_cloudinary_pdf_bytes(), process_batch_uploads_task(), process_single_file() (+63 more)

### Community 1 - "ScopedSession"
Cohesion: 0.06
Nodes (52): Base, get_batch_job_status(), get_candidate_versions(), Consulta o estado de processamento de um lote de upload.     Retorna percentual, CategoryCreate, CategoryUpdate, create_category(), delete_category() (+44 more)

### Community 2 - "apiFetch"
Cohesion: 0.07
Nodes (28): CategoriesPage(), Category, getCategories(), metadata, ChangePasswordPage(), LoginContent(), getPublicJobs(), metadata (+20 more)

### Community 3 - "devDependencies"
Cohesion: 0.06
Nodes (36): eslint, eslint-config-next, jsdom, tailwindcss, @tailwindcss/postcss, devDependencies, eslint, eslint-config-next (+28 more)

### Community 4 - "resolve_job_id"
Cohesion: 0.08
Nodes (27): get_candidate(), list_candidates(), Lista candidatos com filtros de categoria e busca textual (nome, skills, cargo,, get_public_job(), list_public_jobs(), JobPosition, Session, Retorna a listagem de todas as vagas ativas no portal público.     Não exige aut (+19 more)

### Community 5 - "dependencies"
Cohesion: 0.07
Nodes (29): @base-ui/react, class-variance-authority, clsx, date-fns, framer-motion, lucide-react, motion, next (+21 more)

### Community 6 - "compilerOptions"
Cohesion: 0.07
Nodes (28): dom, dom.iterable, esnext, **/*.mts, .next/dev/types/**/*.ts, next-env.d.ts, .next/types/**/*.ts, node_modules (+20 more)

### Community 7 - "deps.py"
Cohesion: 0.09
Nodes (24): create_checkout_session(), create_customer_portal_session(), Request, Session, User, Cria uma sessão de checkout no Stripe para o plano escolhido., Cria uma sessão no portal do cliente (para gerenciar assinaturas, ver faturas, e, Recebe eventos assíncronos do Stripe (assinatura criada, cancelada, falha no pag (+16 more)

### Community 8 - "DashboardClient.tsx"
Cohesion: 0.08
Nodes (24): CandidateStats, CategoryStats, DashboardPage(), DashboardStats, getJobs(), getStats(), JobStats, metadata (+16 more)

### Community 9 - "api/auth.py"
Cohesion: 0.13
Nodes (21): ChangePasswordRequest, ForgotPasswordRequest, LoginRequest, RegisterRequest, ResetPasswordRequest, Response, change_password(), forgot_password() (+13 more)

### Community 10 - "components.json"
Cohesion: 0.09
Nodes (21): aliases, components, hooks, lib, ui, utils, iconLibrary, menuAccent (+13 more)

### Community 11 - "public_apply.py"
Cohesion: 0.12
Nodes (20): Candidate, apply_to_job(), _detect_divergences(), _generate_otp(), get_application_status(), OTPVerifyRequest, BackgroundTasks, BaseModel (+12 more)

### Community 12 - "main.py"
Cohesion: 0.15
Nodes (9): main(), print_report(), Any, run_benchmark(), Testa se o endpoint GET /health responde adequadamente, Testa se o endpoint raiz GET / responde com status ok e versão 2.3.0, test_api_health_endpoint(), test_health_endpoint() (+1 more)

### Community 13 - "app/page.tsx"
Cohesion: 0.14
Nodes (9): metadata, EXTRACTED, Phase, STEPS, RevealSection(), RevealSectionProps, SandboxDemo, SandboxDemoWrapper() (+1 more)

### Community 14 - "JobApplicationForm.tsx"
Cohesion: 0.14
Nodes (11): generateMetadata(), getPublicJob(), PageProps, PublicJobPage(), FieldError, FormData, JobApplicationForm(), JobApplicationFormProps (+3 more)

### Community 15 - "index.ts"
Cohesion: 0.16
Nodes (6): Candidate, CandidatesResponse, CandidateStats, Experience, Category, JobFormData

### Community 16 - "candidates/page.tsx"
Cohesion: 0.19
Nodes (9): Candidate, CandidatesPage(), CandidatesResponse, Category, metadata, BatchUploadButtonProps, UploadStatus, getCandidates() (+1 more)

### Community 17 - "Job"
Cohesion: 0.24
Nodes (4): DashboardClientProps, JobCardProps, JobFormDrawerProps, Job

### Community 18 - "Navbar.tsx"
Cohesion: 0.18
Nodes (3): Match, MatchResponse, NAV_LINKS

### Community 19 - "services/auth.py"
Cohesion: 0.18
Nodes (10): get_dashboard_stats(), create_access_token(), decode_access_token(), hash_password(), Verifica se uma senha plana corresponde à senha criptografada do banco., Gera um token JWT contendo as informações do usuário., Decodifica um token JWT e valida sua assinatura e expiração., Criptografa uma senha usando bcrypt. (+2 more)

### Community 20 - "jobs/page.tsx"
Cohesion: 0.29
Nodes (7): Job, JobsPage(), metadata, Job, metadata, SmartMatchPage(), getJobs()

### Community 21 - "schemas/auth.py"
Cohesion: 0.43
Nodes (7): ChangePasswordRequest, ForgotPasswordRequest, LoginRequest, BaseModel, RegisterRequest, ResetPasswordRequest, TokenResponse

### Community 22 - "sandbox.py"
Cohesion: 0.43
Nodes (6): extract_resume_sandbox(), BaseModel, Request, UploadFile, SandboxExperience, SandboxResponse

### Community 23 - "generate-og.js"
Cohesion: 0.33
Nodes (6): backupDir, brandDir, fs, generateOgImage(), path, sharp

### Community 24 - "CandidateAuditWorkspace.tsx"
Cohesion: 0.29
Nodes (3): metadata, PageProps, CandidateAuditWorkspaceProps

### Community 25 - "layout.tsx"
Cohesion: 0.29
Nodes (5): Footer, inter, jetbrainsMono, metadata, { version }

### Community 26 - "send_reset_password_email"
Cohesion: 0.47
Nodes (5): date_year(), Envia o e-mail de recuperação de senha., Dispara um e-mail formatado em HTML utilizando o servidor SMTP configurado., send_email(), send_reset_password_email()

### Community 27 - "generate_slug"
Cohesion: 0.40
Nodes (5): generate_slug(), Session, Gera um slug único global para uma vaga a partir do seu título.     Caso o slug, Gera um slug URL-friendly a partir de uma string de texto.     Normaliza acentos, slugify()

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
Cohesion: 0.70
Nodes (3): Button(), buttonVariants, cn()

### Community 33 - "proxy.ts"
Cohesion: 0.70
Nodes (4): decodeJwt(), middleware(), proxy(), PUBLIC_ROUTES

### Community 34 - "jobs/[slug]/page.tsx"
Cohesion: 0.67
Nodes (3): getJobDetail(), JobDetailPage(), PageProps

## Knowledge Gaps
- **165 isolated node(s):** `$schema`, `style`, `rsc`, `tsx`, `config` (+160 more)
  These have ≤1 connection - possible missing edges or undocumented components.
- **14 thin communities (<3 nodes) omitted from report** — run `graphify query` to explore isolated nodes.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **Why does `ThemeToggle()` connect `apiFetch` to `dependencies`?**
  _High betweenness centrality (0.054) - this node is a cross-community bridge._
- **Why does `ScopedSession` connect `ScopedSession` to `candidates.py`, `services/auth.py`, `resolve_job_id`, `deps.py`?**
  _High betweenness centrality (0.047) - this node is a cross-community bridge._
- **Why does `dependencies` connect `dependencies` to `devDependencies`?**
  _High betweenness centrality (0.046) - this node is a cross-community bridge._
- **Are the 6 inferred relationships involving `ScopedSession` (e.g. with `FlagRequest` and `ReplaceRequest`) actually correct?**
  _`ScopedSession` has 6 INFERRED edges - model-reasoned connections that need verification._
- **What connects `$schema`, `style`, `rsc` to the rest of the system?**
  _165 weakly-connected nodes found - possible documentation gaps or missing edges._
- **Should `candidates.py` be split into smaller, more focused modules?**
  _Cohesion score 0.05297334244702666 - nodes in this community are weakly interconnected._
- **Should `ScopedSession` be split into smaller, more focused modules?**
  _Cohesion score 0.059076682316118935 - nodes in this community are weakly interconnected._
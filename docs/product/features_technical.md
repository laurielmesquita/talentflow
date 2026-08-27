# TalentFlow: Funcionalidades e Arquitetura (Visão Técnica)

Esta documentação detalha a implementação técnica das funcionalidades e as decisões de arquitetura de sistemas no ecossistema do **TalentFlow**. A aplicação opera sob um monorepo que acopla uma API RESTful assíncrona (FastAPI) a um painel administrativo baseado em SPA (Next.js v16).

---

## 1. Backend & IA (Data Ingestion Pipeline)

* **Arquitetura Assíncrona e Performance (FastAPI + Uvicorn):** Endpoints estruturados para I/O assíncrono com validação rigorosa e serialização/desserialização via esquemas Pydantic V2.
* **Ingestão Híbrida de IA:**
  * **Groq API (Llama 3.3 70B):** Responsável por extrair em milissegundos os dados do currículo em formato JSON estruturado quando o PDF possui texto nativo selecionável.
  * **Google Gemini API (2.5 Flash):** Utilizado em modelo multimodal para processar imagens e PDFs escaneados (OCR) via injeção direta de `response_schema` (usando tipagem Pydantic), garantindo saídas estruturadas sem a necessidade de parsing de expressões regulares (*Regex*).
* **Ingestão em Lote Concorrente com Controle de Semáforo:**
  * Os arquivos carregados no lote são recebidos pelo endpoint `POST /api/candidates/upload/batch` de forma assíncrona.
  * O processamento em background (leitura de texto, chamadas de IA e salvamento no banco) é delegado a `BackgroundTasks` do FastAPI.
  * Para evitar estouros de memória e throttling das chaves de API sob a infraestrutura limitada de execução (instância de 512MB no Render Free; anteriormente Fly.io), o processamento concorrente é controlado por um semáforo de concorrência (`asyncio.Semaphore(3)`), permitindo que no máximo 3 currículos sejam analisados simultaneamente.
* **Extração de Foto de Perfil (PyMuPDF):** O backend realiza uma varredura interna nos fluxos binários do arquivo PDF buscando por blocos de imagem (usando `fitz` / PyMuPDF). Ao detectar imagens compatíveis com rostos, isola o arquivo e realiza o upload assíncrono seguro para o Cloudinary, associando a URL gerada ao modelo do candidato.
* **Garantia de Integridade e LGPD:**
  * **Exclusão Segura (Soft Delete):** Remoção lógica de registros por meio do campo `deleted_at` para trilha de auditoria da LGPD.
  * **Deduplicação de Arquivos:** Cálculo e checagem de hash criptográfico SHA-256 do arquivo original enviado para evitar o armazenamento e parsing de PDFs idênticos.

---

## 2. Arquitetura Multi-Tenant SaaS (B2B)

* **Isolamento de Banco de Dados:** Isolamento lógico estrito. Todas as tabelas do negócio (`candidates`, `job_positions`, `categories`, `skills`, `batch_jobs`, `invites`) contêm um campo estrangeiro `tenant_id` (vinculado à tabela `tenants`).
* **Centralização de Escopo via SQLAlchemy Dependency:**
  * Para mitigar o risco de vazamento de dados entre clientes corporativos (esquecimento acidental de cláusulas `.filter(tenant_id == ...)`), as rotas consomem a dependência de escopo `get_scoped_db`.
  * Essa dependência recupera o `tenant_id` contido no payload decodificado do JWT do usuário autenticado e injeta um interceptador de query na sessão do SQLAlchemy, garantindo que qualquer leitura de banco de dados já nasça pré-filtrada pelo `tenant_id` correspondente.
* **Restrições de Unicidade Compostas (Tenant Scoping):**
  * Para permitir que diferentes empresas clientes criem tags de categorias ou competências homônimas (ex: ambos criarem a skill "React"), removeu-se a restrição de unicidade global na coluna `name`.
  * Em substituição, as tabelas `Category` e `Skill` implementam uma restrição de unicidade composta do PostgreSQL via Alembic: `UniqueConstraint('tenant_id', 'name')`.

---

## 3. Engine de Smart Match & Warm Path Cache

* **Algoritmo de Match por Competências:** O backend computa a compatibilidade comparando a interseção de conjuntos matemáticos de habilidades exigidas pela vaga (`required_skills` do modelo `JobPosition`) e competências mapeadas no currículo do candidato.
* **Geração Concorrente de Justificativas com Fallback:**
  * Se a pontuação de interseção for superior a 0%, o backend dispara requisições concorrentes (`asyncio.gather`) para gerar a explicabilidade do match.
  * O motor consulta a API do Groq (usando Llama 3.3) enviando as competências comuns, experiências e descrição da vaga para resumir em até 2 frases a adequação do profissional.
  * Se a API do Groq falhar ou atingir rate limits, o sistema aciona de forma resiliente o fallback para o Gemini 2.5 Flash. Caso ambos falhem, uma resposta estática padronizada com base nas competências em comum é injetada.
* **Warm Path Caching:**
  * Os matches computados e suas respectivas justificativas de IA são salvos fisicamente na tabela associativa `job_matches`.
  * Nas listagens subsequentes da vaga, o backend busca diretamente da tabela `job_matches` (tempo de resposta inferior a 50ms), sem precisar re-processar dados ou re-chamar APIs de LLM (*Warm Path*).
* **Invalidação de Cache Reativa:** O cache de matches de uma vaga é deletado automaticamente do banco de dados quando:
  * A vaga é atualizada via endpoint `PUT /api/jobs/{id}`.
  * Um candidato do tenant correspondente é excluído fisicamente ou marcado como inativo.
  * Uma nova versão de currículo substitui o candidato anterior.

---

## 4. Frontend Next.js & Performance Visual (UX)

* **Interactive Expandable List (Vertical Inline):** Uso do framework **Framer Motion** (atributo `layout` com spring physics) para expansão vertical elástica do card de candidato diretamente na própria lista (sem uso de drawers laterais ou popups externos), assegurando renderizações fluidas de 60fps no navegador.
* **Espaço de Cores OKLCH no Tailwind CSS v4:** As definições de temas claro e escuro foram migradas para o espaço de cores perceptual OKLCH. Isso provê controle matemático sobre Luminância e Croma nos gradientes neon da interface, impedindo distorções visuais e corte de gamut (*Gamut Clipping*) no Dark Mode das telas.
* **SVG Animado:** Componente `ScoreRing` animado via propriedades de SVG e trigonometria (`strokeDashoffset` baseado na circunferência do anel) para exibir de forma suave o match score e a nota de qualidade.
* **Tratamento de Suspense no Next.js (useSearchParams):**
  * Para evitar erros de Hydration Mismatch e quebras de build estático/SSR no Next.js 16, as páginas clientes que lêem parâmetros da URL (`login/page.tsx`, `reset-password/page.tsx`, e `invite/accept/page.tsx`) foram envelopadas em boundaries de `<Suspense />`.
  * Isso assegura que a desidratação do HTML no servidor não falhe ao tentar acessar informações que só existem no lado do cliente no momento da montagem da rota.

---

## 5. Autenticação, RBAC e Segurança de Sessão

* **Token de Autenticação Assinado (JWT):** A autenticação é gerida via token JWT assinado criptograficamente com o algoritmo HMAC-SHA256 (`pyjwt`).
* **Validação na Borda (Edge Middleware):** Um middleware Next.js intercepta todas as requisições sob as rotas privadas `/dashboard/*`. A decodificação e validação do token JWT ocorrem na borda do servidor (Edge Runtime), bloqueando acessos maliciosos antes mesmo de bater no banco de dados Neon ou na máquina da API.
* **Controle de Acesso Baseado em Cargos (RBAC):**
  * **FastAPI `RoleChecker`:** Injeção de dependência no backend que valida a permissão exigida no endpoint com a claims contida no payload do token JWT do usuário ativo.
  * **Bloqueio de Rota no Frontend:** O middleware do Next.js redireciona automaticamente usuários com cargo `Recruiter` que tentam acessar a tela administrativa `/dashboard/invite`.
* **Cifragem de Senhas (Bcrypt):** Utilização do algoritmo `bcrypt` com salting de alta complexidade para segurança das senhas no banco.
* **Disparos SMTP com TLS (Brevo):** Serviço SMTP integrado com a API da Brevo para o envio de e-mails transacionais (convites corporativos expiráveis em 7 dias e links de redefinição de senha válidos por 2 horas).

---

## 6. Serviço Proxy de PDF & Workspace de Auditoria

* **Proxy Autenticado Cloudinary (`GET /api/candidates/{candidate_id}/pdf`):**
  * Extrai o `public_id` da URL armazenada (`extract_cloudinary_public_id`), gera URL assinada via `cloudinary.utils.private_download_url` com `resource_type="raw"`.
  * Streaming de bytes com `Content-Type: application/pdf`, `Content-Disposition: inline`, `Access-Control-Allow-Origin: *` e `Cache-Control: public, max-age=86400, stale-while-revalidate=3600`.
  * Fallback: se a URL assinada falhar, tenta download direto com User-Agent de navegador (`httpx.get` com timeout 15s).
  * Logging detalhado via `[pdf_proxy]` prefix para diagnóstico em produção.
* **Configuração Cloudinary (`CLOUDINARY_URL`):** `@model_validator` em `config.py` extrai automaticamente `CLOUDINARY_CLOUD_NAME`, `CLOUDINARY_API_KEY` e `CLOUDINARY_API_SECRET` do formato `cloudinary://key:secret@name` quando a env var é setada.
* **Autenticação Cross-Origin (`?token=`):** `get_current_user` em `deps.py` aceita token JWT como terceira fonte (após Authorization header e cookie HttpOnly) via `request.query_params.get("token")`, essencial para iframes no Safari.
* **Visualizador de PDF (`PDFViewer.tsx`):**
  * Monta a URL do proxy com `?token=` injetado do cookie do cliente via `getCookie("token")`.
  * Gating por `tokenReady` previne race condition de renderização sem token.
  * `useEffect` com leitura pós-SSR garante disponibilidade do cookie em produção (Vercel).
  * `key={proxyPdfUrl}` força remount do iframe na troca de URL.
  * CSP configurado com `frame-src 'self' blob: https: http://localhost:8000` para dev e produção.
* **Workspace de Auditoria (`CandidateAuditWorkspace.tsx`):** Layout tela cheia com split 50/50, navegação em lote (`candidateIndex` state com setas), ações de approve/flag integradas.

## 7. Portal Público de Vagas & Pipeline de Candidatura

* **Entidade `JobApplication` (job_applications):**
  * 25+ colunas incluindo: `full_name`, `email`, `phone`, `address`, `linkedin`, `cover_letter` (dados do formulário).
  * `original_pdf_url`, `pdf_hash` (arquivo enviado pelo candidato).
  * `ai_extracted_data` (JSON), `quality_score`, `quality_alerts`, `has_divergence`, `divergence_report` (resultado do pipeline IA).
  * `otp_code` (SHA-256 hash), `otp_expires_at`, `email_verified`, `verified_at` (fluxo de verificação).
  * `source` (public_portal vs internal), `application_status` (pending/verified/processed/rejected).
  * `UniqueConstraint('tenant_id', 'candidate_id', 'job_id')` — previne candidaturas duplicadas.
* **Verificação OTP com SHA-256:**
  * OTP de 6 dígitos gerado aleatoriamente, armazenado como hash SHA-256 (não plaintext).
  * Expiração configurável, endpoint de verificação `POST /api/public/apply/verify-otp`.
  * Endpoint de polling `GET /api/public/apply/status/{application_id}` para acompanhar status do processamento.
* **Detecção de Divergências (`_detect_divergences()`):**
  * Compara `full_name`, `email`, `phone` entre formulário web e extração IA do PDF.
  * Classifica severidade: `high` (nome diferente), `medium` (email/telefone diferente).
  * Resultado armazenado como JSON em `divergence_report` para revisão do recrutador.
* **Rotas Públicas (`PublicJobResponse`):**
  * `GET /api/public/vagas` — lista vagas ativas (filtra `is_active=True`, `deleted_at IS NULL`).
  * `GET /api/public/vagas/{slug}` — detalhe por slug semântico usando `resolve_job_id()`.
  * Componentes: `PublicJobsList.tsx`, `PublicJobDetail.tsx`, `JobApplicationForm.tsx`.

## 8. Governança de Feature Flags B2B

* **Sistema de Planos (`config.py:PLAN_FEATURES`):**
  * 6 flags por tier (Free/Pro/Enterprise): `candidate_limit`, `smart_match`, `batch_upload`, `custom_branding`, `quality_score_alerts`, `api_access`.
  * Free: 50 candidatos, sem batch upload, sem custom branding, sem API access.
  * Pro: 500 candidatos, todas as features habilitadas.
  * Enterprise: ilimitado, todas as features.
* **Serviço de Verificação (`services/features.py`):**
  * `get_plan_features(plan_type)` retorna o dicionário de flags do plano.
  * `check_feature_access(plan_type, feature_name)` verifica se uma feature específica está habilitada.
* **Guardião de Rota (`deps.py:require_feature()`):**
  * Factory de dependência FastAPI que bloqueia requisições com HTTP 403 se o plano do tenant não tiver a feature.
  * Uso: `Depends(require_feature("batch_upload"))` em rotas protegidas por plano.

## 9. Sandbox de IA Pública & Rate Limiting

* **Endpoint de Demonstração (`POST /api/sandbox/extract`):**
  * Aberto ao público (sem autenticação), permite upload de PDF para demonstração em tempo real da extração IA.
  * Retorna `SandboxResponse` com no máximo 2 experiências.
* **Rate Limiting por IP (`slowapi`):**
  * `SANDBOX_RATE_LIMIT_PER_MINUTE = 3` — bloqueia IPs que excederem 3 requisições/minuto.
  * `SANDBOX_DAILY_BUDGET = 100` — cap diário de processamentos com `threading.Lock` para thread-safety.
  * Budget reseta à meia-noite (comparação de data), exaustão retorna HTTP 429.
* **Componentes Frontend:** `SandboxDemo.tsx` (upload + preview), `SandboxDemoWrapper.tsx` (layout container), ambos na landing page.

## 10. Integração de Billing Stripe

* **Webhook (`POST /api/billing/webhook`):** Processa 3 eventos Stripe com lógica de negócio específica:
  * `checkout.session.completed` → atualiza tenant para Pro, define `stripe_customer_id`, `stripe_subscription_id`, `candidate_count_limit=500`.
  * `customer.subscription.updated` → sincroniza `plan_status`; se `canceled` ou `unpaid`, faz downgrade automático para Free.
  * `customer.subscription.deleted` → downgrade para Free, limpa `stripe_subscription_id`.
* **Checkout (`POST /api/billing/create-checkout-session`):** Cria sessão Stripe com `STRIPE_PRO_PRICE_ID` e redireciona para URL de checkout.
* **Portal do Cliente (`POST /api/billing/portal`):** Gera sessão do Stripe Customer Portal para gerenciamento de assinatura/faturas.

## 11. Utilitários de Infraestrutura

* **Geração de Slugs (`services/slug.py`):** `slugify()` com normalização Unicode e `generate_slug()` com deduplicação contra a tabela `job_positions` (sufixos `-2`, `-3`).
* **Resolução de Vagas (`services/job_lookup.py`):** `resolve_job_id(db, job_id, must_be_active)` — aceita UUID ou slug semântico, usada por rotas internas e públicas.
* **Audit Log (`AuditLog`):** Registro de ações de usuários (`view`, `create`, `update`, `delete`, `flag`, `unflag`) com `entity_name`, `entity_id`, `user_id`, `tenant_id` e `timestamp`.

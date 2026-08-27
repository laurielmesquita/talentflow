# Changelog — TalentFlow

Todas as atualizações notáveis deste projeto são documentadas neste arquivo, seguindo o padrão [Semantic Versioning (SemVer)](https://semver.org/spec/v2.0.0.html) e o formato [Keep a Changelog](https://keepachangelog.com/pt-BR/1.1.0/).


---

## [Unreleased]

Próxima versão em planejamento. O encerramento seguro de organizações e a purga de dados estão previstos para a linha 2.7.x.

### Fundação UX/UI
- Adicionado `AppShell` reutilizável para páginas operacionais autenticadas, aplicado inicialmente a Organização e Usuários.
- Adicionados primitivos compartilhados de feedback: `StatusMessage`, `EmptyState` e `PageSkeleton`.
- Adicionados tokens semânticos de sucesso, alerta e informação, além de `ui/Input` e `ui/Dialog` com acessibilidade de teclado e gerenciamento de foco.
- Atualizado o modal de exclusão de candidato para o diálogo compartilhado e ajustado o `PageHeader` para ações e textos responsivos.
- Melhorada a navegação assistiva com foco visível global, redução de movimento e estados ARIA para menus móveis e de conta.
- Padronizada a validação visual de senha mínima para 8 caracteres no fluxo de alteração de senha.
- Atualizado o mapa Graphify após a mudança estrutural e adicionados testes para os novos primitivos de feedback.
- Dashboard migrado para o `AppShell`, removendo a composição local duplicada da navegação autenticada.

### Configurações de conta
- Confirmação de alteração de e-mail integrada ao shell de configurações, com estados claros de carregamento, sucesso e erro.
- Criado `SettingsShell` com navegação persistente no desktop e rolável no mobile para Perfil, Segurança, Preferências e Privacidade e dados.
- Novas rotas de conta: `/settings/profile`, `/settings/security`, `/settings/preferences` e `/settings/privacy`; os caminhos legados de configurações e senha redirecionam para a nova estrutura.
- Criada a central `/settings`, separando perfil individual, segurança, preferências e privacidade das funções administrativas da organização.
- Adicionada edição do nome e telefone do próprio usuário por `GET/PATCH /api/auth/me`.
- Adicionado telefone opcional ao gerenciamento administrativo de usuários.
- Troca de e-mail implementada com senha atual, confirmação por link de 15 minutos e invalidação de sessões anteriores.
- Preferências persistidas adicionadas para fuso horário, notificações operacionais e tema; idioma permanece fora do escopo inicial no Brasil.
- Exportação individual de dados adicionada em `GET /api/auth/me/export`.

### Preparação do encerramento de organização
- Adicionado fluxo de solicitação/cancelamento com confirmação reforçada e carência de 30 dias; a purga física permanece separada e controlada.
- Adicionado executor manual idempotente para purga de dados do tenant e assets do Cloudinary após a carência.

### Administração organizacional
- A confirmação de desativação de usuários agora usa diálogo acessível e campos compartilhados, preservando o comportamento administrativo existente.

### Portal público
- Criado `PublicLegalShell` para centralizar a navegação institucional e o layout das páginas de Termos e Privacidade.
- A busca e os estados vazios de vagas públicas agora usam tokens semânticos e o componente compartilhado `ui/Input`.
- Atualizado o mapa Graphify após a consolidação das páginas públicas.

### Qualidade de interação
- Cadastro, redefinição e alteração de senha reforçam o mínimo de 8 caracteres no próprio formulário.
- Botões de revelar senha voltaram a ser acessíveis por teclado e anunciam seu estado para leitores de tela.
- Feedbacks de autenticação passaram a usar regiões acessíveis de alerta e status.
- Páginas de configurações avisam antes do fechamento quando há alterações ainda não salvas.

### Testes e entrega
- Adicionada infraestrutura Playwright com três cenários E2E para validação de senha, controle de exibição por teclado e confirmação de recuperação de acesso.
- Corrigido o recorte horizontal do fluxo de login em telas mobile ao organizar o `AuthShell` verticalmente.
- Validado o fluxo de acesso em desktop e mobile no navegador integrado; o mapa Graphify foi atualizado.

## [2.6.0] — 2026-08-26

Adiciona o primeiro ciclo de gerenciamento administrativo de usuários por organização.

### Adicionado
- **API de usuários (`/api/users`):** listagem, criação, edição e desativação de usuários por tenant.
- **Painel de usuários (`/users`):** interface administrativa para gerenciar membros da organização.
- **Proprietário do tenant:** associação explícita do primeiro `Manager` ao `Owner`, preparada para o fluxo de transferência e encerramento da organização.

### Segurança
- Acesso restrito a `Manager` e `SuperAdmin`.
- Consultas sempre limitadas ao tenant autenticado.
- Senhas armazenadas somente com hash.
- O último gerente ativo não pode ser removido ou rebaixado.
- O usuário não pode remover ou desativar o próprio acesso administrativo.
- A exclusão de usuário é uma desativação reversível e não remove dados da organização.

## [2.5.1] — 2026-08-25

Versão de manutenção que consolida a migração da API para o Render Free, a estabilização operacional pós-migração e o registro das validações de produção.

### Adicionado
- **Migração para Render Free:** API publicada e promovida para produção na branch `main`, com health check, execução controlada das migrações Alembic e documentação operacional em `docs/DEPLOYMENT_RENDER_FREE.md`.
- **Registro de evolução:** Incidentes dos primeiros deploys, correções aplicadas e critérios de rollout documentados em `docs/change-records/2026-08-24-render-free-migration.md`.
- **Frontend em produção:** CSP permite o domínio Render e `NEXT_PUBLIC_API_URL` está configurada na Vercel para Production e Preview.

### Corrigido
- **Migração de unicidade de candidatos:** Índices legados agora são removidos com `IF EXISTS`, tornando a migração segura para bases que não possuem todos os nomes históricos.

### Validado
- O Render é o ambiente principal da API (`https://talentflow-api-free.onrender.com`), o frontend de produção na Vercel já o utiliza e os fluxos autenticados básicos foram exercitados com uma conta de teste. O Fly.io está parado e mantido apenas como fallback manual.


## [2.5.0] — 2026-08-17

Esta versão consolida o **ciclo de segurança e manutenção** do TalentFlow: hardening completo de backend e frontend, correção crítica da hidratação do Next.js, e automação de prevenção de vazamentos de segredos. Inclui também o plano de manutenção de segurança documentado em `01-Documentos/02-Planejamento/talentflow-plano-seguranca-2026-08.md`.

### Adicionado
- **Workflow de Secret Scan no CI (`.github/workflows/secret-scan.yml`):** Varre o repositório em push (`main`, `feature/*`) e PRs contra `main` com os mesmos padrões de credencial do hook de pré-commit, falhando o build se qualquer segredo for detectado.
- **`talentflow-web/.env.example`:** Exemplo de variáveis de ambiente do frontend (`NEXT_PUBLIC_API_URL`, `NEXT_PUBLIC_ENABLE_DESIGN_SWITCHER`) com exceção no `.gitignore` para permitir versionamento.
- **`safeError.ts` (frontend):** Helper que redige campos sensíveis de erros de API antes de logar no console.
- **Claim `name` no JWT:** Inclusão de `full_name`/`name` nos tokens emitidos em `/login` e `/register`, permitindo ao frontend derivar o nome do usuário do próprio payload.

### Corrigido
- **CSP `script-src` sem `unsafe-inline` bloqueava a hidratação do Next.js (crítico):** A CSP de produção não permitia os scripts inline de bootstrap do RSC (`self.__next_f.push`), fazendo a página renderizar o HTML do servidor mas nunca hidratar — sintoma de "Carregando dados..." infinito em qualquer navegador/dispositivo. Corrigido para `script-src 'self' 'unsafe-inline'` em produção (`'unsafe-eval'` segue restrito ao dev).
- **Visualizador de PDF via `fetch + Blob`:** Substituição do iframe com `?token=` na URL por `fetch()` → `URL.createObjectURL()`, eliminando exposição do JWT em URL/histórico/logs (contorno Safari documentado).
- **Derivação de sessão a partir do JWT (`auth.ts`):** Removidos cookies de metadata (`user_role`, `user_name`, `user_email`); role/email/name agora são lidos do payload do JWT.
- **Segurança OTP (`public_apply.py`):** Comparação em tempo constante com `hmac.compare_digest` e rate limit de 3 tentativas/minuto por candidatura.
- **Reset de senha (`auth.py`):** TTL do token reduzido de 2h para 15min e validação final com `hmac.compare_digest`.
- **Webhook Stripe:** Retorna `503` quando `STRIPE_SECRET_KEY` não está configurado.
- **Logs sanitizados (`candidates.py`):** Removido logging de detalhes do Cloudinary (URLs, `public_id`).

### Modificado
- **Hardening de backend:** RBAC (`RoleChecker`) e `require_feature()` aplicados em `jobs.py`, `categories.py`, `candidates.py`, `billing.py`; rate limits no fluxo de auth; migração Alembic de unicidade de e-mail por tenant (`tenant_id, email`).
- **Hardening de frontend:** Headers de segurança reforçados (`HSTS`, `X-Frame-Options`, `X-Content-Type-Options`, `Referrer-Policy`) e CSP restrita a domínios confiáveis (Cloudinary, Fly.io); `proxy.ts` ajustado para gerenciar apenas o cookie `token`.
- **Hook de pré-commit (`scripts/pre-commit.sh`):** Portado de `rg` (não instalado na máquina de desenvolvimento) para `grep -E`, com instalação via symlink em `.git/hooks/pre-commit`; bloqueia credenciais e paths absolutos.
- **Pin da action de CI (`fly-deploy.yml`):** `superfly/flyctl-actions/setup-flyctl` fixada a SHA específico em vez de branch `@master`.
- **Versionamento:** `config.py`, `pyproject.toml`, `package.json`, `package-lock.json`, `Footer.tsx` e `AGENTS.md` atualizados para 2.5.0.


## [2.4.0] — 2026-08-04

Esta versão entrega o **Workspace de Auditoria Side-by-Side com Proxy de PDF**, permitindo que recrutadores visualizem o currículo original lado a lado com os dados extraídos pela IA, diretamente no navegador — incluindo Safari. Inclui também a consolidação da documentação de produto (READMEs, features docs e AGENTS.md) cobrindo todas as funcionalidades implementadas desde a v1.0.

### Adicionado
- **Serviço Proxy Inline de PDF (`GET /api/candidates/{candidate_id}/pdf`):** Consome arquivos privados do Cloudinary via URL assinada (`cloudinary.utils.private_download_url`), transmite os bytes com `Content-Type: application/pdf` e `Content-Disposition: inline`, com Cache-Control de 24h e `Access-Control-Allow-Origin: *`.
- **Workspace de Auditoria Side-by-Side (`CandidateAuditWorkspace.tsx`):** Layout de tela cheia 50/50 comparando o PDF original (esquerda) com a análise estruturada da IA (direita), com navegação em lote de candidatos e botões de aprovação/sinalização.
- **Visualizador de PDF Resiliente (`PDFViewer.tsx`):** Componente de iframe cross-origin com injeção automática de token JWT via query string, gating anti-race condition, SSR hydration seguro, e fallback de erro com link para abrir em nova guia.
- **Autenticação Cross-Origin para Iframes (`deps.py`):** `get_current_user` aceita token JWT via `?token=` query parameter como terceira fonte de autenticação (após Authorization header e cookie HttpOnly), contornando bloqueios de cookies de terceiros no Safari.
- **Parse de `CLOUDINARY_URL` no Config (`config.py`):** `@model_validator` que extrai automaticamente `CLOUDINARY_CLOUD_NAME`, `CLOUDINARY_API_KEY` e `CLOUDINARY_API_SECRET` do formato `cloudinary://key:secret@name`, eliminando configuração manual de 3 env vars separadas.
- **Logging Detalhado no Proxy PDF:** Rastreamento de cada etapa do pipeline Cloudinary (extração de `public_id`, geração de signed URL, status HTTP, fallback direto) via `[pdf_proxy]` prefix para diagnóstico em produção via `fly logs`.

### Corrigido
- **CSP `frame-src` sem `localhost:8000` (`next.config.ts`):** O navegador bloqueava silenciosamente o iframe em desenvolvimento local por inconsistência entre `connect-src` (que permitia localhost) e `frame-src` (que só permitia `https:`).
- **Race Condition de Token JWT (`PDFViewer.tsx`):** O iframe renderizava antes do `useEffect` ler o cookie, disparando 401 na API. Corrigido com gating por estado `tokenReady`.
- **SSR Hydration do Cookie (`PDFViewer.tsx`):** `useState(() => getCookie("token"))` executava no servidor (onde `document` é `undefined`) retornando `null` permanente em produção. Corrigido restaurando `useEffect` para leitura pós-hidratação.
- **Deploy Fly.io Travado em `gru` (`fly.toml`):** Falta de capacidade na região de São Paulo bloqueou 3 deploys consecutivos. Região primária alterada para `dfw` (Dallas) onde as máquinas já estavam operando.

### Modificado
- **Região Fly.io:** `primary_region` alterada de `gru` para `dfw`.
- **Documentação Técnica:** Consolidação completa de 22 arquivos — READMEs, features docs, AGENTS.md, CHANGELOG e technical snapshot — cobrindo todas as funcionalidades implementadas desde a v1.0 que estavam ausentes da documentação.


## [2.3.0] — 2026-08-04

Esta versão é um marco estratégico de engenharia no TalentFlow, introduzindo a infraestrutura moderna de gerenciamento de dependências com `uv` (PEP 621), a convenção Edge Routing `src/proxy.ts` no Next.js 16, a suíte de testes automatizados full-stack com Pytest e Vitest, e o serviço centralizado de Governança de Feature Flags por Tenant B2B.

### Adicionado
- **Workspace de Auditoria Side-by-Side (`CandidateAuditWorkspace.tsx`):** Interface de tela cheia sem modais para comparação de currículos 50/50 em tempo real (PDF original no Cloudinary vs. Inteligência da IA), incluindo navegação em lote de candidatos e botões para aprovação ou sinalização (Blacklist).
- **Gerenciamento de Pacotes Python com `uv` (`pyproject.toml` & `uv.lock`):** Adoção oficial do manifesto PEP 621 e lockfile determinístico via `uv`, modernizando a infraestrutura do backend com Dockerfile otimizado no Fly.io.
- **Governança de Feature Flags B2B (`app/services/features.py`):** Sistema de controle de permissões por plano (`free`, `pro`, `enterprise`) com a tabela `PLAN_FEATURES` em `config.py` e o guardião de rotas `Depends(require_feature())` em `deps.py`.
- **Suíte de Testes Automatizados Backend (`uv run pytest`):** Testes integrados cobrindo rotas de saúde pública (`test_health.py`), resolução resiliente de vagas (`test_job_lookup.py`), validação de Pydantic schemas (`test_schemas.py`) e regras de Feature Flags (`test_features.py`).
- **Suíte de Testes Automatizados Frontend (`npm test`):** Bateria de testes unitários com Vitest e React Testing Library em `src/test/` para componentes UI e tipos de domínio.
- **Convenção Next.js 16 Edge Proxy (`src/proxy.ts`):** Roteamento e validação de tokens JWT na borda da Vercel Edge sem alertas de depreciação Turbopack.
- **Navegação Responsiva Mobile:** Menu Hambúrguer com Drawer translúcido, animações Framer Motion, backdrop blur e lock de scroll em `Navbar.tsx`.
- **UX & Componentes:** Dropdown customizado e estilizado para Seleção de Vagas em *Scores de Compatibilidade* no Dashboard.

### Modificado
- **Navegação do Logo:** Ajustada a rota do logo da marca em `Navbar.tsx` para direcionar usuários autenticados diretamente para `/dashboard`.
- **Documentação de Engenharia:** Atualização completa dos manuais `talentflow-api/README.md`, `talentflow-web/README.md` e `technical-snapshot.md`.


## [2.2.0] — 2026-08-04

Esta versão consolida a auditoria e refatoração completa de arquitetura (Web & API), corrigindo vazamentos de conexões, eliminando memory leaks de UI, introduzindo schemas Pydantic declarativos e padronizando as camadas de dados e tipos no frontend.

### Adicionado
- **Schemas Canônicos de Extração (`app/schemas/extraction.py`):** Isolamento de `CandidateExtraction` e `ExperienceItem` em módulo Pydantic canônico, eliminando acoplamentos com o CLI `ingest.py`.
- **DTOs Pydantic de Resposta (`app/schemas/job.py`):** Interfaces `JobResponse` e `PublicJobResponse` com `model_config = ConfigDict(from_attributes=True)` para serialização tipada das rotas de vagas.
- **Utilitário de Resolução de Vagas (`app/services/job_lookup.py`):** Função `resolve_job_id()` centralizando a resolução resiliente por UUID vs. Slug semântico.
- **Camada de Tipos do Frontend (`src/types/`):** Módulos centralizados `job.ts`, `candidate.ts`, `category.ts` e barrel `index.ts`.
- **Camada de Data Fetching (`src/lib/data/`):** Módulos Server Component `jobs.ts`, `candidates.ts` e `categories.ts` com tratamento unificado de auth.
- **Gerenciamento de Pacotes Python com `uv` (`pyproject.toml` & `uv.lock`):** Adoção oficial do manifesto PEP 621 e lockfile determinístico via `uv`, modernizando a infraestrutura do backend.
- **Sistema de Design & UX (`DESIGN.md` & `CLAUDE.md`):** Padronização formal das diretrizes visuais e regras técnicas de desenvolvimento.

### Corrigido
- **Connection Leak no Pipeline de IA (P0):** Injeção de `finally: fallback_db.close()` no tratamento de exceção em `public_apply.py`.
- **Memory Leak de Polling no Upload em Lote:** `useRef` e hook de unmount para `setInterval` em `BatchUploadButton.tsx`.
- **Redirecionamento Incondicional no 401:** `jobs/page.tsx` e `smart-match/page.tsx` agora redirecionam para `/login` ao detectar sessão expirada.
- **Classes CSS Tailwind Inválidas:** Substituição de `emerald-550`, `rose-550` e `amber-550` por tokens padronizados em `ConflictModal.tsx`.

### Modificado
- **Configuração Explícita do Pool DB:** `pool_size=5` e `max_overflow=10` no `create_engine` em `database.py`.
- **Fonte Única para `PLAN_LIMITS`:** Centralização no `Settings` em `config.py` e consumo padronizado na API de Auth e Billing.
- **Refatoração Semântica de Cores (OKLCH):** Substituição de cores estáticas por variáveis semânticas do tema em componentes principais.


## [2.1.0] — 2026-07-20

Esta versão adiciona **21 correções de auditoria full-stack** abrangendo segurança, performance e UX, além de refatorar o sistema de autenticação para cookies HttpOnly.

### Adicionado
- **Cache de Match Results (F06):** `DashboardClient` agora cacheia resultados de match por job em `useRef<Map>`, eliminando requisições redundantes ao alternar entre jobs.
- **Skeleton Cards em Páginas (F07):** Grades de skeleton animados nos fallbacks de `Suspense` para as páginas de Vagas e Smart Match, substituindo spinners genéricos.
- **Empty State Inteligente (F08):** `SmartMatchDashboard` exibe estado vazio com link direto para "Gestão de Vagas" quando não há vagas cadastradas.
- **Títulos de Página Dinâmicos (F09):** `layout.tsx` agora usa `title.template: "%s | TalentFlow"` e todas as páginas internas (Dashboard, Candidatos, Vagas, Smart Match, Categorias) possuem `metadata` individual.
- **Feedback Visual Pós-Login (F10):** Tela de login exibe animação `CheckCircle2` com atraso de 1.5s antes do redirect, melhorando a percepção de sucesso.

### Modificado
- **Autenticação via HttpOnly Cookie (F04):** Substituição do `Authorization` header por cookie `HttpOnly; Secure; SameSite=Lax` em toda a aplicação. Tokens JWT não transitam mais pelo JavaScript do cliente. Envolveu 17 arquivos entre API (cookie helper + logout endpoint + cookie fallback em `deps.py`) e frontend (novo `api.ts` wrapper com `credentials: 'include'`, `auth.ts` simplificado, 14 componentes cliente).
- **DTO de Experiência Unificado (I03):** Padronização dos campos `company` → `company_name`, `title` → `job_title`, `desc` → `description` no backend (`candidates.py`) e frontend (`CandidateTable.tsx`, `CandidateModal.tsx`).

### Corrigido
- **Isolamento Multi-Tenant em Queries Agregadas (B01):** Substituição de `db.db.query` por `get_scoped_db` no dashboard e candidatos, e remoção de filtros manuais de `tenant_id` que falhavam silenciosamente com `FunctionElement`.
- **Segurança OTP (B03, B07, B10):** Rate-limit de 5 tentativas por minuto por email, armazenamento de OTPs com hash SHA-256 (não mais plaintext), e correção de variável `fallback_db` que sombreava parâmetro da função.
- **Security Headers + Secure Flag (F02, F03):** Adição de CSP, `X-Frame-Options`, `X-Content-Type-Options`, `Strict-Transport-Security` e `Referrer-Policy` em `next.config.ts`. Cookie `Secure` agora é condicional ao ambiente de produção.
- **Lock Assíncrono no Sandbox (B04):** Adição de `threading.Lock` ao redor do acesso ao dicionário de budget do sandbox público para evitar condição de corrida.
- **Eliminação de N+1 Query (B05):** Versões de candidatos agora são obtidas em uma única consulta SQL com montagem da árvore em memória, ao invés de uma query por candidato.
- **JWT Tighter (B06):** Expiração reduzida de 24h para 4h, e adição do claim `iss` (issuer) = `"talentflow"`.
- **Versionamento e Limpeza (B08, B09):** Sincronização da versão em `config.py` e remoção de `Session` não utilizada em `jobs.py`.
- **Validação de Senha (F05):** `min_length=8` aplicado via `Field()` nos schemas Pydantic de registro, login e change-password.
- **Redundant `res.json()` no Login:** `login/page.tsx` chamava `res.json()` após `apiFetch` que já retorna o dado desserializado, causando `TypeError` em runtime.

## [1.3.0] — 2026-06-24

Esta versão traz **otimizações críticas de performance de rede, políticas de cache em múltiplas camadas, compressão severa de imagens de marca e migração de infraestrutura de Dallas para São Paulo**, reduzindo drasticamente o tempo de carregamento no Safari e eliminando latência transatlântica.

### Adicionado
- **Otimização de Imagens de Marca (WebP):** Geração de versões `/brand/logo-dark.webp` e `/brand/logo-light.webp` de alta performance redimensionadas para $256 \times 256$ pixels (otimizado para telas de altíssima densidade).
- **Scripts de Otimização Automatizada:** Script `scripts/optimize-images.js` utilizando a biblioteca `sharp` para automatizar o redimensionamento e compressão de assets de marca.
- **Script de Migração de Banco:** Criado o script `talentflow-api/migrate_db_data.py` para sincronização inteligente de esquemas e dados entre projetos do Postgres no Neon, contornando a ausência de privilégios de superusuário e resolvendo dependências de FK auto-referenciais.

### Modificado
- **Identidade Visual Unificada (Logos WebP):** Substituição definitiva do antigo box azul genérico "TF" pelos logos oficiais da marca em formato WebP nos cabeçalhos e formulários de todas as páginas públicas, fluxos de autenticação e termos (LandingHeader, Navbar, Footer, Login, Privacidade, Termos de Uso, Convite e Alteração de Senha).
- **Redirecionamento Pós-Login:** Mudança da lógica de redirecionamento em `login/page.tsx` para usar navegação soft via router (`router.push()`) e destino padrão `/dashboard`, evitando recargas completas desnecessárias de página.
- **Geolocalização da API (Fly.io):** Alteração da região primária do Fly.io de Dallas (`dfw`) para São Paulo (`gru`) no arquivo `fly.toml` para colocalizar a execução do backend com os usuários no Brasil.
- **Banco de Dados (Neon DB):** Substituição do banco de dados hospedado em N. Virginia (`us-east-1`) pelo novo banco de dados em São Paulo (`sa-east-1`), migrando com segurança 100% dos dados (candidatos, vagas, usuários e logs).

### Corrigido
- **Segregação de Cache em Múltiplas Camadas (`vercel.json` & `next.config.ts`):** Aplicação de cabeçalhos de cache `public, max-age=31536000, immutable` para chunks estáticos e `public, max-age=86400, stale-while-revalidate=3600` para assets de marca, limitando o `no-store` estrito apenas a documentos HTML.
- **Consolidação de Listeners de Scroll:** Redução de dois listeners redundantes de scroll para um único handler passivo (`{ passive: true }`) em `LandingHeader.tsx`, mitigando layout thrashing em WebKit/Safari.
- **Compressão Extrema de Assets:** Redução do arquivo `logo-dark.png` de $657$ KB para $15$ KB (PNG) e $3.5$ KB (WebP). Redesing e compressão profunda do `og-image.png` de $1.04$ MB para apenas **$46$ KB** (redução de 95%) através de composição híbrida SVG, quantização de cores e posicionamento geométrico centralizado.
- **Resolução do Preview de Imagem OpenGraph (WhatsApp):** Correção do `metadataBase` e `url` do OpenGraph em `layout.tsx` de `spacesquare.com.br` (domínio inativo) para `tlntflow.vercel.app` (domínio ativo), permitindo que scrapers de mídias sociais e WhatsApp resolvam e exibam corretamente a imagem de visualização de link (`og-image.png`).

## [1.2.0] — 2026-06-23

Esta versão traz **melhorias de navegação, usabilidade e refinamento estético na landing page** do TalentFlow, com suporte a chaveamento de temas e correção de legibilidade no motor visual do hero.

### Adicionado
- **Botão de Escolha de Tema:** Integrador do componente de alternância de tema (`ThemeToggle`) diretamente no cabeçalho da landing page.
- **Cabeçalho Dinâmico (`LandingHeader`):** Barra de navegação inteligente com `IntersectionObserver` que rastreia e destaca ativamente a seção atual na tela.
- **Retorno Suave ao Topo (`ScrollToTop`):** Botão flutuante premium e animado para voltar ao início da página de forma suave.
- **Exibição da Versão na Landing:** Versão do sistema agora é exibida de forma sutil no rodapé simples das páginas públicas.

### Corrigido
- **Contraste de Legibilidade no HeroVisual:** Aumentada a opacidade de passos futuros no terminal de simulação da IA para $45\%$ (anteriormente $25\%$), garantindo leitura ideal.
- **Badges Ocultando Limites (Fronteiras):** Solidificação dos fundos dos emblemas flutuantes (`✓ em segundos` e `🧠 Groq + Gemini`) para evitar que a cor escura do terminal vazasse sob fundos semitransparentes.
- **Eliminação de Loaders Redundantes:** Substituição do spinner de `"Processando com IA..."` por um cérebro inteligente em pulso (`Brain` animate-pulse) para evitar múltiplos spinners simultâneos.
- **Suporte Geral a Temas (Light/Dark):** Adicionadas classes de cores e fundos específicos `dark:` a todos os cards bento e ícones estáticos da landing page.

---

## [1.1.0] — 2026-06-22

Esta versão foca em **estabilidade, segurança, robustez de sessão e refinamentos visuais de UX/UI** após a varredura técnica pós-lançamento.

### Adicionado
- **Robustez contra Sessão Expirada (Next.js Middleware):** Validação temporal ativa do campo `exp` no payload JWT na borda (Edge). Sessões expiradas removem cookies de login automaticamente e redirecionam para `/login`.
- **Intercepção 401 em Server Components:** Tratamento explícito de respostas HTTP `401 Unauthorized` nos carregamentos do Dashboard e candidatos. Redirecionamentos limpos (`redirect('/login')`) agora interceptam a falha de autenticação antes de renderizar dados nulos ou quebrar a tela com erros de console.
- **Log de Inicialização do Backend:** Registro formal e visível no terminal com a versão do sistema FastAPI na inicialização do servidor.
- **Variáveis de Ambiente Incompletas:** Adicionadas variáveis ausentes do Stripe, segurança e sandbox no arquivo `.env.example`.

### Modificado
- **Lógica Estética de Paginação (Footer):** Refatoração do algoritmo de controle numérico (`getPageNumbers`) no component `CandidateTable.tsx` para suprimir elipses redundantes e exibir números adjacentes se houver apenas um elemento oculto.
- **Versionamento Dinâmico no Backend:** O FastAPI e os endpoints `/health` e `/api/health` agora informam dinamicamente a versão estruturada lendo `settings.VERSION`.

### Corrigido
- **Loop Infinito de Redirecionamento no Safari (ITP) e Headers de Cache:** O middleware foi aprimorado para não realizar redirecionamentos 307 para `/login` se a requisição com cookies expirados já tiver como destino uma rota pública, quebrando o ciclo de recarregamento e excluindo os cookies corrompidos na resposta via `NextResponse.next()`. Adicionados cabeçalhos `Cache-Control: no-store` estritos nos redirects gerados pelo middleware para evitar cache de rotas obsoletas.
- **Evitar Stale Cache de Páginas HTML (Safari deploy loop):** Criação do arquivo `vercel.json` na raiz do frontend com diretrizes de `Cache-Control` restritas (`no-store, no-cache`) em todas as rotas e páginas HTML, mitigando loop de travamento de memória e processador gerado pelo Safari ao tentar carregar chunks desatualizados após deploys.
- **Arredondamento Seguro (`average_quality`):** Inserida guarda com conversão explícita para float antes do `round()` para estatísticas do tenant de candidatos vazios.
- **Vazamento de Multi-Tenancy e N Queries no Dashboard:** O endpoint `/api/dashboard/stats` migrou para `get_scoped_db`, removendo cláusulas manuais de `tenant_id` e reduzindo o número de consultas de 11 para 5 via agregação SQL condicional.
- **Cap de Paginação (OOM Guard):** Parâmetro `limit` agora possui cap estrito de 100 itens via `Query(..., le=100)` para mitigar riscos de falta de memória (Out Of Memory) na máquina local/produção.
- **Reset de Página no Filtro:** A paginação da listagem de candidatos agora reseta obrigatoriamente para `page=1` ao aplicar buscas ou alternar categorias no frontend.

---

## [1.0.0] — 2026-06-21

Lançamento oficial da **versão de produção estável** do **TalentFlow**, convertendo o MVP inicial em uma plataforma SaaS escalável e de nível corporativo (*Enterprise-Ready*).

### Adicionado
- **Faturamento e Planos (Stripe Integration):** Sistema de checkout de planos e portal de faturamento do cliente integrado com aplicação ativa de limites de cota de upload em banco.
- **Auditoria & Observabilidade:** Persistência transparente de logs de auditoria na tabela `AuditLog` mapeando criações, visualizações e exclusões de recursos.
- **Sandbox de IA Pública:** Demonstrador de extração de currículos ao vivo na landing page sob limites de taxa (Rate Limit) controlados na memória por IP de visitante.
- **Design System Moderno (Tailwind v4 & OKLCH):** Bento Grid Layout, dual-theme inteligente com Next-Themes, e micro-interações via Framer Motion.

---

## [0.9.0] — 2026-06-21

### Adicionado
- **Smart Match com Explicabilidade IA:** Motor inteligente de compatibilidade de vagas (`match_engine.py`) usando Llama 3.3 (Groq) com fallback para Gemini, cache persistente em banco (`job_matches`) e semáforo de concorrência (`asyncio.Semaphore(3)`).
- **Ingestão Concorrente em Lote:** Envio de múltiplos currículos estruturado com processamento assíncrono via `BackgroundTasks` no FastAPI e monitoramento em tempo real no frontend.
- **Isolamento de Dados Multi-Tenant:** Implementação lógica de multitenancy na camada de banco de dados e unicidade de competências composta: `UniqueConstraint('tenant_id', 'name')`.

---

## [0.8.0] — 2026-06-21

### Adicionado
- **Dashboard Bento Grid:** Painel inicial bento grid com cards interativos, indicadores macro e visualização de candidatos recentes.
- **Reorganização de Layout Flexível:** Nova estrutura CSS-First baseada em flexbox eliminando barras de rolagem artificiais em layouts longos.

---

## [0.7.0] — 2026-06-21

### Adicionado
- **Segurança RBAC (Role-Based Access Control):** Rotas autenticadas protegidas no frontend e backend por perfil (`SuperAdmin`, `Manager`, `Recruiter`).
- **Autenticação de Borda (Edge):** Decodificação e validação inicial do token JWT na borda do servidor (Edge Middleware) sem sobrecarregar o banco de dados.
- **Controle de Acesso de Convites:** Tela de convite de novos colaboradores restrita e protegida no frontend e backend baseada no cargo do usuário ativo.

---

## [0.6.0] — 2026-06-20

### Adicionado
- **CRUD Completo de Vagas (Jobs):** Endpoints de criação, listagem, atualização e remoção de vagas estruturadas com descrições, responsabilidades e competências exigidas.
- **CRUD Completo de Categorias:** Organização estruturada do banco de talentos por áreas de atuação.
- **Migrações de Banco de Dados:** Registro histórico e estrutural das tabelas de vagas e categorias via migrations Alembic.

---

## [0.5.0] — 2026-06-20

### Adicionado
- **Versionamento de Candidatos:** Implementado controle de histórico de alterações de currículos utilizando as chaves `version` e `parent_id` na entidade `Candidate`.
- **Prevenção de Duplicados (Hash PDF):** Sistema de integridade que gera hashes criptográficos dos arquivos enviados para detecção de duplicados.
- **Visual Diff Resolution (ConflictModal):** Interface rica com React Portal e Scroll Lock que exibe as diferenças em tela (Visual Diff) permitindo ao recrutador decidir entre sobrescrever as informações antigas ou manter ambas no sistema.

---

## [0.4.0] — 2026-06-19

### Adicionado
- **CV Quality Score (Legibility Scoring Engine):** Motor de análise de currículos que calcula uma nota de preenchimento estruturada baseada na presença de experiências, links, e dados essenciais.
- **Alertas de Qualidade:** Geração de avisos automáticos e tags visuais (`Quality Alerts`) no perfil do candidato caso faltem dados críticos no currículo (ex: telefone, e-mail, tempo de permanência curto em empresas).

---

## [0.3.0] — 2026-06-18

### Adicionado
- **Filtros Avançados de Candidatos:** Listagem com filtros compostos dinâmicos por categoria de atuação, termo textual e tags de habilidades.
- **Visual Glow Animations:** Micro-interações com luzes e glows estéticos em cards dinâmicos.

---

## [0.2.0] — 2026-06-17

### Adicionado
- **Migração para Neon DB (PostgreSQL):** Adaptação do ORM para banco de dados relacional hospedado na nuvem e configuração do pool de conexões resiliente (`pool_pre_ping`).
- **Ingestão Híbrida com OCR (Gemini API):** Implementado motor de OCR para extração estruturada de currículos em formato de imagem ou PDFs escaneados via fallback automático para Gemini Flash.
- **Processador Principal (Groq + Llama 3.3):** Extrator de dados textuais nativos otimizado via Llama 3.3 de baixa latência.
- **Hospedagem de Mídia (Cloudinary):** Armazenamento de fotos de perfil e arquivos PDF originais integrados de forma segura na nuvem.

---

## [0.1.0] — 2026-06-16

### Adicionado
- **MVP Inicial (Monorepo):** Estrutura inicial do projeto contendo frontend Next.js v16, API FastAPI em Python, ORM SQLAlchemy + Alembic, e persistência de candidatos básica.

# Changelog — TalentFlow

Todas as atualizações notáveis deste projeto são documentadas neste arquivo, seguindo o padrão [Semantic Versioning (SemVer)](https://semver.org/spec/v2.0.0.html) e o formato [Keep a Changelog](https://keepachangelog.com/pt-BR/1.1.0/).


---


## [1.3.0] — 2026-06-24

Esta versão traz **otimizações críticas de performance de rede, políticas de cache em múltiplas camadas, compressão severa de imagens de marca e migração de infraestrutura de Dallas para São Paulo**, reduzindo drasticamente o tempo de carregamento no Safari e eliminando latência transatlântica.

### Adicionado
- **Otimização de Imagens de Marca (WebP):** Geração de versões `/brand/logo-dark.webp` e `/brand/logo-light.webp` de alta performance redimensionadas para $256 \times 256$ pixels (otimizado para telas de altíssima densidade).
- **Scripts de Otimização Automatizada:** Script `scripts/optimize-images.js` utilizando a biblioteca `sharp` para automatizar o redimensionamento e compressão de assets de marca.
- **Script de Migração de Banco:** Criado o script `talentflow-api/migrate_db_data.py` para sincronização inteligente de esquemas e dados entre projetos do Postgres no Neon, contornando a ausência de privilégios de superusuário e resolvendo dependências de FK auto-referenciais.

### Modificado
- **Substituição de Logos em Componentes:** Atualização dos componentes `LandingHeader`, `Navbar` e `Footer` para utilizarem as versões WebP.
- **Redirecionamento Pós-Login:** Mudança da lógica de redirecionamento em `login/page.tsx` para usar navegação soft via router (`router.push()`) e destino padrão `/dashboard`, evitando recargas completas desnecessárias de página.
- **Geolocalização da API (Fly.io):** Alteração da região primária do Fly.io de Dallas (`dfw`) para São Paulo (`gru`) no arquivo `fly.toml` para colocalizar a execução do backend com os usuários no Brasil.
- **Banco de Dados (Neon DB):** Substituição do banco de dados hospedado em N. Virginia (`us-east-1`) pelo novo banco de dados em São Paulo (`sa-east-1`), migrando com segurança 100% dos dados (candidatos, vagas, usuários e logs).

### Corrigido
- **Segregação de Cache em Múltiplas Camadas (`vercel.json` & `next.config.ts`):** Aplicação de cabeçalhos de cache `public, max-age=31536000, immutable` para chunks estáticos e `public, max-age=86400, stale-while-revalidate=3600` para assets de marca, limitando o `no-store` estrito apenas a documentos HTML.
- **Consolidação de Listeners de Scroll:** Redução de dois listeners redundantes de scroll para um único handler passivo (`{ passive: true }`) em `LandingHeader.tsx`, mitigando layout thrashing em WebKit/Safari.
- **Compressão Extrema de Assets:** Redução do arquivo `logo-dark.png` de $657$ KB para $15$ KB (PNG) e $3.5$ KB (WebP). Compressão de `og-image.png` de $1.04$ MB para $327$ KB através de quantização de paleta e compressão forte.


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

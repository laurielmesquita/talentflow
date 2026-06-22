# Changelog — TalentFlow

Todas as atualizações notáveis deste projeto serão documentadas neste arquivo, seguindo o padrão [Semantic Versioning (SemVer)](https://semver.org/spec/v2.0.0.html) e o formato [Keep a Changelog](https://keepachangelog.com/pt-BR/1.1.0/).

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
- **Arredondamento Seguro (`average_quality`):** Inserida guarda com conversão explícita para float antes do `round()` para estatísticas do tenant de candidatos vazios.
- **Vazamento de Multi-Tenancy e N Queries no Dashboard:** O endpoint `/api/dashboard/stats` migrou para `get_scoped_db`, removendo cláusulas manuais de `tenant_id` e reduzindo o número de consultas de 11 para 5 via agregação SQL condicional.
- **Cap de Paginação (OOM Guard):** Parâmetro `limit` agora possui cap estrito de 100 itens via `Query(..., le=100)` para mitigar riscos de falta de memória (Out Of Memory) na máquina local/produção.
- **Reset de Página no Filtro:** A paginação da listagem de candidatos agora reseta obrigatoriamente para `page=1` ao aplicar buscas ou alternar categorias no frontend.

---

## [1.0.0] — 2026-06-21

Lançamento oficial da **versão de produção estável** do **TalentFlow**, convertendo o MVP inicial em uma plataforma SaaS escalável e de nível corporativo (*Enterprise-Ready*).

### Adicionado
- **Smart Match com Explicabilidade IA:** Motor inteligente de compatibilidade de vagas (`match_engine.py`) usando Llama 3.3 (Groq) com fallback para Gemini, cache persistente em banco e semáforo de concorrência (`asyncio.Semaphore(3)`).
- **Ingestão Concorrente em Lote:** Envio de múltiplos currículos estruturado com processamento assíncrono via `BackgroundTasks` no FastAPI e monitoramento em tempo real no frontend.
- **Isolamento de Dados Multi-Tenant:** Implementação lógica de multitenancy na camada de banco de dados e unicidade de competências composta: `UniqueConstraint('tenant_id', 'name')`.
- **Faturamento e Planos (Stripe Integration):** Sistema de checkout de planos e portal de faturamento do cliente integrado com aplicação ativa de limites de cota de upload em banco.
- **Sandbox de IA Pública:** Demonstrador de extração de currículos ao vivo na landing page sob limites de taxa (Rate Limit) controlados na memória por IP de visitante.
- **Design System Moderno (Tailwind v4 & OKLCH):** Bento Grid Layout, dual-theme inteligente com Next-Themes, e micro-interações via Framer Motion.
- **Segurança RBAC (Role-Based Access Control):** Rotas autenticadas protegidas no frontend e backend por perfil (`SuperAdmin`, `Manager`, `Recruiter`).

---

## [0.1.0] — 2026-06-21

### Adicionado
- **MVP Inicial (Monorepo):** Estrutura inicial do projeto contendo frontend Next.js, API FastAPI em Python, ORM SQLAlchemy + Alembic, e persistência de candidatos básica.

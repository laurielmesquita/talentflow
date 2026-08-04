# TalentFlow: Resumo de Funcionalidades

O **TalentFlow** é uma plataforma inteligente SaaS Tier-1 desenvolvida para otimizar o fluxo de Recrutamento e Seleção (R&S) corporativo por meio de inteligência artificial de ponta e uma experiência visual de alta performance.

---

### Resumo das Principais Funcionalidades

* **Workspace de Auditoria Side-by-Side com Proxy PDF:** Tela de auditoria 50/50 que exibe o currículo original (Cloudinary) lado a lado com os dados estruturados pela IA, com injeção automática de token JWT cross-origin e compatível com Safari.
* **Candidatura Pública com Verificação OTP:** Portal público de vagas com formulário de candidatura, upload de PDF, verificação de e-mail via OTP (SHA-256), detecção automática de divergências entre dados do formulário e do currículo, e polling de status do processamento IA.
* **Faturamento e Planos (Stripe Integration):** Checkout de assinatura, portal de gerenciamento do cliente e webhook que processa automaticamente upgrades, downgrades e cancelamentos de planos com atualização de limites de cota.
* **Ingestão Concorrente em Lote:** Envio em lote com progresso em tempo real (React Portals) e processamento assíncrono controlado por semáforo de concorrência (`asyncio.Semaphore`) para eficiência de memória (512MB).
* **Processamento Híbrido com IA:** Extração instantânea de currículos estruturados via Groq (Llama 3.3) para PDFs nativos e Google Gemini (2.5 Flash) para OCR e documentos escaneados.
* **Isolamento SaaS Multi-Tenant (B2B):** Separação estrita de dados de clientes no banco via injeção centralizada de dependência (`get_scoped_db`) e constraints de unicidade por tenant (`UniqueConstraint`).
* **CV Quality Score:** Avaliação algorítmica de integridade dos currículos (0 a 100) com alertas visuais animados e sinalização de riscos (Blacklist).
* **Smart Match & Explicabilidade:** Cruzamento matemático de competências associado à geração de justificativas em português via Groq/Gemini e cache persistido em `job_matches` (*Warm Path* com tempo de resposta < 50ms).
* **Painel Interativo de Alta Performance:** Interface fluida com expansão inline elástica de candidatos (Framer Motion) e design dual-theme sob o espaço de cores OKLCH (Tailwind v4) contra distorções visuais.
* **Segurança e RBAC na Edge:** Proteção de rotas privadas por meio do Edge Middleware do Next.js, decodificando JWTs de forma nativa e filtrando permissões por cargo corporativo (SuperAdmin, Manager, Recruiter).
* **Governança de Feature Flags B2B:** Controle de acesso a funcionalidades por plano (Free/Pro/Enterprise) com 6 flags: limite de candidatos, Smart Match, upload em lote, branding customizado, alertas de qualidade e acesso à API.
* **Sandbox de IA Pública:** Demonstrador de extração de currículos ao vivo na landing page com rate limiting (3/min por IP) e budget diário (100/dia) protegido por `threading.Lock`.
* **E-mails Transacionais SMTP:** Fluxo integrado via SMTP Brevo com criptografia TLS para recuperação de senha, convites expiráveis de novos usuários e verificação OTP de candidaturas públicas.
* **Rastreabilidade e LGPD:** Suporte completo a exclusões lógicas (*soft deletes* via `deleted_at`), controle de duplicados por hash SHA-256 de PDF original, audit log de ações de usuários e versionamento de currículos.

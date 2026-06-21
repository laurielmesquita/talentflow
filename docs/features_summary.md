# TalentFlow: Resumo de Funcionalidades

O **TalentFlow** é uma plataforma inteligente SaaS Tier-1 desenvolvida para otimizar o fluxo de Recrutamento e Seleção (R&S) corporativo por meio de inteligência artificial de ponta e uma experiência visual de alta performance.

---

### Resumo das Principais Funcionalidades

* **Ingestão Concorrente em Lote:** Envio em lote com progresso em tempo real (React Portals) e processamento assíncrono controlado por semáforo de concorrência (`asyncio.Semaphore`) para eficiência de memória (512MB).
* **Processamento Híbrido com IA:** Extração instantânea de currículos estruturados via Groq (Llama 3.3) para PDFs nativos e Google Gemini (2.5 Flash) para OCR e documentos escaneados.
* **Isolamento SaaS Multi-Tenant (B2B):** Separação estrita de dados de clientes no banco via injeção centralizada de dependência (`get_scoped_db`) e constraints de unicidade por tenant (`UniqueConstraint`).
* **CV Quality Score:** Avaliação algorítmica de integridade dos currículos (0 a 100) com alertas visuais animados e sinalização de riscos (Blacklist).
* **Smart Match & Explicabilidade:** Cruzamento matemático de competências associado à geração de justificativas em português via Groq/Gemini e cache persistido em `job_matches` (*Warm Path* com tempo de resposta < 50ms).
* **Painel Interativo de Alta Performance:** Interface fluida com expansão inline elástica de candidatos (Framer Motion) e design dual-theme sob o espaço de cores OKLCH (Tailwind v4) contra distorções visuais.
* **Segurança e RBAC na Edge:** Proteção de rotas privadas por meio do Edge Middleware do Next.js, decodificando JWTs de forma nativa e filtrando permissões por cargo corporativo (SuperAdmin, Manager, Recruiter).
* **E-mails Transacionais SMTP:** Fluxo integrado via SMTP Brevo com criptografia TLS para recuperação de senha e convites expiráveis de novos usuários.
* **Rastreabilidade e LGPD:** Suporte completo a exclusões lógicas (*soft deletes* via `deleted_at`) e controle de duplicados por hash SHA-256 de PDF original.

# TalentFlow — Technical Snapshot & Post-Mortem

Este documento serve como a semente técnica (*seed*) do ecossistema TalentFlow, consolidando as correções de infraestrutura, lições aprendidas e o roadmap técnico consolidado.

---

## 1. Post-Mortem de Erros da Sessão

### ⚠️ POST-MORTEM #001: Bloqueio de Deploy na Vercel (Git Author)
* **REGRA_VIOLADA:** `PROTOCOLO_COLABORAÇÃO_ESTRITA (Regra 5)` — Configuração de e-mail de autor do git feita com base em suposições (`lauriel@spacesquare.com.br`) sem validação do endereço cadastrado no GitHub do usuário.
* **CAUSA_RAIZ:** O mecanismo *Commit Author Verification* da Vercel bloqueou builds automáticos porque o autor do commit local não coincidia com o e-mail verificado do GitHub.
* **AÇÃO_CORRETIVA:**
  1. Correção do e-mail do Git local para o e-mail global verificado: `laurielmesquita@me.com`.
  2. Ajuste do autor do commit via `git commit --amend --reset-author --no-edit`.
  3. Realização de push forçado (`git push origin main --force`) para re-sincronizar a branch remota.

### ⚠️ POST-MORTEM #002: Sumiço Temporário dos Candidatos (Nenhum candidato encontrado)
* **CAUSA_RAIZ:** O comando local `npx vercel build --prod` substituiu as variáveis locais de ambiente e removeu a chave `NEXT_PUBLIC_API_URL` do Edge runtime compilado na Vercel, forçando o frontend a tentar chamar o backend em `http://localhost:8000` (localhost do usuário/cliente), gerando falha silenciosa de rede.
* **AÇÃO_CORRETIVA:** Registro explícito da variável de ambiente via CLI da Vercel: `npx vercel env add NEXT_PUBLIC_API_URL production --value https://talentflow-api-frosty-seastar-3318.fly.dev --yes`.

---

## 2. Status Atual da Infraestrutura de Produção

### Backend (talentflow-api)
* **Status:** 🟢 Ativo e Saudável
* **Host:** Fly.io (`talentflow-api-frosty-seastar-3318`)
* **Live URL:** `https://talentflow-api-frosty-seastar-3318.fly.dev`
* **Conectividade Neon (Banco de Dados):** Configuração de `pool_pre_ping=True` e `pool_recycle=300` ativa para mitigar perdas de conexão em decorrência do autosuspend automático das instâncias da Neon.
* **Secrets Fly Ativos:** `DATABASE_URL`, `GROQ_API_KEY`, `GEMINI_API_KEY`, `CLOUDINARY_CLOUD_NAME`, `CLOUDINARY_API_KEY`, `CLOUDINARY_API_SECRET`, `SMTP_HOST`, `SMTP_PORT`, `SMTP_USERNAME`, `SMTP_PASSWORD`.

### Frontend (talentflow-web)
* **Status:** 🟢 Ativo e Saudável
* **Host:** Vercel (`talentflow-web-flame`)
* **Live URL:** `https://talentflow-web-flame.vercel.app`
* **Módulos Ativos:**
  * Ingestão Concorrente em Lote (React Portals).
  * Smart Match Engine (Groq Llama 3.3 + Gemini fallback) com cache `job_matches` (*Warm Path*).
  * Dual-Theme (OKLCH) com expansão de cards elástica (Framer Motion).
  * Autenticação e RBAC isolados no Next.js Edge Middleware.

---

## 3. Próximos Passos (Alinhado com o Roadmap v2 - 21/06/2026)

Com a consolidação da documentação técnica e auditoria de código realizadas em 21/06/2026, as prioridades imediatas de engenharia são:

1. **Correção de Unicidade Multi-Tenant:**
   * Trocar a constraint de unicidade global de `name` nas tabelas `Category` e `Skill` por uma restrição composta tenant-scoped: `UniqueConstraint('tenant_id', 'name')`, gerando a respectiva migração via Alembic.
2. **Correções de Suspense no Frontend:**
   * Envelopar chamadas a `useSearchParams()` em boundaries de `<Suspense />` nas rotas `/login`, `/reset-password` e `/invite/accept` para sanar os riscos de quebra de Hydration Mismatch em produção.
3. **Limitação de Concorrência em Ingestão:**
   * Introduzir `asyncio.Semaphore(3)` na ingestão concorrente em background para proteger a capacidade de 512MB de memória da Fly.io.
4. **Remoção de Mock de Match Score:**
   * Localizar e remover o match score de teste (fixado em `88` na interface) para ler os dados reais calculados da tabela `job_matches`.
5. **Auditoria de Estática em `/`:**
   * Investigar e garantir que a Landing Page na raiz `/` seja compilada de forma puramente estática para otimizar velocidade de carregamento e pontuação no Core Web Vitals.

---
*Snapshot gerado e revisado em: 2026-06-21 13:25:00 (GMT-03:00)*

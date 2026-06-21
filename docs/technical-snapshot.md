# TalentFlow — Technical Snapshot & Post-Mortem

Este documento serve como a semente técnica (seed) para a próxima sessão de desenvolvimento do ecossistema TalentFlow.

---

## 1. Post-Mortem de Erros da Sessão

### ⚠️ POST-MORTEM #001: Bloqueio de Deploy na Vercel (Git Author)
* **REGRA_VIOLADA:** `PROTOCOLO_COLABORAÇÃO_ESTRITA (Regra 5)` — O agente anterior configurou a autoria do Git local utilizando uma suposição (`lauriel@spacesquare.com.br`) sem validar o e-mail verificado associado à conta do GitHub/Vercel do usuário.
* **CAUSA_RAIZ:** A Vercel possui um mecanismo de segurança chamado *Commit Author Verification*. Como o e-mail do autor do commit local não coincidia com nenhum e-mail verificado no GitHub do usuário, todos os builds automáticos disparados por pushes e deploys locais manuais foram bloqueados no estado `Blocked` (gerando o status `UNKNOWN` na CLI local).
* **AÇÃO_CORRETIVA:** 
  1. O e-mail do Git local foi reconfigurado localmente para o e-mail global verificado do usuário: `laurielmesquita@me.com`.
  2. O autor do último commit foi corrigido retroativamente via `git commit --amend --reset-author --no-edit`.
  3. Foi realizado um push forçado (`git push origin main --force`) para atualizar a árvore remota do Git.

### ⚠️ POST-MORTEM #002: Sumiço Temporário dos Candidatos (Nenhum candidato encontrado)
* **CAUSA_RAIZ:** O build local manual (`npx vercel build --prod`) sobrescreveu as configurações de ambiente injetando o arquivo de produção oficial da Vercel, o qual não continha a variável de ambiente `NEXT_PUBLIC_API_URL` cadastrada na nuvem (pois ela estava configurada apenas em um `.env.production` local que é sobrescrito no pull do build). Sem essa variável na nuvem, o frontend compilou com o fallback `http://localhost:8000` (localhost do servidor), fazendo com que a listagem de candidatos em produção falhasse no navegador.
* **AÇÃO_CORRETIVA:** A variável de ambiente `NEXT_PUBLIC_API_URL` foi cadastrada com sucesso na nuvem do projeto da Vercel usando a CLI local (`npx vercel env add NEXT_PUBLIC_API_URL production --value https://talentflow-api-frosty-seastar-3318.fly.dev --yes`). 

---

## 2. Status Atual da Infraestrutura de Produção

### Backend (talentflow-api)
* **Status:** 🟢 Ativo e Saudável
* **Host:** Fly.io (`talentflow-api-frosty-seastar-3318`)
* **Live URL:** `https://talentflow-api-frosty-seastar-3318.fly.dev`
* **Conectividade Neon (Banco de Dados):** Resolvido através de `pool_pre_ping=True` e `pool_recycle=300` para prevenir perdas de conexão por autosuspend da Neon.
* **Fly Secrets Ativos:** `DATABASE_URL`, `GROQ_API_KEY`, `CLOUDINARY_CLOUD_NAME`, `CLOUDINARY_API_KEY`, `CLOUDINARY_API_SECRET`, `SMTP_HOST`, `SMTP_PORT`, `SMTP_USERNAME`, `SMTP_PASSWORD`.

### Frontend (talentflow-web)
* **Status:** 🟢 Ativo e Saudável
* **Host:** Vercel (`talentflow-web`)
* **Live URL:** `https://talentflow-web-flame.vercel.app`
* **Modificações de Segurança & Interface Aplicadas:**
  - Sistema de Autenticação e RBAC ativo (SuperAdmin, Manager, Recruiter).
  - Middleware de Borda decodificando JWTs nativamente no Edge Runtime da Vercel.
  - Navbar Consolidada e UserMenu com dropdown e alteração de senha integrada.
  - Rodapé dinâmico (desacoplado) nas páginas públicas de login/onboarding.

---

## 3. Próximos Passos (Para o Próximo Chat)

1. **Acompanhamento SMTP:** Monitorar as entregas físicas de convites da plataforma no painel da Brevo e avaliar a configuração de DNS (DKIM/SPF) para evitar a pasta de Spam no Gmail do cliente.
2. **Ciclo de Vida do Banco:** Acompanhar o comportamento das migrações Alembic e Neon sob picos de requisições concorrentes.

---
*Snapshot gerado em: 2026-06-19 16:55:00 (GMT-03:00)*

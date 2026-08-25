# AGENTS.md — talentflow-web

> Contrato técnico operacional para agentes de IA atuando neste repositório.
> Leia este arquivo integralmente antes de escrever qualquer linha de código.

<!-- BEGIN:nextjs-agent-rules -->
> [!WARNING]
> **Este não é o Next.js do teu training data.**
> O projeto usa **Next.js v16** com App Router — APIs, convenções e estrutura de arquivos diferem substancialmente de versões anteriores. Consulte `node_modules/next/dist/docs/` para detalhes. Respeite os avisos de deprecação.
<!-- END:nextjs-agent-rules -->

---

## 1. Visão Geral do Serviço

**talentflow-web** é o painel visual e dashboard interativo do TalentFlow. Interface SaaS Tier-1 construída sobre os princípios de **Design Engineering** — arquitetura que trata o design como disciplina de engenharia, não como camada decorativa.

| Atributo        | Valor                                      |
|-----------------|--------------------------------------------|
| Framework       | Next.js 16 (App Router)                    |
| React           | v19 (com React Compiler)                   |
| Styling         | Tailwind CSS v4 (CSS-First, OKLCH)         |
| Animações       | Framer Motion (spring physics)             |
| Deploy          | Vercel — `tlntflow.vercel.app`             |
| Porta local     | `3000`                                     |
| API base atual  | `https://talentflow-api.fly.dev` (fallback; troca pendente) |
| API candidata   | `https://talentflow-api-free.onrender.com` |

---

## 2. Estrutura de Diretórios

```
talentflow-web/
├── src/
│   ├── app/                       ← App Router (Next.js)
│   │   ├── layout.tsx             ← RootLayout + ThemeProvider + metadata
│   │   ├── page.tsx               ← Landing page (pública)
│   │   ├── globals.css            ← Design System (tokens OKLCH + Tailwind v4)
│   │   ├── dashboard/page.tsx     ← Dashboard principal (stats + overview)
│   │   ├── candidates/page.tsx    ← Banco de talentos
│   │   ├── jobs/page.tsx          ← Gestão de vagas
│   │   ├── smart-match/page.tsx   ← Triagem inteligente por vaga
│   │   ├── categories/page.tsx    ← Tags e categorias
│   │   ├── login/page.tsx         ← Autenticação
│   │   ├── change-password/       ← Alterar senha
│   │   ├── forgot-password/       ← Esqueci a senha
│   │   ├── reset-password/        ← Redefinir senha (token)
│   │   ├── vagas/                 ← Página pública de vagas abertas
│   │   ├── privacy/               ← Política de privacidade
│   │   ├── jobs/[slug]/page.tsx    ← Detalhe de vaga (auth)
│   │   ├── vagas/[slug]/page.tsx   ← Detalhe público de vaga
│   │   ├── dashboard/candidates/[id]/audit/page.tsx ← Workspace de auditoria
│   │   └── terms/                 ← Termos de uso
│   ├── proxy.ts                   ← Proxy (valida JWT sem tocar o banco)
│   ├── components/
│   │   ├── CandidateTable.tsx     ← Tabela principal com inline expansion
│   │   ├── CandidateModal.tsx     ← Modal de detalhe do candidato
│   │   ├── CandidateCard.tsx      ← Card compacto de candidato
│   │   ├── JobsDashboard.tsx      ← Dashboard de vagas (tabela + filtros)
│   │   ├── JobsListDashboard.tsx  ← Listagem de vagas com Bento grid
│   │   ├── JobFormDrawer.tsx      ← Drawer de criação/edição de vagas
│   │   ├── JobDetailView.tsx      ← Visão detalhada de vaga
│   │   ├── SmartMatchDashboard.tsx ← Triagem IA com ScoreRing
│   │   ├── JobMatchViewer.tsx     ← Visualizador de resultado de match
│   │   ├── DashboardClient.tsx    ← Stats + cache de match por vaga (Map)
│   │   ├── CategoriesDashboard.tsx← CRUD de categorias/tags
│   │   ├── ConflictModal.tsx      ← Modal de conflito de candidatos
│   │   ├── BatchUploadButton.tsx  ← Upload em lote de PDFs
│   │   ├── SearchAndFilters.tsx   ← Barra de busca + filtros
│   │   ├── Navbar.tsx             ← Navegação do app autenticado
│   │   ├── ThemeToggle.tsx        ← Botão de alternância Light/Dark
│   │   ├── ThemeProvider.tsx      ← Wrapper next-themes
│   │   ├── UserMenu.tsx           ← Menu do usuário logado
│   │   ├── LandingHeader.tsx      ← Header da landing page
│   │   ├── HeroVisual.tsx         ← Seção hero da landing
│   │   ├── Footer.tsx             ← Rodapé
│   │   ├── ui/                    ← Primitivos Shadcn/ui
│   │   ├── CandidateAuditWorkspace.tsx ← Tela cheia split 50/50 PDF vs IA
│   │   ├── DeleteConfirmModal.tsx       ← Modal de confirmação de exclusão
│   │   ├── design-switcher.tsx          ← Controle de variantes de design
│   │   ├── JobApplicationForm.tsx       ← Formulário público de candidatura
│   │   ├── JobCard.tsx                  ← Card compacto de vaga
│   │   ├── LogoutButton.tsx             ← Botão de logout standalone
│   │   ├── PageHeader.tsx               ← Cabeçalho de página reutilizável
│   │   ├── PDFViewer.tsx                ← Visualizador de PDF cross-origin
│   │   ├── Portal.tsx                   ← React Portal utility
│   │   ├── preset-provider.tsx          ← Provider de preset de tema/design
│   │   ├── PublicJobDetail.tsx          ← Detalhe público de vaga
│   │   ├── PublicJobsList.tsx           ← Lista pública de vagas
│   │   ├── RevealSection.tsx            ← Seção com reveal scroll (landing)
│   │   ├── SandboxDemo.tsx              ← Demo interativa de extração IA
│   │   ├── SandboxDemoWrapper.tsx       ← Wrapper do sandbox demo
│   │   └── ScrollToTop.tsx              ← Botão flutuante voltar ao topo
│   ├── lib/
│   │   ├── api.ts                 ← Wrapper fetch com `credentials: 'include'` + `Authorization: Bearer`, classe `ApiError` com `status` e `data`
│   │   ├── auth.ts                ← getSession / setSession / clearSession
│   │   ├── data/
│   │   │   ├── candidates.ts   ← Server Component data fetcher
│   │   │   ├── jobs.ts         ← Server Component data fetcher
│   │   │   └── categories.ts   ← Server Component data fetcher
│   │   └── utils.ts            ← Utilitários gerais
│   ├── types/
│   │   ├── index.ts            ← Barrel export
│   │   ├── job.ts              ← Job, PublicJob interfaces
│   │   ├── candidate.ts        ← Candidate interface
│   │   └── category.ts         ← Category interface
├── next.config.ts                 ← Security headers + CSP + rewrites
├── vercel.json                    ← Cache headers + config de deploy
└── components.json                ← Configuração Shadcn/ui
```

---

## 3. Design System — Tailwind CSS v4 + OKLCH

### Princípio CSS-First
O Tailwind v4 opera com `@import "tailwindcss"` no CSS — **não** existe `tailwind.config.js` tradicional. Toda a customização de tokens ocorre no `globals.css` via variáveis CSS.

### OKLCH Color Space
A paleta inteira usa o espaço de cores perceptual **OKLCH** (`oklch(L C H)`):
- **L** = Lightness (0–1)
- **C** = Chroma (saturação, 0–0.4)
- **H** = Hue (ângulo, 0–360)

Este espaço previne **Gamut Clipping** — fenômeno onde cores estouram para cinza/branco em gradientes no Dark Mode.

### Arquitetura de Tokens Semânticos
Use **sempre** tokens semânticos, nunca cores literais:

```css
/* ✅ Correto */
className="bg-background text-foreground border-border"

/* 🚫 Proibido — quebra o dual-theme */
className="bg-slate-900 text-white border-gray-700"
```

---

## 4. Arquitetura de Componentes

### Server vs. Client Components
- **Padrão:** componentes são **Server Components** por default no App Router.
- Adicione `"use client"` **apenas** quando necessário: hooks de estado, event handlers, ou APIs do browser.
- Nunca adicionar `"use client"` em `layout.tsx` ou em páginas que não precisem de interatividade.

### Animações com Framer Motion
- **Layout Morphing:** use a prop `layout` para animar redimensionamentos naturais (sem keyframes manuais).
- **Staggered Entrance:** use `staggerChildren` em `variants` para listas e grids.
- **Spring Physics:** prefira `type: "spring"` com `stiffness` e `damping` ao invés de `duration` — o sistema do projeto usa física de mola, não ease curves.

### ScoreRing (Animação Matemática)
O componente de score circular usa `strokeDashoffset` em SVG com Framer Motion — é trigonometria pura. Ao modificar, respeitar a fórmula:
```
strokeDasharray = 2 * π * radius
strokeDashoffset = dasharray * (1 - score/100)
```

---

## 5. Autenticação no Frontend

### Fluxo Completo

```
login/page.tsx → apiFetch('/api/auth/login')
    │
    ▼ API responde com Set-Cookie: token (HttpOnly) + body { access_token }
    │
    ▼ setSession(access_token) → salva token como cookie não-HttpOnly
    │                             no domínio do frontend
    │
    ▼ window.location.href = '/dashboard'  ← HARD REDIRECT obrigatório
    │
    ▼ proxy.ts (Edge) lê cookie 'token' → valida JWT
    │
    ├── Válido → renderiza dashboard
    └── Inválido → redireciona para /login
```

> [!WARNING]
> **Não substituir `window.location.href` por `router.push()`.**
> O `router.push()` faz soft navigation — o Edge Middleware **não** executa. O hard redirect é arquitetural, não um workaround.

### Arquivos de Auth

| Arquivo              | Função                                          |
|----------------------|-------------------------------------------------|
| `src/lib/api.ts`     | Wrapper `fetch` com `credentials: 'include'` + `Authorization: Bearer`, classe `ApiError` com `status` e `data` |
| `src/lib/auth.ts`    | `getSession()`, `setSession()` (salva 4 cookies: token, user_role, user_name, user_email), `clearSession()`, `getAuthHeaders()` |
| `src/proxy.ts`  | Edge validation — decodifica JWT, valida `exp`  |

---

## 6. Setup de Desenvolvimento Local

```bash
# 1. Acessar o diretório
cd talentflow-web

# 2. Instalar dependências
npm install

# 3. Configurar variável de ambiente
# Criar .env.local com:
# API atual/fallback até o aceite do rollout:
# NEXT_PUBLIC_API_URL=https://talentflow-api.fly.dev
# API candidata após validação funcional:
# NEXT_PUBLIC_API_URL=https://talentflow-api-free.onrender.com
# (ou http://localhost:8000 para dev com API local)

# 4. Iniciar servidor de desenvolvimento (Turbopack)
npm run dev
# → Dashboard em http://localhost:3000
```

---

## 7. Variáveis de Ambiente

| Variável                | Escopo    | Descrição                        |
|-------------------------|-----------|----------------------------------|
| `NEXT_PUBLIC_API_URL`   | Client    | URL base da API (prefixo NEXT_PUBLIC_ expõe ao browser) |

> [!NOTE]
> Variáveis com prefixo `NEXT_PUBLIC_` são expostas ao browser. Nunca colocar segredos (API keys, JWT secrets) com esse prefixo.

---

## 8. Convenções de Nomenclatura

### Arquivos e Componentes
- **Componentes React:** `PascalCase.tsx` — ex: `CandidateModal.tsx`
- **Páginas (App Router):** sempre `page.tsx` dentro da pasta da rota
- **Utilitários/libs:** `camelCase.ts` — ex: `api.ts`, `auth.ts`

### Props e Variáveis
- **Props de componentes:** camelCase com tipagem TypeScript explícita
- **Handlers de evento:** prefixo `handle` — ex: `handleSubmit`, `handleDelete`
- **States booleanos:** prefixo `is` ou `has` — ex: `isLoading`, `hasError`

### Campos de DTO (padronizados em I03)
Os campos de candidato seguem a nomenclatura padronizada:

| Campo correto      | Campo antigo (deprecado) |
|--------------------|--------------------------|
| `company_name`     | `company`                |
| `job_title`        | `title`                  |
| `description`      | `desc`                   |

> [!CAUTION]
> Nunca usar os campos deprecados — causam erros de parsing na API.

---

## 9. Security Headers

O `next.config.ts` define headers de segurança em **todas** as rotas:

- `Content-Security-Policy` (CSP)
- `X-Frame-Options: DENY`
- `X-Content-Type-Options: nosniff`
- `Strict-Transport-Security` (HSTS)
- `Referrer-Policy: strict-origin-when-cross-origin`

> [!WARNING]
> Não relaxar o CSP sem revisão — especialmente `script-src`. Qualquer fonte externa de script precisa ser explicitamente permitida.

---

## 10. Deploy

```bash
# Deploy é automático via integração Vercel + GitHub
# Push na branch main → deploy em produção automático

# Para preview de PR:
# Vercel cria preview URL automática a cada Pull Request
```

Configurações em:
- `vercel.json` — cache headers e rewrites
- `.vercel/` — metadados internos (não modificar)

---

## 11. Regras de Modificação

### ✅ Seguro modificar
- Componentes em `src/components/` (exceto lógica de auth)
- Estilos em `globals.css` (seguindo o sistema OKLCH)
- Novas páginas em `src/app/`

### ⚠️ Modificar com cautela (exige revisão)
- `src/lib/api.ts` — wrapper de fetch usado em todo o projeto
- `src/lib/auth.ts` — gerenciamento de sessão
- `src/proxy.ts` — lógica de Edge Auth

### 🚫 Proibido alterar sem aprovação do PO
- Lógica de hard redirect no fluxo de login (`window.location.href`)
- Security headers em `next.config.ts`
- Arquitetura dual-cookie (cookie HttpOnly da API + cookie frontend)
- `.env.local` e `.env.production`

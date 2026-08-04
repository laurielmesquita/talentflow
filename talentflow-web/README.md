# TalentFlow Web 🎨

Interface web moderna B2B do **TalentFlow**. Construída sobre **Next.js 16 (App Router)**, **React 19**, **Tailwind CSS v4 (OKLCH)** e **Framer Motion 12**, oferecendo uma experiência de alta performance, responsividade impecável e microinterações fluida.

---

## 🏗 Arquitetura e Engenharia de Frontend

### 1. Stack Base
- **Next.js 16 (App Router):** Framework React com Server Components, Server Actions e suporte nativo ao Turbopack.
- **React 19:** Biblioteca UI com renderização concorrente avançada.
- **Tailwind CSS v4 (OKLCH Color Space):** Sistema de design semântico baseado no espaço de cores perceptual OKLCH com suporte nativo a temas Claro/Escuro via `next-themes`.
- **Framer Motion 12:** Animações baseadas em física de molas (`spring physics`) e transições de entrada escalonadas.
- **Base UI / Shadcn:** Componentes acessíveis com desacoplamento de estilos.
- **Edge Proxy (`src/proxy.ts`):** Roteamento e autenticação de tokens JWT validados na borda (Vercel Edge).

### 2. Camadas de Engenharia (`src/`)
- **`src/types/`**: Camada centralizada de tipagem de domínio (`job.ts`, `candidate.ts`, `category.ts`).
- **`src/lib/data/`**: Camada Server Component para data fetching com tratamento de autenticação e redirecionamento 401.
- **`src/components/`**: Componentes reutilizáveis do sistema de design (Kanban, Bento Grid, Table, Drawers, Modais).
- **`src/test/`**: Bateria de testes unitários executados via Vitest e React Testing Library.

---

## 🛠 Suíte de Testes Automatizados (`Vitest`)

O projeto utiliza **Vitest** + **React Testing Library** para validação contínua da interface e dos tipos de domínio.

```bash
# Executar a bateria de testes automatizados do frontend:
npm test
```

---

## 🚀 Guia de Desenvolvimento (Setup Local)

### 1. Instalação de Dependências
```bash
npm install
```

### 2. Executando o Servidor de Desenvolvimento
```bash
npm run dev
```
Acesse `http://localhost:3000` no navegador.

### 3. Build de Produção
```bash
npm run build
```

---

## 🚢 Deploy
O frontend é implantado automaticamente na plataforma **Vercel** ao enviar commits para a branch `main`.
- **Produção Web:** [`tlntflow.vercel.app`](https://tlntflow.vercel.app)

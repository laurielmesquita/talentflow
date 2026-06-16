# TalentFlow 🚀

Banco de Talentos com Triagem Inteligente de Currículos. Uma plataforma SaaS Tier-1 desenhada para otimizar o fluxo de RH, unindo processamento de currículos com uma interface de altíssima performance estruturada nos pilares de **Design Engineering**.

---

## 🧬 Arquitetura de UI e Experiência
O sistema abandonou o modelo clássico de tabelas de dados em prol de um **Grid de Cards Interativos (Interactive Expandable List)**. A interface adota os princípios do **Bento UI** e **Glassmorphism**, garantindo uma navegação fluida, densidade de dados equilibrada e micro-interações que recompensam a ação do usuário.

---

## 🛠 Stack Tecnológico e Fundamentos (Estudos das Tecnologias)

A arquitetura do TalentFlow foi intencionalmente desenhada para entregar escalabilidade e performance visual fluida a 60fps. Abaixo, o racional técnico das nossas escolhas de stack:

### 1. Core Frameworks
- **Next.js v16 (App Router):** Roteamento em servidor e isolamento de layouts. Permite uma segregação estrita entre as rotas de servidor e os componentes altamente interativos (Client Components), otimizando o *First Contentful Paint*.
- **React v19:** Base da engine de renderização, tirando proveito das melhorias de concorrência e estrutura refinada dos hooks sob a chancela do compilador moderno.

### 2. Styling Engine (Tailwind v4)
- **CSS-First Approach:** Adotamos a nova infraestrutura do Tailwind CSS v4 (`@tailwindcss/postcss`), que injeta propriedades com extrema agilidade em *build-time*.
- **OKLCH Color Space (Dual-Theme):** A paleta de cores inteira foi arquitetada no espaço perceptual **OKLCH** (onde L = Lightness, C = Chroma, H = Hue). Isso nos permite um controle matemático perfeito sobre saturação e luminância, blindando o layout contra o fenômeno de *Gamut Clipping* (onde cores estouram para o cinza/branco) e garantindo uma leitura impecável tanto no *Light* quanto no *Dark Mode*.
- **Arquitetura Semântica:** Substituição de declarações literais (ex: `bg-slate-900`) por Tokens Semânticos (`bg-background`, `text-foreground`, `border-border`). Isso permite que toda a árvore DOM responda organicamente ao gatilho de troca de tema.

### 3. Físicas e Animações (Framer Motion)
- A imersão espacial da aplicação é orquestrada pelo **Framer Motion**, fugindo das transições secas do CSS tradicional.
- **Layout Morphing (`layout` prop):** Usado para criar o efeito *Accordion* no Card do candidato. A expansão de um container recalcula as posições dos componentes irmãos na tela através de uma equação de mola (*spring physics*, com `bounce: 0`), mantendo a integridade espacial.
- **Staggered Children:** As *Skills Identificadas* não surgem secas. Elas entram em cascata anatômica assim que o card renderiza (*Staggered Entrance*), guiando o *Scanning* ocular do recrutador.
- **Trigonometria SVG:** O medidor de Quality Score (`ScoreRing`) utiliza animação matemática baseada no preenchimento gradual da propriedade `strokeDashoffset` para revelar o match do candidato.

### 4. Gestão de Domínio Front-end
- **Next-Themes:** Injetado via um `ThemeProvider` central. Fundamental para alterar o DOM no lado do cliente sem desencadear erros de *Hydration Mismatch* na árvore do React, injetando uma classe limpa na tag `<html>`.
- **Tipografia Otimizada:** Fontes carregadas pelo `next/font` sem bloqueio de renderização (*render-blocking*). **Inter** garante clareza absurda em UI, enquanto **JetBrains Mono** isola dados focais.
- **Lucide React:** Iconografia em formato de vetor purista e de baixo peso computacional.

---

## ⚙️ Features Core
- **Dashboard Otimista e Híbrido:** Transição Light/Dark sem recarregamento, suportada por *Ambient Glows* (Glassmorphism no fundo da tela).
- **Ingestão em Lote e Polling:** Motor de upload com indicadores em tempo real, integrando extração de skills sintéticas baseada na simulação inteligente de processamento.
- **Superfícies Isoladas:** Modal de resolução de conflitos para dados de currículos duplicados (Focus Mode Diff), e modals limpos e agressivos de zona de perigo (Delete Confirmation).
- **Motor de Busca e Filtros:** Pesquisa semântica *debounce-ready* no painel principal, com suporte a categorização rápida em pílulas dinâmicas.

---

## 🚀 Como Executar a Aplicação Localmente

### Pré-requisitos
Certifique-se de ter instalado:
- **Node.js** v18.x ou superior.
- **npm**, **yarn** ou **pnpm**.

### Script de Inicialização

1. **Clone o repositório** e entre no diretório front-end do TalentFlow:
```bash
cd 05-Projetos/talentflow-web
```

2. **Instale as dependências** e bibliotecas do ecossistema de Design:
```bash
npm install
```

3. **Gatilho de Renderização (Dev Server):**
```bash
npm run dev
```

A aplicação fará o *cold boot* e instanciará a porta primária.
Abra [http://localhost:3000](http://localhost:3000) no seu navegador para acessar a suíte de triagem.

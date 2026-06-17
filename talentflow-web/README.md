# TalentFlow Web 🚀

O painel visual e dashboard interativo do **TalentFlow**. Uma plataforma SaaS Tier-1 desenhada para otimizar o fluxo de RH, unindo processamento de currículos com uma interface de altíssima performance estruturada nos pilares de **Design Engineering**.

---

## 🧬 Arquitetura de UI e Experiência
O sistema adota os princípios de **Bento UI** e **Glassmorphism**, fornecendo uma navegação fluida através de grids de cards interativos, modais integrados e transições que aumentam a produtividade visual do recrutador.

---

## 🛠 Stack Tecnológico e Fundamentos

A arquitetura do TalentFlow foi desenhada para entregar escalabilidade e performance visual fluida a 60fps.

### 1. Core Frameworks & Componentes
- **Next.js v16 (App Router):** Roteamento no servidor e geração de páginas dinâmicas ou estáticas, segregando de forma limpa as rotas de servidor e os componentes interativos do cliente (*Client Components*).
- **React v19:** Base de renderização e concorrência com o suporte moderno ao React Compiler.
- **Base UI (@base-ui/react):** Componentes headless e acessíveis (WAI-ARIA) que servem de fundação estrutural para as abas, formulários e gavetas (drawers) da aplicação.
- **Shadcn/ui:** Primitivos de componentes do sistema, facilitando a customização e flexibilidade do design system.
- **Next-Themes:** Injetado via `ThemeProvider` central para alteração dinâmica de tema no cliente, evitando erros de *Hydration Mismatch*.
- **Lucide React:** Iconografia em formato de vetor de baixo peso.

### 2. Styling Engine (Tailwind v4)
- **CSS-First Approach:** Adotamos a nova infraestrutura do Tailwind CSS v4 (`@tailwindcss/postcss`), injetada com agilidade em tempo de build.
- **OKLCH Color Space (Dual-Theme):** A paleta inteira opera sob o espaço perceptual **OKLCH** (onde L = Lightness, C = Chroma, H = Hue). Isso nos permite um controle perfeito sobre saturação e luminância, blindando o layout contra o fenômeno de *Gamut Clipping* (onde cores estouram para o cinza/branco) e garantindo uma leitura impecável tanto no *Light* quanto no *Dark Mode*.
- **Arquitetura Semântica:** Substituição de declarações literais (ex: `bg-slate-900`) por Tokens Semânticos (`bg-background`, `text-foreground`, `border-border`) que respondem organicamente ao tema ativo.

### 3. Físicas e Animações (Framer Motion & 21st.dev)
- **21st.dev:** Nossa referência e hub principal para injeção de ideias de design e micro-interações de componentes prontos baseados em Tailwind CSS e Framer Motion.
- **Layout Morphing (`layout` prop):** Usado no card do candidato e nas abas de controle de vagas para animar a transição espacial e o dimensionamento dinâmico baseado em física de mola (*spring physics*).
- **Staggered Entrance:** Efeito de cascata gradual ao renderizar badges de competências e listas de candidatos, suavizando a leitura e o foco visual.
- **Trigonometria SVG:** Animação matemática baseada no preenchimento gradual da propriedade `strokeDashoffset` para revelar o match do candidato (`ScoreRing`).

---

## ⚙️ Features Core
- **Dashboard Otimista:** Transição de tema sem flicker visual, suportada por *Ambient Glows* translúcidos.
- **Triagem de Vagas (Smart Match):** Aba dedicada a calcular a aderência das habilidades dos candidatos com os requisitos da vaga.
- **Descrição Detalhada das Vagas:** Visualização de detalhes com renderização inteligente de listas, informações de contato e contraste otimizado para o modo claro.
- **Gestão de Categorias:** Rota para criar, renomear e excluir tags de categorização de talentos.

---

## 🚀 Como Executar a Aplicação Localmente

### Pré-requisitos
Certifique-se de ter instalado:
- **Node.js** v18.x ou superior.
- Um gerenciador de pacotes (**npm**, **yarn** ou **pnpm**).

### Script de Inicialização

1. Acesse o diretório front-end do TalentFlow:
```bash
cd talentflow-web
```

2. Instale as dependências:
```bash
npm install
```

3. Inicie o servidor de desenvolvimento:
```bash
npm run dev
```

Abra [http://localhost:3000](http://localhost:3000) no seu navegador para acessar a suíte de triagem.

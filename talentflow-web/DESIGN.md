# Sistema de Design & UX - TalentFlow (ATS & AI Recruitment Platform)

## 1. Filosofia Visual
- **Estilo:** Modern High-Density B2B SaaS (Referências: Linear, Ashby, Resend, Supabase).
- **Abordagem:** Interfaces limpas, alta densidade de informação para recrutadores, microinterações precisas e suporte nativo a temas via `src/styles/presets/`.
- **Regra de Ouro (Tailwind v4):** NUNCA utilize utilitários de cor estática arbitrária (ex: `bg-slate-900`, `border-gray-200`). Utilize SEMPRE os tokens semânticos OKLCH do tema (`bg-background`, `bg-card`, `text-foreground`, `text-muted-foreground`, `border-border/50`, `bg-primary/10`).

## 2. Padrões por Módulo de Negócio

### A. Gestão de Candidatos & Kanban (`/candidates`)
- **Cards de Candidatos:** Layout compacto, bordas sutis (`border-border/60`), avatares pequenos com anel suave, tags de skills em opacidade reduzida (`bg-muted text-muted-foreground`).
- **Ações Rápidas & Acessibilidade:** Botões de ação rápida no card devem permanecer ocultos por padrão, mas revelados tanto no hover quanto no foco por teclado (`opacity-0 group-hover:opacity-100 group-focus-within:opacity-100 transition-opacity duration-200`).
- **Badges de Status:** Usar tons translúcidos em vez de cores sólidas agressivas (ex: `bg-emerald-500/10 text-emerald-400 border border-emerald-500/20`).

### B. Smart Match & Inteligência Artificial (`/smart-match`)
- **Visual High-Tech:** Elementos de IA devem utilizar gradientes suaves em OKLCH, contornos sutis de destaque (`border-primary/20`) e brilhos discretos (`shadow-[0_0_15px_rgba(var(--primary),0.1)]`).
- **Métricas de Match & Tipografia Numérica:** Barras de progresso e porcentagens devem ser animadas usando `framer-motion` no carregamento. Utilize sempre alinhamento tabular (`tabular-nums` ou `font-mono`) em porcentagens e métricas para evitar variação na largura dos números durante atualizações reativas.

### C. Dashboard & Tabelas (`/dashboard`, `/jobs`)
- **Tabelas:** Linhas com hover sutil (`hover:bg-accent/40`), separadores extremamente finos (`border-border/40`), cabeçalhos em caixa alta leve (`text-xs font-medium text-muted-foreground tracking-wider`).

## 3. Animações e Microinterações
- Utilize o `framer-motion` (v12) para transições de estado, modais e carregamento de listas.
- **Performance de Renderização:** Anime estritamente propriedades aceleradas por GPU (`opacity`, `transform`), evitando alterar `height`, `width` ou `margin` em listas extensas para prevenir *Layout Reflows*.
- Mantenha transições rápidas: `duration-200` para hovers e `duration-300` para modais/drawers.

# Plano de Redesign — TalentFlow

> Documento de planejamento visual e técnico para o redesign do TalentFlow.
> Branch inicial: `design/foundation`
> Status: combinação aprovada; fundação técnica entregue; assets visuais pendentes

## 1. Objetivo

Transformar o TalentFlow em uma plataforma SaaS B2B mais atraente, compreensível e persuasiva, sem sacrificar a densidade operacional necessária para recrutadores.

O redesign combina:

- Redesign de produto
- Direção de arte
- Comunicação visual
- Motion design
- Ilustrações explicativas
- Exploração 3D controlada
- Otimização da landing page para conversão

## 2. Diagnóstico

O produto atual possui uma base técnica e visual consistente, mas a experiência é predominantemente funcional e fria. O novo sistema precisa comunicar rapidamente:

- Qual problema o TalentFlow resolve
- Para quem o produto foi criado
- Como a IA funciona
- Por que os resultados são confiáveis
- Quanto tempo o produto economiza
- Qual é o próximo passo esperado do visitante

As pastas `02-Branding/` e `03-Midia/` estão vazias. Portanto, o trabalho inclui construir uma linguagem visual própria para o produto.

## 3. Direção Visual Principal

### 3.1 Conceito

**Human-centered AI recruitment platform with cinematic glass interfaces.**

### 3.2 Estratégia híbrida aprovada

- **Produto (dashboard, candidatos, vagas):** Liquid Glass moderado, alta densidade
- **Landing page:** Human Editorial + Cinematic AI
- **Smart Match:** linguagem tecnológica, explicável e animada
- **Autenticação:** superfície limpa, confiável, baixa distração

### 3.3 Moodboards aprovados

Os três moodboards comparáveis estão em:

- `docs/moodboards/liquid-glass.svg`
- `docs/moodboards/cinematic-ai.svg`
- `docs/moodboards/human-editorial.svg`
- `docs/moodboards/index.html` (visualização lado a lado)

## 4. O que foi entregue (fundação técnica)

### Tokens CSS em `talentflow-web/src/app/globals.css`

- `--glass-bg`, `--glass-bg-strong` — superfícies translúcidas
- `--glass-border`, `--glass-highlight` — bordas especulares
- `--glass-shadow`, `--glass-blur` — profundidade
- `--aurora-violet`, `--aurora-cyan`, `--aurora-warm` — atmosfera
- Classes utilitárias: `.glass-panel`, `.glass-panel-strong`, `.glass-panel-interactive`, `.dashboard-atmosphere`
- Suporte a light mode, dark mode e `prefers-reduced-motion`

### Componentes atualizados (18 arquivos)

| Arquivo | Alteração |
|---------|-----------|
| `Navbar.tsx` | Header flutuante glass, link "Início" para landing |
| `DashboardClient.tsx` | Atmosfera, KPIs com glass, Smart Match com glass |
| `candidates/page.tsx` | KPIs glass, atmosfera, remoção de cores slate |
| `CandidateTable.tsx` | Linhas e painéis com glass |
| `SearchAndFilters.tsx` | Inputs glass, chips glass, filtros glass |
| `JobsListDashboard.tsx` | Filtros, cards e modais glass |
| `JobCard.tsx` | Card com glass interativo |
| `SmartMatchDashboard.tsx` | Lista de vagas glass, painel de match glass, overflow corrigido |
| `CategoriesDashboard.tsx` | Cards e modais glass |
| `CandidateAuditWorkspace.tsx` | Header e painéis glass |
| `page.tsx` (landing) | Atmosfera, seções glass, badge com glow |
| `HeroVisual.tsx` | Substituído: de terminal para ilustração SVG editorial |
| `login/page.tsx` | Atmosfera, card glass |
| `forgot-password/page.tsx` | Atmosfera, card glass |
| `reset-password/page.tsx` | Atmosfera, card glass |
| `PublicJobsList.tsx` | Hero glass, lista glass, barra de busca glass |
| `PublicJobDetail.tsx` | Sidebar glass, atmosfera |

### Assets visuais

- `public/visuals/hero/talentflow-hero.svg` — ilustração abstrata editorial (figura humana, rede de dados, painéis IA, sinais de score)

### Graphify

- Base de conhecimento atualizada em `graphify-out/`
- 1027 nós, 1492 arestas, 88 comunidades

### Validação

- `npm run build` ✓
- `npm run test` (6 testes) ✓
- API local funcional (`uv run uvicorn`) ✓

### O que NÃO foi alterado (limites de segurança)

- `src/lib/auth.ts`
- `src/proxy.ts`
- Arquitetura dual-cookie
- Proxy de PDF
- Autenticação cross-origin
- API ou modelos de dados
- `next.config.ts`
- Variáveis de ambiente

## 5. O que está pendente (segunda rodada)

### Landing page — composição editorial

Cada seção da landing precisa de um tratamento visual próprio, não apenas glass sobre o layout antigo:

| Seção | Estado atual | Necessário |
|-------|-------------|------------|
| Hero | Ilustração editorial pronta ✓ | Motion, glow refinado |
| Sandbox demo | Glass aplicado | Ilustração de fluxo de extração |
| Problemas (3 cards) | Glass aplicado | Substituir por composição editorial com imagens de contexto humano |
| Features (bento grid) | Glass aplicado | Ilustrações por feature, não ícones genéricos |
| How it works | Igual ao original | Ilustração de pipeline passo a passo |
| CTA final | Igual ao original | Composição com profundidade, imagem humana |

### Assets visuais pendentes

Ilustrações a gerar:

1. Fluxo de análise de currículo (para seção Sandbox)
2. Smart Match visual (para seção Features)
3. Auditoria side-by-side (para seção Features)
4. Imagens editoriais de contexto humano (para seção Problemas)
5. Pipeline de ingestão (para seção How it works)
6. Background abstrato para CTA final
7. Open Graph image
8. Assets para redes sociais

### 3D e motion

- Hero: parallax, partículas ou cena 3D leve
- Seções: scroll-triggered reveals com mais expressão
- Smart Match: animação de score e ranking
- CTA: elemento 3D ou motion cinematográfico

### Ajustes de produto

- Intensidade do glass nas tabelas (reduzir se prejudicar legibilidade)
- Consistência entre páginas de vagas (JobsListDashboard vs JobsDashboard — um está glass, o outro não)
- Tema do ThemeToggle ainda usa classes slate estáticas
- Páginas de termos e privacidade sem tratamento visual

## 6. Análise de erros da primeira rodada

### O que deu errado

1. **Salto do plano para a execução em massa.** O plano previa moodboards → protótipo do Dashboard → aprovação → expansão. Em vez disso, apliquei tokens em 18 arquivos de uma vez, sem validação visual intermediária.

2. **Confundi fundação com redesign.** Tokens de glass e auroras são infraestrutura, não o redesign em si. Entregar CSS como se fosse a direção de arte frustrou a expectativa de ver imagens, composição e narrativa visual.

3. **Não gerei assets antes do código.** O plano explicitamente listava ilustrações como etapa prioritária. Fui direto para classes Tailwind sem produzir as imagens que dariam identidade às seções.

4. **Ausência de gates de aprovação.** Cada seção da landing deveria ter sido substituída uma a uma, com o usuário validando antes de avançar. Aplicar tudo de uma vez impediu a correção de rota.

5. **Não consultei o Graphify.** O AGENTS.md manda usar `graphify-out/` como fonte primária para economia de tokens. Li arquivos fonte diretamente, consumindo contexto desnecessariamente.

6. **Contexto da conversa saturado.** Com 55+ mensagens, o histórico carregado degradou a qualidade incremental. O redesign visual completo exigia uma conversa dedicada.

### O que funcionou

- Tokens semânticos OKLCH estão corretos e consistentes
- Light/dark mode funcionando
- Build e testes mantidos verdes
- Nenhuma regressão de autenticação ou API
- Graphify atualizado
- Moodboards documentados e aprovados

## 7. Modelo para a segunda rodada

### Princípios

1. **Assets antes de código.** Gerar e aprovar ilustrações primeiro. Só depois aplicar ao HTML.
2. **Uma fase por vez.** Cada fase é uma entrega independente com aprovação explícita.
3. **Gates obrigatórios.** Nenhum avanço sem confirmação visual do usuário.
4. **Graphify primeiro.** Consultar `graphify-out/GRAPH_REPORT.md` antes de ler arquivos fonte.
5. **Modelo certo para cada fase.** Fases de assets usam skills de geração. Fases de código usam GPT 5.6 Luna (Go).

### Fases da segunda rodada (6 fases, 1 modelo por fase)

---

**Fase A — Assets visuais (sem código)**

**Modelo:** GPT 5.6 Luna para planejamento e coordenação. Skills `design` + `ai-multimodal` (Gemini) para geração de imagens.

- Gerar 1 ilustração por seção da landing
- Gerar imagens editoriais de contexto humano
- Apresentar cada asset individualmente para aprovação
- Formato: SVG ou PNG otimizado em `talentflow-web/public/visuals/`
- Imagens sem texto (texto fica no HTML)

**Gate:** todos os assets aprovados.

---

**Fase B — Landing: Hero e Sandbox**

**Modelo:** GPT 5.6 Luna.

- Substituir composição do hero por versão final com motion + parallax
- Substituir seção Sandbox com ilustração de fluxo de extração
- Aplicar glass onde melhora, remover onde atrapalha

**Gate:** hero e sandbox aprovados visualmente (screenshot ou preview local).

---

**Fase C — Landing: Problemas e Features**

**Modelo:** GPT 5.6 Luna.

- Trocar os 3 cards de "Problemas" por composição editorial com imagens humanas
- Substituir bento grid de Features por cards com ilustrações próprias (não ícones genéricos)
- Cada feature com sua imagem: Smart Match, auditoria, pipeline, segurança

**Gate:** problemas e features aprovados.

---

**Fase D — Landing: How it works e CTA**

**Modelo:** GPT 5.6 Luna.

- Substituir seção "Como funciona" por ilustração de pipeline visual
- Criar CTA final com profundidade, imagem e motion

**Gate:** landing completa aprovada.

---

**Fase E — Produto: ajustes finos**

**Modelo:** GPT 5.6 Luna.

- Reduzir glass em tabelas se prejudicar leitura
- Corrigir páginas sem tratamento (JobsDashboard, termos, privacidade)
- Unificar ThemeToggle (ainda usa slate estático)
- Revisar contraste e acessibilidade (WCAG)

**Gate:** produto consistente aprovado.

---

**Fase F — Motion, 3D e performance**

**Modelo:** GPT 5.6 Luna para código. Se necessário elemento 3D pesado, assets podem usar Antigravity (Gemini), mas o código fica no Luna.

- Adicionar scroll-triggered reveals com mais expressão
- Parallax no hero
- Elemento 3D (React Three Fiber) apenas se viável e aprovado
- Validar performance, bundle size e `prefers-reduced-motion`

**Gate:** motion aprovado, sem regressão de performance.

---

Cada fase é independente e requer aprovação explícita antes de avançar. Se uma fase falhar na revisão, ela é corrigida antes de prosseguir.

## 8. Como iniciar a segunda rodada

Copie e cole o bloco abaixo em uma conversa nova:

---

INSTRUÇÃO PARA NOVA CONVERSA:

Estou continuando o redesign do TalentFlow a partir da branch `design/foundation`.
Repositório: `~/Space Square/02-Customers/TalentFlow/05-Projetos/`
Modelo principal: GPT 5.6 Luna (OpenCode Go)

Antes de qualquer ação, consulte nesta ordem:
1. `graphify-out/GRAPH_REPORT.md` — grafo de dependências (1027 nós, 1492 arestas)
2. `docs/redesign-liquid-glass.md` — plano completo, fundação entregue, pendências, 6 fases
3. `docs/moodboards/index.html` — direções aprovadas (Liquid Glass + Human Editorial + Cinematic AI)

Fundação técnica já entregue:
- Tokens glass, aurora, atmosfera (globals.css)
- Hero com ilustração (public/visuals/hero/talentflow-hero.svg)
- Navbar flutuante com link "Início"
- 18 componentes/páginas com glass
- Build, testes e API funcionando
- Graphify atualizado

O processo tem 6 FASES. Cada fase é independente e exige aprovação explícita.
Modelo para cada fase está especificado no documento.

FASE A — Assets visuais (sem tocar em código)
Modelo: GPT 5.6 Luna + skills design/ai-multimodal (Gemini)
- Gerar 1 ilustração por seção da landing
- Gerar imagens editoriais de contexto humano
- Formato SVG ou PNG em talentflow-web/public/visuals/
- Sem texto nas imagens

FASE B — Hero + Sandbox
Modelo: GPT 5.6 Luna
- Substituir hero com ilustração final + motion
- Substituir seção Sandbox com ilustração de fluxo

FASE C — Problemas + Features
Modelo: GPT 5.6 Luna
- Composição editorial com imagens humanas nos Problemas
- Ilustrações próprias por feature (não ícones genéricos)

FASE D — How it works + CTA
Modelo: GPT 5.6 Luna
- Pipeline visual na seção How it works
- CTA final com profundidade

FASE E — Ajustes finos de produto
Modelo: GPT 5.6 Luna
- Refinar glass nas tabelas
- Corrigir páginas sem tratamento
- Unificar ThemeToggle

FASE F — Motion, 3D e performance
Modelo: GPT 5.6 Luna
- Motion, parallax, possível elemento 3D
- Validar bundle, acessibilidade, reduced-motion

REGRAS:
- UMA fase por vez
- NÃO avance sem aprovação explícita
- Consulte Graphify antes de ler arquivos fonte
- NÃO altere auth, API, CSP ou dual-cookie

---

## 9. Referências

| Recurso | Caminho |
|---------|---------|
| Plano de redesign | `docs/redesign-liquid-glass.md` |
| Moodboards | `docs/moodboards/` |
| Graphify | `graphify-out/GRAPH_REPORT.md` |
| Design system CSS | `talentflow-web/src/app/globals.css` |
| Landing page | `talentflow-web/src/app/page.tsx` |
| Navbar | `talentflow-web/src/components/Navbar.tsx` |
| Hero visual | `talentflow-web/src/components/HeroVisual.tsx` |
| Assets públicos | `talentflow-web/public/visuals/` |
| AGENTS.md (regras gerais) | `AGENTS.md` |
| AGENTS.md (web) | `talentflow-web/AGENTS.md` |
| DESIGN.md | `docs/DESIGN.md` |

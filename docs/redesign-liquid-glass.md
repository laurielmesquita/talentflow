# Plano de Redesign — TalentFlow

> Documento de planejamento visual e técnico para o redesign do TalentFlow.
> Branch inicial: `design/foundation`
> Status: combinação aprovada; vertical slice do Dashboard em implementação

## 1. Objetivo

Transformar o TalentFlow em uma plataforma SaaS B2B mais atraente, compreensível e persuasiva, sem sacrificar a densidade operacional necessária para recrutadores.

O redesign não será apenas uma troca de cores ou aplicação de glassmorphism. Ele combina:

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

O produto deve combinar tecnologia visualmente impressionante com pessoas, contexto, clareza e benefício operacional.

### 3.2 Estratégia híbrida recomendada

- **Área operacional:** Liquid Glass moderado e alta densidade de informação
- **Landing page:** Human Editorial + Cinematic AI
- **Smart Match:** linguagem tecnológica, explicável e mais animada
- **Auditoria e PDF:** glass discreto, priorizando legibilidade
- **Autenticação:** superfície limpa, confiável e com baixa distração

### 3.3 Liquid Glass

Usar como sistema de profundidade, não como decoração aplicada a todos os elementos:

- Superfícies translúcidas em camadas
- `backdrop-filter: blur()` e `saturate()` com fallback
- Bordas especulares suaves
- Gradientes violetas, azulados e âmbar
- Sombras difusas de profundidade
- Auroras e grids sutis
- Diferentes níveis de elevação visual

Tabelas, campos críticos, documentos e áreas de leitura devem permanecer mais opacos e sólidos.

## 4. Direções de Experimentação

As direções serão testadas em branches independentes:

```text
main
├── design/foundation
├── design/liquid-glass
├── design/cinematic-ai
├── design/human-editorial
└── design/swiss-minimal
```

### Liquid Glass

Premium, espacial e tecnológico. Melhor para dashboard, Smart Match, hero e componentes de produto.

### Cinematic AI

Mais expressivo, com composição 3D, narrativa visual e transições de maior impacto. Melhor para landing e campanhas.

### Human Editorial

Mais humano, confiável e contextual. Usa imagens editoriais e narrativa centrada no recrutador.

### Swiss Minimal

Precisão, clareza e foco em conversão. Útil como comparação para evitar excesso visual.

## 5. Comunicação Visual

O novo site deve usar quatro camadas de comunicação:

### Interface de produto

- Dashboards
- Scores de candidatos
- Smart Match
- Upload e processamento
- Auditoria de currículos

### Ilustrações explicativas

- Currículo entrando no sistema
- IA extraindo informações
- Candidato sendo ranqueado
- Recrutador tomando decisão
- Fluxo entre vaga, candidatos e Smart Match

### Imagens editoriais

- Recrutadores em contexto profissional
- Times avaliando talentos
- Cenas humanas e corporativas
- Diversidade com aparência autêntica, não banco de imagens genérico

### Elementos 3D e motion

- Objetos abstratos representando dados
- Cards, documentos e esferas flutuantes
- Fluxos de partículas
- Camadas de glass em movimento
- Visualização do processamento de IA

Todo elemento visual deve explicar, reforçar ou orientar. Nenhum efeito deve existir apenas para preencher espaço.

## 6. Landing Page e Conversão

A landing deve seguir esta narrativa:

1. Hero com proposta de valor direta
2. Demonstração visual imediata do produto
3. Problemas do recrutamento tradicional
4. Solução correspondente para cada problema
5. Fluxo visual de ingestão e análise de currículo
6. Smart Match explicado visualmente
7. Auditoria e confiabilidade da IA
8. Segurança, LGPD e isolamento multi-tenant
9. Recursos organizados por plano
10. CTA final com baixa fricção

Cada seção deve responder uma pergunta concreta do visitante. Elementos decorativos não devem competir com o CTA ou com a mensagem principal.

## 7. Biblioteca de Assets

Os assets visuais devem ser organizados em:

```text
talentflow-web/public/visuals/
├── hero/
├── product-scenes/
├── workflow/
├── smart-match/
├── audit/
├── people/
├── backgrounds/
└── social/
```

### Assets prioritários

- Hero principal sem texto embutido
- Fluxo visual de análise de currículo
- Smart Match
- Auditoria lado a lado
- Backgrounds abstratos para glass
- Imagens editoriais de confiança
- Open Graph image
- Assets para compartilhamento social

Imagens geradas não devem conter títulos, botões ou textos importantes. O texto deve ser renderizado em HTML para preservar acessibilidade, responsividade e tradução.

## 8. 3D e Interatividade

### Usos recomendados

- Hero da landing
- Seção de processamento de IA
- Smart Match
- CTA final
- Empty states premium selecionados

### Áreas sem 3D pesado

- Tabelas de candidatos
- Formulários
- Auditoria de PDF
- Modais operacionais
- Listas longas
- Navegação principal

### Estratégia técnica

Começar com CSS 3D e Framer Motion. Adicionar React Three Fiber somente quando houver uma cena que realmente comunique o produto.

Dependências candidatas, somente após validação do protótipo:

- `three`
- `@react-three/fiber`
- `@react-three/drei`

Toda cena 3D deve ter:

- Carregamento dinâmico
- Fallback estático
- Poster ou imagem substituta
- Suspense
- Redução automática com `prefers-reduced-motion`
- Limite explícito de custo de renderização

## 9. Motion Design

Framer Motion continuará como base do projeto.

Usar:

- Spring physics
- Staggered reveals
- Scroll-triggered sections
- Layout transitions
- Hover com reflexo de luz
- Transições de processamento
- Progressão visual de upload
- Animações de score
- Parallax leve no hero

Evitar:

- Blur animado continuamente
- Animações em tabelas extensas
- Movimento obrigatório em mobile
- Alterações que causem layout shift
- Backgrounds pesados em todas as rotas

GSAP poderá ser avaliado para timelines cinematográficas ou scroll pinning, mas não deve ser adicionado antes de existir uma necessidade concreta. Lenis e bibliotecas redundantes de animação não são prioridade.

## 10. Skills e Ferramentas

### Skills

- `design`: direção de arte, branding, assets e ícones
- `design-system`: tokens, especificações e componentes
- `ui-styling`: Tailwind, componentes acessíveis e responsividade
- `ui-ux-pro-max`: padrões de UX, conversão, motion e performance
- `banner-design`: hero, Open Graph e assets sociais
- `ai-multimodal`: geração e avaliação de imagens
- `chrome-devtools`: screenshots e validação visual por breakpoint

### Princípios de uso

- Gerar várias direções antes de escolher uma
- Separar imagem de fundo de conteúdo textual
- Comparar variantes no mesmo viewport
- Validar assets em light e dark mode
- Não instalar dependências sem validar o protótipo

## 11. Tokens e Componentes

O primeiro trabalho técnico será evoluir `src/app/globals.css` com tokens para:

- Superfícies glass
- Superfícies opacas
- Bordas especulares
- Highlights
- Sombras de profundidade
- Níveis de blur
- Auroras e gradientes
- Estados interativos

Componentes candidatos, a extrair somente após repetição comprovada:

- `GlassPanel`
- `GlassCard`
- `GlassButton`
- `GlassInput`
- `GlassDialog`
- `GlassDrawer`
- `GlassBadge`
- `GlassSkeleton`
- `GlassTooltip`

Não criar abstrações antecipadamente. Primeiro validar os padrões no protótipo.

## 12. Ordem de Implementação

1. Tokens e base visual
2. Protótipo do Dashboard
3. Navbar, headers e componentes compartilhados
4. Banco de candidatos
5. Vagas
6. Smart Match
7. Auditoria PDF
8. Landing page
9. Autenticação
10. Páginas públicas
11. Assets sociais e Open Graph
12. Auditoria visual, funcional, acessível e de performance

O primeiro vertical slice deve conter apenas:

- Navbar
- Dashboard
- Um KPI
- Um card
- Um modal
- Light mode
- Dark mode
- Mobile

## 13. Critérios de Sucesso

### Comunicação

- O visitante entende o produto em poucos segundos
- O benefício aparece antes da descrição técnica
- Cada seção possui uma função narrativa
- O CTA principal é evidente

### Produto

- Tabelas continuam legíveis
- Scores e estados continuam claros
- Fluxos de upload não perdem feedback
- Smart Match parece explicável, não apenas decorativo

### Técnica

- Sem regressão de autenticação
- Sem alteração da API
- Sem alteração do CSP sem revisão explícita
- Sem alteração do dual-cookie
- Sem impacto relevante no carregamento inicial
- Fallback para navegadores sem `backdrop-filter` ou WebGL

### Acessibilidade

- Contraste mínimo WCAG validado
- Foco de teclado visível
- Imagens significativas com texto alternativo
- Cor não é o único indicador de estado
- Suporte a `prefers-reduced-motion`
- Alvos interativos com pelo menos 44px

### Performance

- 3D carregado sob demanda
- Imagens otimizadas com `next/image`
- Assets comprimidos e dimensionados
- Sem animação de propriedades que causem reflow
- Testes em mobile real e conexão limitada

## 14. Limites de Segurança

Este redesign não deve alterar sem aprovação explícita:

- `src/lib/auth.ts`
- `src/proxy.ts`
- Arquitetura dual-cookie
- Proxy de PDF
- Autenticação cross-origin
- API ou modelos de dados
- `next.config.ts` e CSP
- Variáveis de ambiente

## 15. Processo de Aprovação

1. Gerar três moodboards
2. Escolher uma direção visual
3. Criar o vertical slice do Dashboard
4. Validar desktop, mobile, light e dark
5. Aprovar ou rejeitar a linguagem visual
6. Consolidar tokens e componentes
7. Expandir para as demais rotas

O redesign completo só deve começar após a aprovação do vertical slice.

## 16. Primeira Referência de Design System

Uma busca inicial com `ui-ux-pro-max` apontou para uma direção de SaaS de IA cinematográfico, com glass, iluminação ambiente e sensação premium. A recomendação será adaptada para web e não será aplicada literalmente:

- **Base:** dark mode atmosférico como referência para o hero e para o Smart Match
- **Contraste:** light mode continua suportado e não deve ser tratado como uma conversão automática do dark mode
- **Primária:** violeta elétrico
- **Secundária:** índigo
- **Acento:** rosa ou âmbar usado apenas para CTA e sinais de IA
- **Tipografia:** Inter continua como base operacional; uma fonte display mais humana poderá ser avaliada somente para títulos da comunicação pública
- **Motion:** transições spring, iluminação ambiente lenta e reveals de seção
- **Glass:** blur moderado, borda especular e superfícies com opacidade suficiente para WCAG

A referência também sugeriu Calistoga para títulos e GSAP Flip para transições complexas. Essas opções ficam em avaliação: o sistema atual usa Inter, JetBrains Mono e Framer Motion, portanto nenhuma troca de tipografia ou inclusão de GSAP deve ocorrer sem validação no protótipo e análise de bundle.

## 17. Primeiro Vertical Slice

A combinação aprovada pelo PO é:

- **Human Editorial** para comunicação e conversão
- **Liquid Glass** para dashboard e produto
- **Cinematic AI** para hero, Smart Match e demonstrações

O primeiro vertical slice começou na branch `design/foundation` e aplica a linguagem Liquid Glass ao Dashboard sem alterar dados, autenticação ou API. Ele inclui auroras ambientais, superfícies glass, bordas especulares, motion com fallback para redução de movimento e um seletor de vagas baseado apenas em tokens semânticos.

## 18. Próximo Entregável

O próximo entregável após a validação visual do Dashboard será:

1. Liquid Glass premium
2. Cinematic AI
3. Human Editorial

Cada variante deverá conter hero, paleta, tipografia, tratamento de imagem, motion, exemplo de KPI e uma composição de Smart Match. A escolha da direção será feita antes da implementação das 16 rotas.

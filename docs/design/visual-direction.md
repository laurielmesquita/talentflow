# Direção visual - Clareza Competitiva Humana v0.1

**Produto:** TalentFlow
**Proprietário:** Lauriel Mesquita (PO)
**Responsável pela manutenção:** Produto + Design/Frontend
**Status:** Ativo - decisão visual v0.1 aprovada pelo PO
**Aprovação:** 2026-08-27
**Última revisão:** 2026-08-27
**Próxima revisão:** quando houver alteração aprovada de paleta, tipografia, imagem, composição, movimento ou intensidade por superfície

## 1. Propósito

Este documento registra a direção visual viva do TalentFlow para a landing page e o produto autenticado. Ele traduz a estratégia comercial e a arquitetura da informação em princípios de cor, composição, materialidade, imagem e intensidade.

Esta decisão não autoriza copiar a identidade de uma referência. Ela define as relações visuais que devem ser reinterpretadas em um sistema próprio, acessível e reconhecível como TalentFlow.

## 2. Design Read

> Redesign completo de um SaaS B2B de recrutamento para gestores e equipes enxutas de R&S, com linguagem premium, humana e confiável, apoiada por fotografia editorial e evidência real do produto.

O resultado deve transmitir simultaneamente:

- acolhimento;
- dinamismo;
- competição saudável;
- clareza;
- autoridade;
- responsabilidade humana.

## 3. Decisão cromática aprovada

A direção abandona azul, azul mineral e cobalt como hipóteses de cor principal. O sistema será construído a partir da combinação:

> **oliva profundo + verde-líquen de fundo amarelo + branco amplo + carvão**

Essa escolha não deve ser tratada como "usar verde". O valor está na relação entre quatro papéis:

1. o oliva profundo concentra ação e autoridade;
2. o líquen introduz energia, movimento e competitividade;
3. o branco cria espaço, calma e legibilidade;
4. o carvão adiciona peso, contraste e sofisticação.

### 3.1 Evidência observada na referência Granola

Os valores abaixo foram extraídos da interface pública da referência em 2026-08-27 e servem apenas para documentar a relação visual observada:

| Papel observado | Valor aproximado na referência |
| --- | --- |
| Oliva do CTA principal | `#5B6F00` |
| Líquen do grande bloco narrativo | `#B2C248` |
| Líquen mais luminoso do badge | `#D1E043` |
| Carvão | `#292929` |
| Superfície quase branca | `#F7F7F2` |
| Texto claro sobre fundos escuros | `#FCFCF8` |

Esses valores não são os tokens finais do TalentFlow. A paleta própria será criada em OKLCH, testada nos temas claro e escuro e ajustada para contraste WCAG.

### 3.2 Papéis semânticos futuros

| Papel | Direção |
| --- | --- |
| `primary` | Oliva profundo, usado em CTAs, seleção e ações de alta prioridade |
| `accent` | Líquen amarelado, usado em superfícies narrativas e destaques controlados |
| `background` | Branco ou quase branco neutro, dominante nas duas superfícies |
| `foreground` | Carvão, evitando preto puro |
| `surface` | Branco quebrado com separação discreta por borda, contraste ou sombra tonal |
| `muted` | Neutro claro com leve relação cromática com o oliva |

Estados de sucesso, atenção, erro e informação continuam semânticos. Eles não devem ser forçados a usar a cor principal quando isso prejudicar reconhecimento ou acessibilidade.

## 4. Leitura dos cinco recortes

### 4.1 Recorte 1: navegação, CTA e badge

O valor não está apenas nos tons de verde. Está no equilíbrio entre:

- cabeçalho branco com muito respiro;
- CTA oliva concentrando a ação principal;
- badge líquen mais luminoso em uma superfície neutra;
- texto carvão preservando leitura e autoridade.

Aplicação no TalentFlow:

- cabeçalho leve e destacado da página por borda e sombra tonal discreta;
- um CTA principal consistente, "Criar workspace gratuito";
- badges de novidade usados apenas para informação real;
- formato pill reservado para ações e chips, sem transformar todos os componentes em cápsulas.

### 4.2 Recorte 2: espaço negativo e painel do produto

O grande espaço branco permite que a interface respire e aumenta a percepção de valor do produto. O painel quase branco se separa do fundo por diferença mínima de tom, borda e sombra controlada.

Aplicação no TalentFlow:

- screenshots e demonstrações reais não serão comprimidos por excesso de texto;
- grandes áreas de respiro serão usadas entre mensagem e prova;
- painéis de produto terão materialidade discreta;
- a landing não reproduzirá o dashboard com caixas falsas feitas apenas para marketing.

### 4.3 Recorte 3: bloco líquen de alto impacto

O líquen funciona porque aparece como um momento concentrado, não como fundo permanente. O contraste com o carvão transmite energia sem recorrer a neon ou glow.

Aplicação no TalentFlow:

- um bloco narrativo de alta energia poderá destacar o mecanismo central do produto;
- candidatos possíveis: Smart Match explicável ou transformação de currículo em evidência verificável;
- o bloco deve conter uma mensagem principal, uma prova visual e pouco texto;
- o líquen não será usado atrás de textos longos nem repetido em todas as seções.

### 4.4 Recorte 4: seção carvão e interação horizontal

O carvão cria uma mudança de intensidade marcante depois do bloco líquen. O carrossel arrastável adiciona materialidade e participação sem depender de animação contínua.

Aplicação no TalentFlow:

- a landing poderá usar uma única seção carvão para confiança, histórias ou prova social;
- testemunhos só serão usados quando forem reais e autorizados;
- se ainda não houver testemunhos, essa seção poderá apresentar princípios verificáveis, segurança ou responsabilidade humana, sem fabricar clientes;
- uma interação horizontal deve oferecer arraste, controles visíveis, teclado, scroll-snap e alternativa para movimento reduzido;
- a rolagem horizontal não pode esconder conteúdo essencial.

### 4.5 Recorte 5: escala editorial e valorização da seção

A seção ganha valor pelo título amplo, pelo espaço antes do conteúdo e pela mudança deliberada de escala. Ela não depende de uma grade de cartões iguais.

Aplicação no TalentFlow:

- títulos de seção podem assumir escala editorial na landing;
- cada seção deve possuir composição própria, mantendo ritmo comum;
- o produto autenticado usará escala tipográfica mais contida;
- a tipografia display ainda será testada antes da aprovação final.

## 5. Intensidade por superfície

### 5.1 Landing page

Intensidade cromática e composicional: **alta, porém concentrada**.

- branco ou quase branco domina a página;
- oliva identifica ações principais e elementos de decisão;
- líquen aparece em um ou dois momentos narrativos de alto impacto;
- carvão aparece em uma grande seção de contraste, não em blocos alternados continuamente;
- imagens humanas e interfaces reais dividem o protagonismo;
- assimetria, espaço negativo e mudança de escala criam ritmo;
- motion explica hierarquia e transição de estado, sem decorar cada seção.

### 5.2 Produto autenticado

Intensidade cromática e composicional: **moderada e funcional**.

- fundos neutros e superfícies claras permanecem dominantes;
- oliva indica ação principal, navegação ativa, seleção e foco;
- líquen é usado em estados selecionados, destaques suaves, onboarding e superfícies de baixa extensão;
- grandes fundos líquidos ficam restritos a momentos vazios, educativos ou de ativação;
- carvão sustenta texto, navegação e superfícies de alta prioridade;
- dados, tabelas e formulários priorizam legibilidade e densidade operacional;
- o mesmo sistema visual conecta landing e produto sem transformar o dashboard em uma página de campanha.

### 5.3 Tema escuro

- carvão substitui preto puro;
- superfícies elevadas devem ser distinguíveis sem excesso de glow;
- oliva e líquen precisam de versões ajustadas em luminosidade e croma;
- o líquen não deve ser usado como texto pequeno sobre fundo claro;
- a hierarquia do tema claro deve sobreviver no tema escuro.

## 6. Tipografia

A referência Granola comprova que escala editorial pode conviver com uma ferramenta de IA. Entretanto, a adoção de uma serif display ainda não está aprovada.

Serão comparadas duas hipóteses:

1. sans display com personalidade + sans de interface;
2. serif display controlada na landing + sans de interface no produto.

Regras já definidas:

- o produto autenticado usa sans em navegação, formulários, tabelas, métricas e controles;
- no máximo duas famílias tipográficas;
- a personalidade não pode prejudicar leitura em português;
- títulos amplos devem respeitar o viewport mobile;
- a landing não repetirá a escala extrema da referência sem adaptação ao conteúdo do TalentFlow.

## 7. Fotografia e presença humana

As imagens devem mostrar pessoas envolvidas no processo de recrutamento:

- recrutador analisando informações no computador;
- conversa entre recrutador e gestor;
- entrevista ou encontro profissional;
- equipe discutindo critérios e evidências;
- momentos de decisão, revisão ou colaboração.

Direção fotográfica:

- documental ou editorial;
- humana e contemporânea;
- diversidade brasileira de etnias, tons de pele, biotipos, idades e cabelos representada com naturalidade, sem estereótipos ou tokenismo;
- ambientes profissionais reais;
- enquadramentos que deixem espaço para composição;
- ausência de pilhas de papel, poses de frustração e clichês corporativos.

Pessoas não devem ser apresentadas como clientes, testemunhos ou candidatas reais sem autorização e contexto verdadeiro.

## 8. Produto como prova visual

- utilizar screenshots reais ou componentes reais do produto;
- demonstrar currículo original e dados estruturados;
- mostrar Smart Match acompanhado de justificativa;
- evitar pontuações inventadas ou dados que pareçam resultados comerciais;
- diferenciar claramente dados de exemplo;
- não usar dashboards fictícios construídos apenas para preencher o hero.

## 9. Movimento e interação

### Landing

- `MOTION_INTENSITY: 4/10`;
- reveals leves em momentos de narrativa;
- transições motivadas por hierarquia ou mudança de estado;
- carrossel arrastável somente quando o conteúdo justificar;
- no máximo um padrão de rolagem especial por página;
- sem WebGL decorativo ou loops permanentes sem função.

### Produto

- `MOTION_INTENSITY: 2/10`;
- feedback imediato em controles;
- transições de modal, drawer, menu e atualização de lista;
- estados de carregamento com estrutura correspondente ao conteúdo;
- animações sempre degradadas para estado estático sob `prefers-reduced-motion`.

## 10. Dials da direção

| Superfície | Design Variance | Motion Intensity | Visual Density |
| --- | ---: | ---: | ---: |
| Landing page | 6/10 | 4/10 | 4/10 |
| Produto autenticado | 3/10 | 2/10 | 6/10 |

## 11. Regras de contraste e acessibilidade

- texto normal deve atingir WCAG AA, com alvo AAA nos textos principais;
- CTAs precisam manter contraste nos estados default, hover, active, focus e disabled;
- oliva e líquen não são intercambiáveis;
- líquen luminoso tende a funcionar como superfície com texto carvão, não como fundo de texto branco;
- foco visível não pode depender apenas de variação sutil de verde;
- nenhuma informação pode ser comunicada somente por cor;
- áreas tocáveis devem manter dimensão adequada no mobile.

## 12. Referências e papéis

| Referência | Papel na direção |
| --- | --- |
| [Granola](https://www.granola.ai/) | Âncora cromática, espaço negativo, blocos de cor, presença humana e escala editorial |
| [Attio](https://attio.com/) | Precisão visual e qualidade de apresentação do produto |
| [Vanta](https://www.vanta.com/) | Arquitetura de confiança, segurança e governança |
| [Ashby](https://www.ashbyhq.com/) | Arquitetura comercial e linguagem da categoria de recrutamento |
| [Greenhouse AI](https://www.greenhouse.com/uk/ai-recruiting) | Responsabilidade humana e explicabilidade como princípios de IA em recrutamento |
| [Diretrizes visuais Greenhouse](https://brand.greenhouse.com/visual-guidelines) | Referência complementar para fotografia humana, ativa e profissional |

Granola é uma referência de relações visuais, não um template. A identidade final não deve replicar seu logo, tipografia, ilustrações, textos, layouts exatos ou valores cromáticos.

## 13. Padrões rejeitados

- azul, azul mineral ou cobalt como cor principal;
- violeta genérico associado a produtos de IA;
- glows externos e fundos aurora sem função;
- três cartões iguais como padrão recorrente;
- glassmorphism em toda a interface;
- alternância aleatória entre seções claras e escuras;
- excesso de pills e cantos muito arredondados;
- fotografia de pessoas sobrecarregadas com papel;
- números, clientes ou resultados inventados;
- IA representada como agente autônomo que toma a decisão final.

## 14. Decisões ainda abertas

- valores finais dos tokens OKLCH;
- tipografia display da landing;
- evolução do símbolo e wordmark;
- proporção exata de cor por página;
- direção final de fotografia e produção das imagens;
- comportamento detalhado do carrossel e demais microinterações;
- aparência final do tema escuro.

Esses itens serão fechados na etapa de direções visuais e atualizados neste documento após aprovação.

## 15. Manutenção e histórico

Este é um documento vivo. Mudanças aprovadas de escopo visual devem atualizar o conteúdo, a versão, a data de revisão e o histórico abaixo no mesmo conjunto de alterações.

| Versão | Data | Alteração | Aprovação |
| --- | --- | --- | --- |
| 0.1 | 2026-08-27 | Registro da direção oliva + líquen + branco + carvão e sua intensidade por superfície | Lauriel Mesquita (PO) |
| 0.2 | 2026-08-27 | Primeira implementação: tokens globais migrados, landing reestruturada, header responsivo/autenticado e fotografia autoral com diversidade brasileira | Em execução, dentro do escopo autorizado |

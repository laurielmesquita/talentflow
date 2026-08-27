# Arquitetura da informação — v0.1

**Produto:** TalentFlow
**Proprietário:** Lauriel Mesquita (PO)
**Responsável pela manutenção:** Produto + Design/Frontend
**Status:** Ativo — baseline v0.1
**Última revisão:** 2026-08-27
**Próxima revisão:** quando houver alteração aprovada de escopo, navegação, hierarquia, jornada ou responsabilidade de uma página

## 1. Propósito

Este documento define a arquitetura da informação recomendada para a landing page, o produto autenticado, o portal de vagas, a autenticação e as páginas legais do TalentFlow.

Ele orienta a organização das jornadas e dos conteúdos. Não define ainda a direção estética final, a composição visual de cada tela nem uma migração obrigatória e imediata das URLs existentes.

## 2. Princípios estruturais

- separar claramente as jornadas de compradores, recrutadores e candidatos;
- organizar a experiência em torno das tarefas reais de R&S;
- manter as decisões e a responsabilidade humana visíveis;
- apresentar interface e fluxo reais como prova do produto;
- preservar o acesso a ações essenciais em qualquer tamanho de tela;
- evitar que páginas administrativas concorram com atividades operacionais;
- reduzir mudanças de contexto desnecessárias;
- manter linguagem, navegação e estados previsíveis;
- preservar rotas existentes inicialmente quando uma alteração estrutural não justificar o risco de migração.

## 3. Ambientes principais

```text
TalentFlow
├── Site institucional — compradores e equipes de R&S
├── Produto autenticado — operação cotidiana
├── Portal de vagas — candidatos
└── Autenticação e documentos legais
```

Essa separação evita que candidatos, recrutadores e compradores disputem atenção dentro da mesma navegação.

## 4. Site institucional

### 4.1 Navegação principal

- Produto
- Como funciona
- Segurança e IA
- Planos
- Vagas — acesso utilitário
- Entrar
- Criar workspace gratuito — CTA principal

No mobile, todos esses itens devem permanecer disponíveis por um botão de menu real, operável por toque e teclado. Nenhuma ação essencial pode depender de hover ou desaparecer em telas menores.

### 4.2 Arquitetura da landing page

| Ordem | Seção | Função |
| ---: | --- | --- |
| 1 | Hero | Comunicar público, problema, valor e CTA |
| 2 | Evidência do produto | Mostrar imediatamente uma interface real e compreensível |
| 3 | Contexto do problema | Demonstrar entendimento da rotina de R&S |
| 4 | Fluxo de trabalho | Explicar currículo → estruturação → comparação → revisão |
| 5 | Capacidades essenciais | Estruturar, comparar, verificar e organizar |
| 6 | Smart Match | Explicar aderência e justificativas sem sugerir decisão automática |
| 7 | Workspace de auditoria | Mostrar PDF original versus dados interpretados |
| 8 | Camada humana | Relacionar tecnologia, colaboração e responsabilidade |
| 9 | Segurança e governança | Isolamento, acessos, rastreabilidade e fluxo de dados |
| 10 | Demonstração | Tour guiado ou upload com aviso de privacidade preciso |
| 11 | Planos | Comparação transparente das capacidades disponíveis |
| 12 | Perguntas frequentes | Responder às principais objeções |
| 13 | CTA final | Criar workspace gratuito |
| 14 | Rodapé | Produto, vagas, acesso, contato e documentos legais |

### 4.3 Mudanças em relação à landing page existente

- a demonstração com upload deixa de aparecer prematuramente;
- a interface real passa a ser a principal prova visual;
- imagens redundantes de pessoas sobrecarregadas são removidas;
- imagens humanas passam a representar colaboração, análise, entrevistas e tomada de decisão;
- números ilustrativos deixam de parecer resultados reais;
- o produto não é apresentado como uma caixa-preta de IA;
- “Vagas” permanece acessível, mas não compete com a conversão B2B;
- o conteúdo deve ser substancialmente mais curto e ritmado que o atual.

## 5. Produto autenticado

### 5.1 Mapa principal

```text
Workspace
├── Visão geral
├── Candidatos
│   ├── Todos os candidatos
│   ├── Filtros e segmentos
│   ├── Upload individual
│   ├── Upload em lote
│   └── Tags e categorias
├── Vagas
│   ├── Todas as vagas
│   └── Detalhe da vaga
│       ├── Visão geral
│       ├── Requisitos
│       ├── Candidatos
│       ├── Smart Match
│       ├── Página pública
│       └── Configurações
├── Triagem
│   ├── Seleção da vaga
│   ├── Resultados
│   └── Justificativas
└── Administração
    ├── Equipe e acessos
    ├── Organização
    └── Configurações
        ├── Perfil
        ├── Segurança
        ├── Preferências
        └── Privacidade
```

### 5.2 Decisões de organização

- **Dashboard** passa a ser apresentado ao usuário como **Visão geral**, descrevendo melhor sua função.
- **Categorias** deixa de ocupar a mesma importância que candidatos e vagas; ela é incorporada ao universo do banco de talentos.
- **Smart Match** continua acessível como fluxo principal e também aparece no contexto de cada vaga.
- **Início** deixa de ser um item do produto autenticado; o logotipo leva à Visão geral.
- Usuários, organização e configurações são agrupados de acordo com o papel e a permissão do usuário.
- Funcionalidades indisponíveis para determinado plano ou papel devem apresentar explicação clara, não apenas controles desabilitados.
- A reorganização pode preservar inicialmente as URLs atuais para reduzir riscos. Mudanças de rotas só devem ocorrer durante a implementação, com redirecionamentos planejados.

## 6. Visão geral

A tela inicial autenticada deve responder rapidamente:

- o que exige minha atenção;
- quais vagas estão ativas;
- quais candidatos aguardam revisão;
- o que aconteceu recentemente;
- qual é o próximo passo recomendado.

### Estrutura sugerida

1. saudação e contexto do workspace;
2. ações principais;
3. pendências de revisão;
4. vagas ativas;
5. movimentação recente;
6. visão resumida do banco de talentos;
7. alertas de plano, processamento ou organização.

Os indicadores devem ser operacionais. A tela não deve ser preenchida com gráficos sem utilidade decisória.

## 7. Candidatos

### 7.1 Lista

- busca;
- filtros;
- segmentos;
- visualização de status;
- upload;
- seleção em lote;
- ações contextualizadas;
- estados vazios educativos.

### 7.2 Perfil do candidato

```text
Candidato
├── Resumo
├── Experiências e formação
├── Competências
├── Vagas e aderências
├── Tags
├── Versões
└── Histórico
```

A ação **Conferir currículo original** abre o workspace de auditoria.

### 7.3 Workspace de auditoria

O workspace de auditoria permanece como uma experiência dedicada, contendo:

- currículo original;
- dados interpretados;
- diferenças ou pontos de atenção;
- navegação entre candidatos;
- possibilidade de revisão;
- comunicação clara sobre o que veio do documento e o que foi inferido.

Essa tela deve se tornar um dos principais elementos de demonstração da landing page.

## 8. Vagas e triagem

### 8.1 Lista de vagas

- status;
- candidatos recebidos;
- atividade recente;
- acesso à página pública;
- ações de edição e compartilhamento.

### 8.2 Detalhe da vaga

A vaga se torna o centro do fluxo de triagem:

```text
Vaga
  → requisitos estruturados
  → candidatos relacionados
  → Smart Match
  → justificativas
  → revisão humana
  → formação da shortlist
```

O Smart Match não deve parecer uma análise independente do contexto. O usuário sempre deve ver:

- qual vaga está sendo considerada;
- quais requisitos foram utilizados;
- quais evidências foram encontradas;
- o que não foi identificado;
- por que determinada aderência foi sugerida.

## 9. Administração e permissões

### 9.1 Áreas administrativas

- Equipe e acessos;
- Organização;
- Perfil;
- Segurança;
- Preferências;
- Privacidade.

### 9.2 Princípio de visibilidade

A navegação deve respeitar o papel do usuário. Opções administrativas só aparecem quando forem pertinentes e permitidas. A arquitetura da informação não altera o modelo de autorização existente nem a arquitetura dual-cookie.

## 10. Portal público de vagas

A jornada do candidato é independente do marketing B2B:

```text
Vagas abertas
  → busca e filtros
  → detalhe da vaga
  → candidatura
  → verificação por e-mail
  → confirmação
```

Essa experiência deve ser:

- focada;
- mobile-first;
- acessível;
- associada à empresa contratante;
- transparente sobre o uso dos dados;
- livre de distrações comerciais destinadas a recrutadores.

## 11. Autenticação

```text
Entrar
├── Criar workspace
├── Recuperar senha
├── Redefinir senha
└── Confirmar e-mail
```

O cadastro deve comunicar que o usuário está criando um workspace organizacional, não apenas uma conta pessoal.

A arquitetura dual-cookie e o redirecionamento obrigatório após login permanecem intocados.

## 12. Páginas legais e confiança

As páginas de privacidade e termos integram a camada de confiança, mas permanecem separadas do fluxo operacional. Elas devem:

- estar acessíveis no rodapé e nos pontos de coleta de dados relevantes;
- refletir o fluxo real de dados e os fornecedores atuais;
- diferenciar claramente dados de usuários e dados de candidatos;
- evitar alegações de conformidade não revisadas;
- receber revisão jurídica antes de servirem como prova comercial de conformidade.

## 13. Comportamento responsivo

### 13.1 Landing page

- menu mobile completo;
- CTAs acessíveis sem overflow;
- áreas tocáveis com tamanho adequado;
- conteúdo sem depender de hover;
- demonstrações adaptadas, não apenas reduzidas;
- imagens com enquadramento específico para cada breakpoint.

### 13.2 Produto autenticado

- navegação principal persistente no desktop;
- quatro destinos operacionais prioritários no mobile;
- demais opções dentro de um menu claramente identificado;
- tabelas transformadas em listas ou cartões quando necessário;
- filtros apresentados em painel móvel;
- ações destrutivas nunca ocultas em gestos;
- auditoria com alternância acessível entre documento e dados quando não houver espaço para divisão lateral.

## 14. Requisitos transversais de interação

- todos os elementos interativos devem ser alcançáveis por teclado;
- ações essenciais devem possuir área de toque adequada;
- foco visível deve ser preservado;
- menus devem comunicar estado aberto ou fechado;
- modais e painéis devem administrar foco, Escape e bloqueio de rolagem;
- estados de carregamento, vazio, erro e sucesso devem ser planejados para cada fluxo;
- animações devem respeitar `prefers-reduced-motion` sem ocultar conteúdo;
- a hierarquia de títulos deve permanecer semântica;
- cada ambiente deve possuir uma região principal identificável.

## 15. Relação com a futura direção visual

Esta arquitetura será utilizada como base para:

1. exploração de referências visuais;
2. comparação de até três direções estéticas;
3. definição de tipografia, cor, densidade, imagem e movimento;
4. elaboração do sistema visual;
5. planejamento da implementação por seção e fluxo.

A direção visual não deve alterar silenciosamente esta arquitetura. Mudanças de hierarquia, jornada ou escopo exigem atualização deste documento.

## 16. Manutenção e histórico

Este é um documento vivo. Mudanças aprovadas de escopo devem atualizar o conteúdo, a versão, a data de revisão e o histórico abaixo no mesmo conjunto de alterações.

| Versão | Data | Alteração | Aprovação |
| --- | --- | --- | --- |
| 0.1 | 2026-08-27 | Criação da baseline de arquitetura da informação para landing, produto, portal de vagas e autenticação | Baseline registrada pelo PO |

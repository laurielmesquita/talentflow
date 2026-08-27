# Plano de execução do redesign integral - v0.1

**Produto:** TalentFlow
**Proprietário:** Lauriel Mesquita (PO)
**Responsável pela manutenção:** Produto + Design/Frontend + Engenharia
**Status:** Ativo - planejamento
**Última revisão:** 2026-08-27
**Próxima revisão:** ao concluir cada gate ou alterar escopo, ordem ou critério de qualidade

## 1. Objetivo

Executar a nova identidade e experiência do TalentFlow de forma incremental, verificável e reversível, cobrindo landing page, produto autenticado, portal de vagas, autenticação e páginas legais.

O trabalho deve preservar contratos críticos de autenticação, isolamento multi-tenant, integrações e comportamento funcional. Mudanças de produção exigem confirmação do PO e devem ocorrer em branch isolada.

## 2. Fontes obrigatórias

1. [Estratégia comercial e de posicionamento](../product/commercial-positioning-strategy.md)
2. [Arquitetura da informação](../design/information-architecture.md)
3. [Governança de Design e UX](../design/DESIGN.md)
4. [Direção visual](../design/visual-direction.md)
5. `talentflow-web/AGENTS.md`
6. Graphify para qualquer mudança que afete dependências, fluxos ou contratos entre componentes

## 3. Estratégia de modelos

### GPT-5.6 Luna em raciocínio médio

Usar como padrão para:

- implementação de componentes já especificados;
- migração de tokens e estilos;
- ajustes responsivos;
- criação e manutenção de testes;
- documentação;
- correções mecânicas;
- execução de verificações e refinamentos locais.

### GPT-5.6 Sol em raciocínio alto

Reservar para gates de alto impacto:

- fechamento da direção visual e do Design System;
- revisão de arquitetura antes de mudanças transversais;
- revisão crítica após concluir landing e shell do produto;
- auditoria final de coerência, acessibilidade, performance e risco.

O modelo não substitui os gates. Luna pode executar a maior parte do trabalho desde que receba decisões já documentadas, escopo limitado e critérios objetivos de verificação.

## 4. Fases

### Fase 0: governança e baseline

Status: **concluída parcialmente**.

- consolidar documentação canônica;
- remover duplicações;
- registrar estratégia, arquitetura e direção visual;
- preservar screenshots e métricas da versão atual para comparação;
- atualizar ou regenerar Graphify antes de mudanças estruturais;
- inventariar analytics, IDs, rotas e metadados de SEO que não podem desaparecer silenciosamente.

Gate: documentação aprovada e baseline técnico registrado.

### Fase 1: identidade e Design System

- criar paleta própria em OKLCH;
- validar contraste em temas claro e escuro;
- comparar as duas hipóteses tipográficas;
- definir escala tipográfica, espaçamento, raios, bordas, sombras e iconografia;
- definir padrões de fotografia e imagens necessárias;
- definir motion tokens e comportamento de movimento reduzido;
- revisar ou redesenhar símbolo e wordmark somente após aprovação específica;
- produzir uma página interna de laboratório visual para validação isolada.

Gate: aprovação do kit visual antes de aplicá-lo ao produto.

Modelo recomendado: Luna Médio para produção das variações; Sol Alto para síntese e revisão do gate.

### Fase 2: shell e fundação responsiva

- implementar tokens globais;
- criar shell público e shell autenticado;
- corrigir navegação mobile da landing;
- definir navegação desktop e mobile do produto;
- consolidar cabeçalhos, rodapé, menus e controles de tema;
- garantir foco, teclado, toque e estados reduzidos;
- preservar rotas e autenticação.

Gate: shell funcional em desktop e mobile, sem regressão de autenticação.

Modelo recomendado: Luna Médio.

### Fase 3: landing page por seção

Ordem de implementação:

1. navegação e hero;
2. evidência do produto;
3. contexto do problema;
4. fluxo de trabalho;
5. capacidades e Smart Match;
6. auditoria;
7. camada humana;
8. segurança e governança;
9. demonstração;
10. planos e perguntas frequentes;
11. CTA final e rodapé.

Cada seção deve ser aprovada visualmente e validada no mobile antes da próxima. Imagens finais podem ser substituídas por placeholders claramente marcados durante a construção, mas nenhuma interface falsa deve ser apresentada como produto real.

Gate: landing completa, coerente, acessível, responsiva e sem alegações não comprovadas.

Modelo recomendado: Luna Médio para execução; Sol Alto para revisão do conjunto.

### Fase 4: fluxos operacionais prioritários

Ordem recomendada:

1. Visão geral;
2. Candidatos;
3. Perfil e auditoria;
4. Vagas e detalhe da vaga;
5. Smart Match e justificativas.

Em cada fluxo:

- mapear estado atual e contratos;
- preservar comportamento funcional;
- implementar layout e estados;
- validar loading, vazio, erro e sucesso;
- validar desktop e mobile;
- criar ou atualizar testes E2E.

Gate: fluxo prioritário aprovado e coberto antes de avançar.

Modelo recomendado: Luna Médio, com Sol Alto apenas para revisão de mudanças transversais.

### Fase 5: fluxos complementares

- categorias e tags;
- equipe e usuários;
- organização;
- configurações;
- login, cadastro e recuperação de acesso;
- portal de vagas e candidatura;
- páginas legais revisadas.

Gate: consistência total entre superfícies e papéis de acesso.

Modelo recomendado: Luna Médio.

### Fase 6: qualidade e lançamento

- testes unitários e de integração aplicáveis;
- E2E dos principais fluxos;
- auditoria de acessibilidade;
- Lighthouse e Core Web Vitals;
- verificação de tema claro e escuro;
- matriz de breakpoints;
- revisão de SEO, metadados e dados estruturados;
- comparação visual com a baseline;
- revisão de segurança e privacidade nas áreas alteradas;
- revisão final do PO em preview de PR;
- atualização completa da documentação.

Gate: nenhuma regressão crítica, aprovação do PO e PR pronto. Deploy permanece fora de escopo até instrução explícita.

Modelo recomendado: Luna Médio para executar a matriz; Sol Alto para auditoria final.

## 3.1 Versionamento da entrega

O redesign integral é tratado como uma nova versão do produto. A implementação está registrada como release candidate `3.0.0-rc.1`.

- durante homologação visual e técnica: `3.0.0-rc.1`;
- após aprovação do PO e todos os gates: `3.0.0`;
- versões dos documentos (`0.x`) não substituem a versão do produto;
- package e lockfile já registram `3.0.0-rc.1`; a tag final `v3.0.0` será criada somente após homologação e aprovação do PO.

## 5. Estratégia de branch e entregas

- criar uma branch exclusiva após autorização do PO;
- evitar uma reescrita única de toda a aplicação;
- organizar commits por fundação, landing e fluxo operacional;
- manter cada etapa revisável;
- não misturar mudanças funcionais não relacionadas;
- usar preview da Vercel para aprovação visual antes do merge;
- preservar rollback por commit e por PR.

## 6. Gates permanentes

Nenhuma etapa é considerada concluída sem:

- responsividade real;
- navegação por teclado;
- contraste validado;
- movimento reduzido funcional;
- estados de loading, vazio, erro e sucesso;
- ausência de dados e resultados inventados;
- verificação de que a decisão humana permanece explícita;
- documentação atualizada;
- testes proporcionais ao risco.

## 7. Dependências antes da implementação visual

- aprovar tipografia;
- fechar tokens cromáticos próprios;
- decidir evolução ou preservação do logo;
- definir inventário de imagens humanas;
- instalar e ativar as skills Impeccable e Emil Kowalski nas etapas de auditoria e motion;
- atualizar Graphify se o mapa permanecer anterior ao código atual;
- confirmar o canal comercial antes de implementar CTA de contato ou demonstração.

## 8. Histórico

| Versão | Data | Alteração | Aprovação |
| --- | --- | --- | --- |
| 0.1 | 2026-08-27 | Criação do plano faseado para landing e produto completo | Planejamento inicial |
| 0.2 | 2026-08-27 | Blocos 1 a 6 executados: fundação visual, landing, shell, fluxos principais, estados, imagem autoral e auditorias técnicas | Escopo autorizado pelo PO |
| 0.3 | 2026-08-27 | Correções de qualidade: rota pública independente do build local, tipagens e lint direcionado; redesign classificado como release `3.0.0` | Decisão do PO |
| 0.4 | 2026-08-27 | Fechamento técnico local: lint global zerado, tipagens corrigidas, Portal compatível com testes, build de produção e E2E aprovados | Execução autorizada pelo PO |

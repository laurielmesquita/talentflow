# Governança de Design e UX - TalentFlow

**Produto:** TalentFlow
**Proprietário:** Lauriel Mesquita (PO)
**Responsável pela manutenção:** Produto + Design/Frontend
**Status:** Ativo - fonte canônica
**Última revisão:** 2026-08-27
**Próxima revisão:** a cada mudança aprovada de sistema visual, experiência ou componentes compartilhados

## 1. Propósito e precedência

Este é o ponto central de governança de Design e UX do TalentFlow. Ele não duplica as especificações detalhadas. Ele define quais documentos orientam cada decisão e quais invariantes devem ser preservadas na implementação.

Ordem de consulta:

1. [Estratégia comercial e de posicionamento](../product/commercial-positioning-strategy.md) para público, promessa, diferenciação e confiança;
2. [Arquitetura da informação](./information-architecture.md) para navegação, hierarquia e jornadas;
3. [Direção visual](./visual-direction.md) para cor, composição, tipografia, imagem, materialidade e intensidade;
4. `talentflow-web/AGENTS.md` para regras técnicas específicas do frontend;
5. componentes e tokens implementados para o contrato executável do sistema.

Quando um documento antigo conflitar com uma decisão aprovada mais recente, a decisão mais recente e registrada prevalece.

## 2. Filosofia aprovada

O TalentFlow adota uma linguagem de **clareza competitiva humana**:

- premium sem ornamentação gratuita;
- inteligente sem estética genérica de IA;
- humano sem fotografia corporativa artificial;
- operacional sem aparência burocrática;
- dinâmico sem excesso de movimento;
- denso quando a tarefa exigir, amplo quando a narrativa exigir.

Landing e produto pertencem à mesma marca, mas têm intensidades distintas. A landing constrói percepção e narrativa; o produto protege legibilidade, previsibilidade e eficiência diária.

## 3. Sistema cromático

A família aprovada combina oliva profundo, verde-líquen amarelado, branco amplo e carvão. Os papéis e restrições estão definidos em [visual-direction.md](./visual-direction.md).

### Regra técnica

- usar tokens semânticos em OKLCH;
- não usar cores literais em componentes de produção;
- preservar equivalência semântica entre temas claro e escuro;
- validar contraste de todos os estados interativos;
- manter estados de sucesso, informação, atenção e erro semanticamente distintos.

Exemplo correto:

```tsx
className="bg-background text-foreground border-border"
```

Exemplo incorreto:

```tsx
className="bg-green-900 text-white border-gray-200"
```

## 4. Regras por superfície

### 4.1 Landing page

- espaço negativo amplo;
- imagens humanas editoriais e interfaces reais;
- títulos de escala controlada;
- um ou dois blocos cromáticos de alto impacto;
- prova de produto antes de listas extensas de funcionalidades;
- no máximo um CTA principal por intenção;
- nenhum dado, cliente ou resultado inventado.

### 4.2 Produto autenticado

- densidade orientada por tarefa;
- navegação previsível;
- uso restrito de cor intensa;
- tabelas e listas priorizadas quando forem mais eficientes que cartões;
- ações primárias e estados ativos claramente identificados;
- estados vazio, carregando, erro e sucesso projetados em todos os fluxos.

### 4.3 Portal de vagas

- mobile-first;
- foco na vaga e candidatura;
- identidade da empresa contratante sem competição com marketing B2B;
- comunicação transparente sobre dados;
- formulários acessíveis e progressivos.

## 5. Módulos operacionais

### Candidatos

- visualização eficiente para busca, filtro e comparação;
- expansão e detalhes sem perder contexto;
- ações importantes disponíveis por toque e teclado, não somente por hover;
- tags e estados com baixa intensidade cromática;
- auditoria como ação clara e reconhecível.

### Vagas e triagem

- vaga como contexto central do Smart Match;
- requisitos, evidências e ausências visíveis;
- justificativa textual acompanhando pontuação ou aderência;
- resultado de IA apresentado como apoio revisável, não decisão automática.

### Smart Match

- não utilizar glow para significar inteligência;
- motion apenas para feedback, carregamento e mudança de estado;
- métricas com alinhamento tabular;
- explicabilidade mais importante que ornamentação algorítmica.

### Dashboard e tabelas

- indicadores operacionais e acionáveis;
- cabeçalhos e divisores discretos;
- gráficos somente quando revelarem uma relação útil;
- números com largura estável;
- adaptação explícita para mobile.

## 6. Movimento

- animar prioritariamente `transform` e `opacity`;
- respeitar `prefers-reduced-motion` sem ocultar conteúdo;
- usar movimento para hierarquia, narrativa, feedback ou transição de estado;
- evitar loops contínuos e scroll hijacking sem justificativa;
- manter movimento mais expressivo na landing e mais contido no produto;
- limpar listeners e animações ao desmontar componentes.

## 7. Primitivos compartilhados

- telas autenticadas usam `AppShell`;
- feedback usa `StatusMessage`;
- estados vazios e carregamentos usam `EmptyState` e `PageSkeleton`;
- campos usam os primitivos de formulário compartilhados;
- diálogos usam `ui/Dialog` com gestão de foco, Escape e restauração;
- componentes novos devem nascer acessíveis e responsivos;
- variantes visuais devem ser baseadas em tokens semânticos.

## 8. Governança de arquivos

- este arquivo é a única entrada canônica chamada `DESIGN.md`;
- decisões detalhadas vivem em `docs/design/`;
- `AGENTS.md` aponta os agentes para esta documentação;
- não manter cópias integrais dentro de serviços;
- código implementado não substitui a documentação de intenção;
- documentação de intenção não substitui testes e validação do código.

## 9. Histórico

| Versão | Data | Alteração | Aprovação |
| --- | --- | --- | --- |
| 0.1 | 2026-08-27 | Consolidação das cópias anteriores e alinhamento com a nova direção visual | Lauriel Mesquita (PO) |

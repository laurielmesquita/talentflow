# Design Presets — Standby Archive

Este diretório contém o módulo de **Design Presets** (estilos visuais inspirados em *Linear, Superhuman, Supabase, Resend e Stripe*) colocado em **standby** para preservação da base de código.

---

## 📁 Estrutura dos Arquivos em Standby

- **`presets/`**:
  - `linear.css`: Preset minimalista violeta neutro (Linear.app style).
  - `superhuman.css`: Preset deep purple premium com glows.
  - `supabase.css`: Preset esmeralda técnico e data-dense.
  - `resend.css`: Preset monocromático de alto contraste em escala de cinzas.
  - `stripe.css`: Preset B2B Tier-1 com gradientes e bordas de 14px.

---

## 🔄 Como Reativar o Design Presets no Futuro

Caso deseje reativar a alternância dinâmica de presets visuais:

1. **Restaurar os arquivos de estilos CSS**:
   Copie os arquivos de `docs/design-presets-standby/presets/` de volta para `talentflow-web/src/styles/presets/`.

2. **Reimportar os Presets no `src/app/globals.css`**:
   Adicione os imports no topo do `globals.css`:
   ```css
   @import "../styles/presets/linear.css";
   @import "../styles/presets/superhuman.css";
   @import "../styles/presets/supabase.css";
   @import "../styles/presets/resend.css";
   @import "../styles/presets/stripe.css";
   ```

3. **Reativar os componentes no `talentflow-web`**:
   - Reabra `src/components/preset-provider.tsx` e reative o contexto com `PRESETS` e persistência de `localStorage`.
   - Reabra `src/components/design-switcher.tsx` para renderizar o botão flutuante e modal de seleção.
   - No `src/app/layout.tsx`, envolva a aplicação com `<PresetProvider>` e inclua `<DesignSwitcher />`.

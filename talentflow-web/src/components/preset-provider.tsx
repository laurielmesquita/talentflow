"use client";

import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
} from "react";
import { useTheme } from "next-themes";

// ── Types ────────────────────────────────────────────────────────────────────

export type PresetId = "linear" | "superhuman" | "supabase" | "resend" | "stripe";

export interface PresetConfig {
  id: PresetId;
  label: string;
  description: string;
  /** "dark" | "light" | null = respeita next-themes atual */
  defaultTheme: "dark" | "light" | null;
  /** Cores representativas para o swatch no Switcher */
  swatchColors: [string, string, string];
}

export const PRESETS: PresetConfig[] = [
  {
    id: "linear",
    label: "Linear",
    description: "Ultra-minimal · violeta neutro · densidade máxima",
    defaultTheme: "light",
    swatchColors: ["oklch(0.985 0.004 265)", "oklch(0.52 0.22 275)", "oklch(0.88 0.015 265)"],
  },
  {
    id: "superhuman",
    label: "Superhuman",
    description: "Deep purple premium · dark-first · alto contraste",
    defaultTheme: "dark",
    swatchColors: ["oklch(0.10 0.028 295)", "oklch(0.65 0.27 295)", "oklch(0.18 0.04 295)"],
  },
  {
    id: "supabase",
    label: "Supabase",
    description: "Esmeralda técnico · slate escuro · data-dense",
    defaultTheme: "dark",
    swatchColors: ["oklch(0.11 0.015 155)", "oklch(0.68 0.20 155)", "oklch(0.18 0.022 155)"],
  },
  {
    id: "resend",
    label: "Resend",
    description: "Monocromático · alto contraste · neutro",
    defaultTheme: null,
    swatchColors: ["oklch(0.992 0 0)", "oklch(0.15 0 0)", "oklch(0.88 0 0)"],
  },
  {
    id: "stripe",
    label: "Stripe",
    description: "Violeta signature · bordas premium · B2B Tier-1",
    defaultTheme: "light",
    swatchColors: ["oklch(0.990 0.005 265)", "oklch(0.50 0.26 270)", "oklch(0.875 0.018 265)"],
  },
];

const STORAGE_KEY = "talentflow-design-preset";
const DEFAULT_PRESET: PresetId = "linear";

// ── Context ──────────────────────────────────────────────────────────────────

interface PresetContextValue {
  activePreset: PresetId;
  setPreset: (id: PresetId) => void;
  presets: PresetConfig[];
}

const PresetContext = createContext<PresetContextValue>({
  activePreset: DEFAULT_PRESET,
  setPreset: () => {},
  presets: PRESETS,
});

export function usePreset() {
  return useContext(PresetContext);
}

// ── Provider ─────────────────────────────────────────────────────────────────

export function PresetProvider({ children }: { children: React.ReactNode }) {
  const { setTheme } = useTheme();

  // Inicializa com o valor já aplicado pelo script anti-FOUC do layout.tsx
  const [activePreset, setActivePreset] = useState<PresetId>(() => {
    if (typeof window === "undefined") return DEFAULT_PRESET;
    const stored = localStorage.getItem(STORAGE_KEY) as PresetId | null;
    return stored && PRESETS.some((p) => p.id === stored) ? stored : DEFAULT_PRESET;
  });

  const setPreset = useCallback(
    (id: PresetId) => {
      const config = PRESETS.find((p) => p.id === id);
      if (!config) return;

      const html = document.documentElement;

      // Melhoria #5 — Transição suavizada
      html.classList.add("preset-switching");

      // Aplica o novo data-preset e persiste
      html.setAttribute("data-preset", id);
      localStorage.setItem(STORAGE_KEY, id);
      setActivePreset(id);

      // Melhoria #1 — Sincroniza next-themes com o defaultTheme do preset
      if (config.defaultTheme === "dark") {
        setTheme("dark");
      } else if (config.defaultTheme === "light") {
        setTheme("light");
      }
      // defaultTheme === null → respeita a configuração atual do next-themes

      // Remove classe de transição após 300ms
      const timer = setTimeout(() => {
        html.classList.remove("preset-switching");
      }, 300);

      return () => clearTimeout(timer);
    },
    [setTheme]
  );

  // Sincroniza o tema na montagem do componente
  useEffect(() => {
    const config = PRESETS.find((p) => p.id === activePreset);
    if (!config) return;

    // Garante que o data-preset está aplicado (redundância ao script inline)
    document.documentElement.setAttribute("data-preset", activePreset);

    if (config.defaultTheme === "dark") {
      setTheme("dark");
    } else if (config.defaultTheme === "light") {
      setTheme("light");
    }
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  return (
    <PresetContext.Provider value={{ activePreset, setPreset, presets: PRESETS }}>
      {children}
    </PresetContext.Provider>
  );
}

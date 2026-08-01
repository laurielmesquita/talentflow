"use client";

import React from "react";

export type PresetId = "linear" | "superhuman" | "supabase" | "resend" | "stripe";

export interface PresetConfig {
  id: PresetId;
  label: string;
  description: string;
  defaultTheme: "dark" | "light" | null;
  swatchColors: [string, string, string];
}

export const PRESETS: PresetConfig[] = [];

export function usePreset() {
  return {
    activePreset: "linear" as PresetId,
    setPreset: () => {},
    presets: PRESETS,
  };
}

export function PresetProvider({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}


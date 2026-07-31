"use client";

import { AnimatePresence, motion } from "framer-motion";
import { Palette, X, Check } from "lucide-react";
import { useState } from "react";
import { PRESETS, usePreset, type PresetId } from "./preset-provider";

// ── Swatch visual de cada preset ─────────────────────────────────────────────

function PresetSwatch({ colors }: { colors: [string, string, string] }) {
  return (
    <div className="flex gap-0.5 rounded overflow-hidden shrink-0" aria-hidden>
      {colors.map((c, i) => (
        <span
          key={i}
          className="h-5 w-3 rounded-[2px]"
          style={{ background: c }}
        />
      ))}
    </div>
  );
}

// ── Botão individual de preset ────────────────────────────────────────────────

function PresetButton({
  preset,
  isActive,
  onSelect,
}: {
  preset: (typeof PRESETS)[number];
  isActive: boolean;
  onSelect: (id: PresetId) => void;
}) {
  return (
    <motion.button
      id={`design-preset-${preset.id}`}
      onClick={() => onSelect(preset.id)}
      whileHover={{ scale: 1.01 }}
      whileTap={{ scale: 0.98 }}
      className={[
        "w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-left",
        "transition-colors duration-150 cursor-pointer",
        isActive
          ? "bg-primary/10 ring-1 ring-primary/40"
          : "hover:bg-muted",
      ].join(" ")}
      aria-pressed={isActive}
      aria-label={`Ativar preset ${preset.label}`}
    >
      <PresetSwatch colors={preset.swatchColors} />

      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium text-foreground leading-none">
          {preset.label}
        </p>
        <p className="text-xs text-muted-foreground mt-1 leading-snug">
          {preset.description}
        </p>
      </div>

      {isActive && (
        <Check
          size={14}
          className="text-primary shrink-0"
          aria-hidden
        />
      )}
    </motion.button>
  );
}

// ── Componente principal ──────────────────────────────────────────────────────

export function DesignSwitcher() {
  const { activePreset, setPreset, presets } = usePreset();
  const [isOpen, setIsOpen] = useState(false);

  const activeConfig = presets.find((p) => p.id === activePreset);

  return (
    <div
      className="fixed bottom-6 right-6 z-[9999] flex flex-col items-end gap-2"
      role="region"
      aria-label="Design System Switcher"
    >
      {/* ── Painel de presets ── */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            id="design-switcher-panel"
            initial={{ opacity: 0, y: 8, scale: 0.97 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 8, scale: 0.97 }}
            transition={{ type: "spring", stiffness: 400, damping: 30 }}
            className={[
              "w-72 rounded-xl border border-border bg-card shadow-xl",
              "overflow-hidden backdrop-blur-sm",
            ].join(" ")}
          >
            {/* Header */}
            <div className="flex items-center justify-between px-4 py-3 border-b border-border">
              <div className="flex items-center gap-2">
                <Palette size={14} className="text-muted-foreground" aria-hidden />
                <span className="text-xs font-semibold text-foreground uppercase tracking-wider">
                  Design Preset
                </span>
              </div>
              <span className="text-[10px] bg-primary/10 text-primary px-2 py-0.5 rounded-full font-medium">
                Preview
              </span>
            </div>

            {/* Lista de presets */}
            <div className="p-2 flex flex-col gap-0.5">
              {presets.map((preset) => (
                <PresetButton
                  key={preset.id}
                  preset={preset}
                  isActive={activePreset === preset.id}
                  onSelect={(id) => {
                    setPreset(id);
                    // Não fecha o painel — permite comparar visualmente
                  }}
                />
              ))}
            </div>

            {/* Footer */}
            <div className="px-4 py-2.5 border-t border-border">
              <p className="text-[10px] text-muted-foreground leading-snug">
                Preferência salva localmente · não afeta produção
              </p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── Botão flutuante ── */}
      <motion.button
        id="design-switcher-trigger"
        onClick={() => setIsOpen((v) => !v)}
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        transition={{ type: "spring", stiffness: 500, damping: 25 }}
        className={[
          "flex items-center gap-2 h-10 px-3.5 rounded-full",
          "border border-border bg-card shadow-lg",
          "text-sm font-medium text-foreground",
          "hover:border-primary/40 hover:shadow-primary/10",
          "transition-shadow duration-200 cursor-pointer",
        ].join(" ")}
        aria-expanded={isOpen}
        aria-controls="design-switcher-panel"
        aria-label={`Design Switcher — preset ativo: ${activeConfig?.label ?? activePreset}`}
      >
        {/* Swatch compacto do preset ativo */}
        {activeConfig && (
          <div className="flex gap-0.5" aria-hidden>
            {activeConfig.swatchColors.map((c, i) => (
              <span
                key={i}
                className="h-3 w-2 rounded-[2px]"
                style={{ background: c }}
              />
            ))}
          </div>
        )}

        <span className="text-xs">
          {isOpen ? (
            <X size={14} aria-hidden />
          ) : (
            activeConfig?.label ?? "Preset"
          )}
        </span>
      </motion.button>
    </div>
  );
}

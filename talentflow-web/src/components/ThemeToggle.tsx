"use client";

import * as React from "react";
import { Moon, Sun } from "lucide-react";
import { useTheme } from "next-themes";
import { motion } from "framer-motion";

export function ThemeToggle() {
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = React.useState(false);

  React.useEffect(() => setMounted(true), []);

  if (!mounted) return <div className="w-9 h-9" />;

  const isDark = theme === "dark" || (theme === "system" && window.matchMedia("(prefers-color-scheme: dark)").matches);

  return (
    <motion.button
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.95 }}
      onClick={() => setTheme(isDark ? "light" : "dark")}
      className="relative flex items-center justify-center w-9 h-9 rounded-full bg-slate-100 dark:bg-white/10 text-slate-600 dark:text-slate-300 hover:text-primary transition-colors border border-transparent hover:border-slate-200 dark:hover:border-white/20 shadow-sm"
      aria-label="Toggle theme"
    >
      <Sun className="h-4 w-4 transition-all scale-100 rotate-0 dark:scale-0 dark:-rotate-90 absolute" />
      <Moon className="h-4 w-4 transition-all scale-0 rotate-90 dark:scale-100 dark:rotate-0 absolute" />
    </motion.button>
  );
}

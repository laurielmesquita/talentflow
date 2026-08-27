"use client";

import React from 'react';
import { motion } from 'framer-motion';

interface PageHeaderProps {
  title: string;
  subtitle?: string;
  actions?: React.ReactNode;
}

export default function PageHeader({ title, subtitle, actions }: PageHeaderProps) {
  return (
    <div className="border-b border-border bg-background">
      <div className="mx-auto max-w-7xl px-5 py-7 sm:px-6 sm:py-9">
        <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
            className="min-w-0 flex-1"
          >
            <h1 className="text-3xl font-semibold tracking-[-0.04em] text-foreground sm:text-4xl">
              {title}
            </h1>
            {subtitle && (
              <p className="mt-2 max-w-2xl text-sm leading-relaxed text-muted-foreground sm:text-base">
                {subtitle}
              </p>
            )}
          </motion.div>
          
          {actions && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: 0.05 }}
              className="flex shrink-0 flex-wrap items-center gap-3"
            >
              {actions}
            </motion.div>
          )}
        </div>
      </div>
    </div>
  );
}

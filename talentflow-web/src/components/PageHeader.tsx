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
    <div className="border-b border-border/40 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="max-w-7xl mx-auto px-6 py-6 sm:py-8">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
            className="flex-1 min-w-0"
          >
            <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-foreground truncate">
              {title}
            </h1>
            {subtitle && (
              <p className="mt-1 text-sm sm:text-base text-muted-foreground truncate">
                {subtitle}
              </p>
            )}
          </motion.div>
          
          {actions && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: 0.05 }}
              className="flex items-center shrink-0 gap-3"
            >
              {actions}
            </motion.div>
          )}
        </div>
      </div>
    </div>
  );
}

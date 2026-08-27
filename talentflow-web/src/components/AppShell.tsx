'use client';

import type { ReactNode } from 'react';
import Navbar from '@/components/Navbar';
import PageHeader from '@/components/PageHeader';

interface AppShellProps {
  title?: string;
  subtitle?: string;
  actions?: ReactNode;
  children: ReactNode;
  className?: string;
}

/** Shared frame for every authenticated operational screen. */
export default function AppShell({
  title,
  subtitle,
  actions,
  children,
  className = '',
}: AppShellProps) {
  return (
    <div className={`dashboard-atmosphere flex-1 bg-background text-foreground ${className}`}>
      <div className="ambient-warm-orb" aria-hidden="true" />
      <Navbar />
      {title && <PageHeader title={title} subtitle={subtitle} actions={actions} />}
      {children}
    </div>
  );
}

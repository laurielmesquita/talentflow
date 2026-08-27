import type { ReactNode } from 'react';
import AppShell from '@/components/AppShell';
import SettingsNavigation from '@/components/SettingsNavigation';

export default function SettingsShell({ children }: { children: ReactNode }) {
  return <AppShell title="Configurações da conta" subtitle="Gerencie seu acesso, preferências e dados pessoais."><div className="mx-auto grid w-full max-w-7xl gap-6 px-4 py-8 sm:px-6 lg:grid-cols-[220px_minmax(0,1fr)] lg:gap-10"><aside className="lg:sticky lg:top-24 lg:self-start"><SettingsNavigation /></aside><div className="min-w-0">{children}</div></div></AppShell>;
}

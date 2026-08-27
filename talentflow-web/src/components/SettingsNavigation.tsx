'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { KeyRound, ShieldCheck, SlidersHorizontal, User } from 'lucide-react';

const items = [
  { href: '/settings/profile', label: 'Perfil', icon: User },
  { href: '/settings/security', label: 'Segurança', icon: KeyRound },
  { href: '/settings/preferences', label: 'Preferências', icon: SlidersHorizontal },
  { href: '/settings/privacy', label: 'Privacidade e dados', icon: ShieldCheck },
];

export default function SettingsNavigation() {
  const pathname = usePathname();
  return (
    <nav className="-mx-4 overflow-x-auto px-4 pb-1 lg:mx-0 lg:px-0" aria-label="Seções de configurações da conta">
      <div className="flex min-w-max gap-1 lg:min-w-0 lg:flex-col">
        {items.map(({ href, label, icon: Icon }) => {
          const active = pathname === href;
          return <Link key={href} href={href} aria-current={active ? 'page' : undefined} className={`flex items-center gap-2 rounded-xl px-3 py-2 text-sm transition-colors ${active ? 'bg-primary/10 font-semibold text-primary' : 'text-muted-foreground hover:bg-accent hover:text-foreground'}`}><Icon className="h-4 w-4" aria-hidden="true" />{label}</Link>;
        })}
      </div>
    </nav>
  );
}

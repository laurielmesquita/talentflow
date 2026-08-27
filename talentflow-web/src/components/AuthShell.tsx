import type { ReactNode } from 'react';

export default function AuthShell({ children }: { children: ReactNode }) {
  return <main className="dashboard-atmosphere relative flex flex-1 items-center justify-center overflow-hidden bg-background p-4 text-foreground"><div className="pointer-events-none absolute -left-[10%] -top-[10%] h-[500px] w-[500px] rounded-full bg-primary/5 blur-[100px]" /><div className="pointer-events-none absolute -bottom-[10%] -right-[10%] h-[600px] w-[600px] rounded-full bg-primary/5 blur-[120px]" />{children}</main>;
}

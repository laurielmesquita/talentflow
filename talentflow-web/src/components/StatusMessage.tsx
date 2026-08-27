import type { ReactNode } from 'react';
import { AlertCircle, CheckCircle2, Info } from 'lucide-react';

type StatusTone = 'error' | 'success' | 'info';

interface StatusMessageProps {
  tone?: StatusTone;
  children: ReactNode;
  className?: string;
}

const styles: Record<StatusTone, string> = {
  error: 'border-destructive/30 bg-destructive/10 text-destructive',
  success: 'border-emerald-500/30 bg-emerald-500/10 text-emerald-700 dark:text-emerald-400',
  info: 'border-primary/25 bg-primary/10 text-foreground',
};

const icons = {
  error: AlertCircle,
  success: CheckCircle2,
  info: Info,
};

export default function StatusMessage({ tone = 'info', children, className = '' }: StatusMessageProps) {
  const Icon = icons[tone];
  const role = tone === 'error' ? 'alert' : 'status';

  return (
    <div role={role} className={`flex gap-2 rounded-xl border p-4 text-sm ${styles[tone]} ${className}`}>
      <Icon className="h-5 w-5 shrink-0" aria-hidden="true" />
      <div>{children}</div>
    </div>
  );
}

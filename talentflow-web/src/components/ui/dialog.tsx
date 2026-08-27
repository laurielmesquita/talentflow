'use client';

import { useEffect, useId, useRef, type ReactNode } from 'react';
import Portal from '@/components/Portal';

interface DialogProps {
  isOpen: boolean;
  onClose: () => void;
  children: ReactNode;
  ariaLabel?: string;
  className?: string;
}

const focusableSelector = [
  'a[href]',
  'button:not([disabled])',
  'input:not([disabled])',
  'select:not([disabled])',
  'textarea:not([disabled])',
  '[tabindex]:not([tabindex="-1"])',
].join(',');

export function Dialog({ isOpen, onClose, children, ariaLabel, className = '' }: DialogProps) {
  const dialogRef = useRef<HTMLDivElement>(null);
  const returnFocusRef = useRef<HTMLElement | null>(null);
  const titleId = useId();

  useEffect(() => {
    if (!isOpen) return;

    returnFocusRef.current = document.activeElement instanceof HTMLElement ? document.activeElement : null;
    const dialog = dialogRef.current;
    const firstFocusable = dialog?.querySelector<HTMLElement>(focusableSelector);
    (firstFocusable ?? dialog)?.focus();

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        event.preventDefault();
        onClose();
        return;
      }
      if (event.key !== 'Tab' || !dialog) return;
      const focusable = Array.from(dialog.querySelectorAll<HTMLElement>(focusableSelector));
      if (!focusable.length) {
        event.preventDefault();
        dialog.focus();
        return;
      }
      const first = focusable[0];
      const last = focusable[focusable.length - 1];
      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault();
        last.focus();
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault();
        first.focus();
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => {
      document.removeEventListener('keydown', handleKeyDown);
      returnFocusRef.current?.focus();
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <Portal lockScroll>
      <div className="fixed inset-0 z-[120] flex items-center justify-center p-4">
        <button type="button" aria-label="Fechar diálogo" className="absolute inset-0 cursor-default bg-foreground/45 backdrop-blur-md" onClick={onClose} />
        <div ref={dialogRef} role="dialog" aria-modal="true" aria-label={ariaLabel} aria-labelledby={ariaLabel ? undefined : titleId} tabIndex={-1} className={`relative z-10 w-full max-w-md rounded-2xl border border-border bg-card p-6 text-foreground shadow-2xl ${className}`}>
          <span id={titleId} className="sr-only">{ariaLabel ?? 'Diálogo'}</span>
          {children}
        </div>
      </div>
    </Portal>
  );
}

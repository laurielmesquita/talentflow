import { fireEvent, render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import { Dialog } from '@/components/ui/dialog';

describe('Dialog', () => {
  it('exposes an accessible modal and closes on Escape', () => {
    const onClose = vi.fn();
    render(
      <Dialog isOpen onClose={onClose} ariaLabel="Excluir candidato">
        <button type="button">Cancelar</button>
      </Dialog>,
    );

    expect(screen.getByRole('dialog', { name: 'Excluir candidato' })).toBeDefined();
    fireEvent.keyDown(document, { key: 'Escape' });
    expect(onClose).toHaveBeenCalledOnce();
  });
});

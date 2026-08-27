import { render, screen } from '@testing-library/react';
import { Briefcase } from 'lucide-react';
import { describe, expect, it } from 'vitest';
import EmptyState from '@/components/EmptyState';
import PageSkeleton from '@/components/PageSkeleton';
import StatusMessage from '@/components/StatusMessage';

describe('feedback primitives', () => {
  it('exposes an assertive message for errors', () => {
    render(<StatusMessage tone="error">Não foi possível salvar.</StatusMessage>);

    expect(screen.getByRole('alert').textContent).toContain('Não foi possível salvar.');
  });

  it('renders an actionable empty state', () => {
    render(
      <EmptyState
        icon={Briefcase}
        title="Nenhuma vaga"
        description="Crie uma vaga para começar."
        action={<button type="button">Criar vaga</button>}
      />,
    );

    expect(screen.getByRole('heading', { name: 'Nenhuma vaga' })).toBeDefined();
    expect(screen.getByRole('button', { name: 'Criar vaga' })).toBeDefined();
  });

  it('announces skeleton loading without exposing decorative blocks', () => {
    render(<PageSkeleton cards={2} />);

    expect(screen.getByLabelText('Carregando conteúdo').getAttribute('aria-busy')).toBe('true');
  });
});

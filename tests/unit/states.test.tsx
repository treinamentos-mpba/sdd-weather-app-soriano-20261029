import { cleanup, render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { afterEach, describe, expect, it, vi } from 'vitest';
import EmptyState from '../../src/components/states/EmptyState';
import ErrorState from '../../src/components/states/ErrorState';
import LoadingState from '../../src/components/states/LoadingState';

afterEach(cleanup);

describe('LoadingState', () => {
  it('anuncia carregamento por status com indicador apenas decorativo', () => {
    render(<LoadingState />);
    expect(screen.getByRole('status')).toHaveTextContent('Carregando...');
    expect(screen.queryByRole('alert')).not.toBeInTheDocument();
    expect(screen.getByRole('status').querySelector('[aria-hidden="true"]')).toHaveClass(
      'motion-safe:animate-spin',
    );
  });

  it('aceita mensagem contextual e desaparece quando desmontado pelo pai', () => {
    const { unmount } = render(<LoadingState message="Buscando cidades..." />);
    expect(screen.getByRole('status')).toHaveTextContent('Buscando cidades...');
    unmount();
    expect(screen.queryByRole('status')).not.toBeInTheDocument();
  });
});

describe('ErrorState', () => {
  it.each([
    'Verifique sua conexão e tente novamente.',
    'A consulta demorou mais que o esperado.',
    'Limite de consultas atingido. Aguarde antes de tentar novamente.',
  ])('anuncia a mensagem de erro: %s', (message) => {
    render(<ErrorState message={message} onRetry={vi.fn()} />);
    expect(screen.getByRole('alert')).toHaveTextContent(message);
    expect(screen.getByRole('heading', { level: 2 })).toHaveTextContent(
      'Não foi possível concluir a consulta',
    );
    expect(screen.getByRole('button', { name: 'Tentar novamente' })).toBeEnabled();
    expect(screen.queryByRole('status')).not.toBeInTheDocument();
  });

  it.each(['click', 'enter', 'space'])('executa retry por %s', async (method) => {
    const user = userEvent.setup();
    const onRetry = vi.fn();
    render(<ErrorState message="Falha ao consultar o clima." onRetry={onRetry} />);
    const button = screen.getByRole('button', { name: 'Tentar novamente' });
    expect(onRetry).not.toHaveBeenCalled();

    if (method === 'click') {
      await user.click(button);
    } else {
      await user.tab();
      expect(button).toHaveFocus();
      await user.keyboard(method === 'enter' ? '{Enter}' : ' ');
    }

    expect(onRetry).toHaveBeenCalledExactlyOnceWith();
  });

  it('não envia um formulário pai ao tentar novamente', async () => {
    const user = userEvent.setup();
    const onSubmit = vi.fn((event) => event.preventDefault());
    const onRetry = vi.fn();
    render(
      <form onSubmit={onSubmit}>
        <ErrorState message="Consulta indisponível." onRetry={onRetry} />
      </form>,
    );
    await user.click(screen.getByRole('button', { name: 'Tentar novamente' }));
    expect(onRetry).toHaveBeenCalledOnce();
    expect(onSubmit).not.toHaveBeenCalled();
  });
});

describe('EmptyState', () => {
  it('informa busca sem resultados com título e dica, sem indicar erro técnico', () => {
    render(<EmptyState />);
    expect(screen.getByRole('status')).toHaveTextContent('Nenhuma cidade encontrada');
    expect(screen.getByRole('heading', { level: 2 })).toHaveTextContent(
      'Nenhuma cidade encontrada',
    );
    expect(screen.getByText(/Revise a grafia ou inclua o estado ou país/)).toBeInTheDocument();
    expect(screen.queryByRole('alert')).not.toBeInTheDocument();
    expect(screen.queryByRole('button', { name: 'Tentar novamente' })).not.toBeInTheDocument();
  });

  it('permite personalizar título e dica', () => {
    render(
      <EmptyState title="Busque uma cidade" hint="Digite o nome da cidade no campo de busca." />,
    );
    expect(screen.getByRole('heading', { name: 'Busque uma cidade' })).toBeInTheDocument();
    expect(screen.getByRole('status')).toHaveTextContent(
      'Digite o nome da cidade no campo de busca.',
    );
  });
});

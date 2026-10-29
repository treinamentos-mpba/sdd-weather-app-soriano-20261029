import { cleanup, fireEvent, render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { afterEach, describe, expect, it, vi } from 'vitest';
import SearchBar from '../../src/components/SearchBar';

afterEach(cleanup);

describe('SearchBar', () => {
  it('oferece região de busca nomeada e label visível associada ao input', () => {
    render(<SearchBar onSearch={vi.fn()} />);

    expect(screen.getByRole('search', { name: 'Busca de cidades' })).toBeInTheDocument();
    expect(screen.getByRole('searchbox', { name: 'Cidade' })).toBe(screen.getByLabelText('Cidade'));
  });

  it.each(['', '   ', ' a '])('rejeita consulta inválida %j com erro acessível', async (value) => {
    const user = userEvent.setup();
    const onSearch = vi.fn();
    render(<SearchBar onSearch={onSearch} />);
    const input = screen.getByRole('searchbox', { name: 'Cidade' });

    if (value) await user.type(input, value);
    await user.click(screen.getByRole('button', { name: 'Buscar' }));

    expect(onSearch).not.toHaveBeenCalled();
    expect(screen.getByRole('alert')).toHaveTextContent('Digite pelo menos 2 caracteres');
    expect(input).toHaveAttribute('aria-invalid', 'true');
    expect(input).toHaveAccessibleDescription(
      'Digite pelo menos 2 caracteres para buscar uma cidade.',
    );
  });

  it.each([
    'button',
    'enter',
  ])('busca somente no envio por %s, removendo espaços', async (method) => {
    const user = userEvent.setup();
    const onSearch = vi.fn();
    render(<SearchBar onSearch={onSearch} />);

    await user.type(screen.getByRole('searchbox'), '  São Paulo  ');
    expect(onSearch).not.toHaveBeenCalled();
    if (method === 'button') {
      await user.click(screen.getByRole('button', { name: 'Buscar' }));
    } else {
      await user.keyboard('{Enter}');
    }

    expect(onSearch).toHaveBeenCalledExactlyOnceWith('São Paulo');
  });

  it('remove o erro ao corrigir o campo e aceita o mínimo de dois caracteres', async () => {
    const user = userEvent.setup();
    const onSearch = vi.fn();
    render(<SearchBar onSearch={onSearch} />);
    await user.click(screen.getByRole('button', { name: 'Buscar' }));
    await user.type(screen.getByRole('searchbox'), 'It');

    expect(screen.queryByRole('alert')).not.toBeInTheDocument();
    expect(screen.getByRole('searchbox')).toHaveAttribute('aria-invalid', 'false');
    await user.keyboard('{Enter}');
    expect(onSearch).toHaveBeenCalledExactlyOnceWith('It');
  });

  it('desabilita os controles e bloqueia inclusive envio programático', async () => {
    const user = userEvent.setup();
    const onSearch = vi.fn();
    const { rerender } = render(<SearchBar onSearch={onSearch} />);
    await user.type(screen.getByRole('searchbox'), 'Salvador');
    rerender(<SearchBar onSearch={onSearch} disabled />);

    expect(screen.getByRole('searchbox')).toBeDisabled();
    expect(screen.getByRole('button', { name: 'Buscar' })).toBeDisabled();
    await user.click(screen.getByRole('button', { name: 'Buscar' }));
    fireEvent.submit(screen.getByRole('search'));
    expect(onSearch).not.toHaveBeenCalled();

    rerender(<SearchBar onSearch={onSearch} disabled={false} />);
    await user.click(screen.getByRole('button', { name: 'Buscar' }));
    expect(onSearch).toHaveBeenCalledExactlyOnceWith('Salvador');
  });

  it('mantém labels e erros independentes entre instâncias', async () => {
    const user = userEvent.setup();
    render(
      <>
        <SearchBar onSearch={vi.fn()} />
        <SearchBar onSearch={vi.fn()} />
      </>,
    );

    const inputs = screen.getAllByRole('searchbox', { name: 'Cidade' });
    expect(inputs[0].id).not.toBe(inputs[1].id);
    await user.click(screen.getAllByRole('button', { name: 'Buscar' })[0]);
    expect(inputs[0]).toHaveAccessibleDescription(
      'Digite pelo menos 2 caracteres para buscar uma cidade.',
    );
    expect(inputs[1]).not.toHaveAttribute('aria-describedby');
  });
});

import { act, cleanup, fireEvent, render, screen } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import App from '../../src/App';
import { MOCK_WEATHER } from '../../src/mocks/weather';

beforeEach(() => {
  vi.useFakeTimers({ toFake: ['setTimeout', 'clearTimeout'] });
});

afterEach(() => {
  cleanup();
  vi.useRealTimers();
});

async function finishLoading() {
  await act(async () => {
    await vi.advanceTimersByTimeAsync(600);
  });
}

describe('App mockado', () => {
  it('inicia com marca, busca, unidade Celsius e orientação sem apresentar dados como atuais', () => {
    render(<App />);
    expect(screen.getByRole('banner')).toBeInTheDocument();
    expect(screen.getByRole('heading', { name: 'SDD Weather' })).toBeInTheDocument();
    expect(screen.getByRole('searchbox', { name: 'Cidade' })).toBeEnabled();
    expect(screen.getByRole('button', { name: '°C' })).toHaveAttribute('aria-pressed', 'true');
    expect(screen.getByRole('main')).toHaveTextContent('Como está o tempo?');
    expect(
      screen.queryByRole('heading', { name: 'Clima atual em Salvador' }),
    ).not.toBeInTheDocument();
    expect(screen.getByRole('contentinfo')).toHaveTextContent('somente dados mockados');
  });

  it('busca Salvador, mostra loading por 600 ms e converte todas as temperaturas sem rede', async () => {
    const fetchSpy = vi.spyOn(globalThis, 'fetch');
    const original = JSON.stringify(MOCK_WEATHER);
    try {
      render(<App />);
      fireEvent.change(screen.getByRole('searchbox'), { target: { value: '  salvador  ' } });
      expect(screen.queryByText('Consultando o exemplo de clima...')).not.toBeInTheDocument();
      fireEvent.submit(screen.getByRole('search'));
      expect(screen.getByRole('status')).toHaveTextContent('Consultando o exemplo de clima...');
      expect(screen.getByRole('searchbox')).toBeDisabled();
      await act(async () => vi.advanceTimersByTimeAsync(599));
      expect(screen.queryByRole('article')).not.toBeInTheDocument();
      await act(async () => vi.advanceTimersByTimeAsync(1));

      expect(screen.getByRole('searchbox')).toBeEnabled();
      expect(screen.getByRole('heading', { name: 'Clima atual em Salvador' })).toBeInTheDocument();
      expect(screen.getAllByRole('article')).toHaveLength(5);
      expect(
        screen.getByText('Não representa o clima atual.', { exact: false }),
      ).toBeInTheDocument();
      fireEvent.click(screen.getByRole('button', { name: '°F' }));
      expect(screen.getAllByText(/°F/).filter((node) => node.tagName !== 'BUTTON')).toHaveLength(
        12,
      );
      expect(screen.queryByText(/°C/, { selector: 'p, dd' })).not.toBeInTheDocument();
      fireEvent.click(screen.getByRole('button', { name: '°C' }));
      expect(screen.getByText('28 °C')).toBeInTheDocument();
      expect(JSON.stringify(MOCK_WEATHER)).toBe(original);
      expect(fetchSpy).not.toHaveBeenCalled();
    } finally {
      fetchSpy.mockRestore();
    }
  });

  it('mantém a busca disponível após estado vazio e permite corrigir a consulta', async () => {
    render(<App />);
    fireEvent.change(screen.getByRole('searchbox'), { target: { value: 'Recife' } });
    fireEvent.click(screen.getByRole('button', { name: 'Buscar' }));
    await finishLoading();
    expect(screen.getByRole('heading', { name: 'Nenhuma cidade encontrada' })).toBeInTheDocument();
    expect(screen.queryByRole('alert')).not.toBeInTheDocument();
    expect(screen.getByRole('searchbox')).toBeEnabled();
    fireEvent.change(screen.getByRole('searchbox'), { target: { value: 'Salvador' } });
    fireEvent.submit(screen.getByRole('search'));
    await finishLoading();
    expect(screen.getAllByRole('article')).toHaveLength(5);
  });

  it('permite explorar todos os estados, cancela loading anterior e preserva unidade no retry', async () => {
    render(<App />);
    const selector = screen.getByRole('combobox', { name: 'Estado da demonstração' });
    fireEvent.click(screen.getByRole('button', { name: '°F' }));
    fireEvent.change(selector, { target: { value: 'loading' } });
    expect(screen.getByRole('status')).toHaveTextContent('Consultando');
    fireEvent.change(selector, { target: { value: 'error' } });
    await finishLoading();
    expect(screen.getByRole('alert')).toHaveTextContent('Falha simulada');
    expect(screen.queryByRole('article')).not.toBeInTheDocument();
    fireEvent.click(screen.getByRole('button', { name: 'Tentar novamente' }));
    expect(screen.queryByRole('alert')).not.toBeInTheDocument();
    await finishLoading();
    expect(screen.getByText('83 °F')).toBeInTheDocument();
    fireEvent.change(selector, { target: { value: 'empty' } });
    expect(screen.getByRole('heading', { name: 'Nenhuma cidade encontrada' })).toBeInTheDocument();
    fireEvent.change(selector, { target: { value: 'idle' } });
    expect(screen.getByRole('heading', { name: 'Como está o tempo?' })).toBeInTheDocument();
    fireEvent.change(selector, { target: { value: 'success' } });
    expect(screen.getByText('83 °F')).toBeInTheDocument();
  });

  it('remove o timer ao desmontar enquanto carrega', () => {
    const { unmount } = render(<App />);
    fireEvent.change(screen.getByRole('combobox'), { target: { value: 'loading' } });
    expect(vi.getTimerCount()).toBeGreaterThan(0);
    unmount();
    expect(vi.getTimerCount()).toBe(0);
  });
});

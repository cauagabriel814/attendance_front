import { describe, it, expect, vi } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { AuthProvider } from '../../contexts/AuthContext';
import EmployeeLoginPage from './LoginPage';

// Mock do roteamento
const mockNavigate = vi.fn();
vi.mock('react-router-dom', async (importOriginal) => {
  const actual = await importOriginal<typeof import('react-router-dom')>();
  return { ...actual, useNavigate: () => mockNavigate };
});

function renderPage() {
  const qc = new QueryClient({ defaultOptions: { queries: { retry: false } } });
  return render(
    <QueryClientProvider client={qc}>
      <AuthProvider>
        <MemoryRouter>
          <EmployeeLoginPage />
        </MemoryRouter>
      </AuthProvider>
    </QueryClientProvider>,
  );
}

describe('EmployeeLoginPage', () => {
  it('renderiza os campos de e-mail e senha', () => {
    renderPage();
    expect(screen.getByLabelText(/e-mail/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/senha/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /entrar/i })).toBeInTheDocument();
  });

  it('exibe erros de validação para campos vazios', async () => {
    renderPage();
    await userEvent.click(screen.getByRole('button', { name: /entrar/i }));
    await waitFor(() => {
      expect(screen.getAllByRole('alert').length).toBeGreaterThan(0);
    });
  });

  it('exibe erro para e-mail inválido', async () => {
    renderPage();
    await userEvent.type(screen.getByLabelText(/e-mail/i), 'email-invalido');
    await userEvent.click(screen.getByRole('button', { name: /entrar/i }));
    await waitFor(() => {
      expect(screen.getByText(/e-mail inválido/i)).toBeInTheDocument();
    });
  });

  it('navega para /ponto após login bem-sucedido (MSW mock)', async () => {
    renderPage();
    await userEvent.type(screen.getByLabelText(/e-mail/i), 'maria@teste.com');
    await userEvent.type(screen.getByLabelText(/senha/i), 'SenhaForte@123');
    await userEvent.click(screen.getByRole('button', { name: /entrar/i }));
    await waitFor(() => {
      expect(mockNavigate).toHaveBeenCalledWith('/ponto');
    });
  });
});

import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { MemoryRouter, Routes, Route } from 'react-router-dom';
import { AuthProvider } from '../contexts/AuthContext';
import { ProtectedRoute } from './ProtectedRoute';

// Mock de AuthContext para controlar o estado
vi.mock('../contexts/AuthContext', async (importOriginal) => {
  const actual = await importOriginal<typeof import('../contexts/AuthContext')>();
  return { ...actual };
});

function renderWithRoute(
  isAuthenticated: boolean,
  userType: 'company' | 'employee' | null,
  allowedType: 'company' | 'employee',
) {
  // Injeta diretamente no localStorage para simular estado de auth
  if (isAuthenticated && userType) {
    localStorage.setItem('accessToken', 'tok');
    localStorage.setItem('userType', userType);
    if (userType === 'company') {
      localStorage.setItem(
        'companyData',
        JSON.stringify({ id: 'c1', email: 'e@e.com', ownerName: 'J', allowOvertime: false, maxEmployees: 5, emailVerified: true, isActive: true, createdAt: '' }),
      );
    } else {
      localStorage.setItem(
        'employeeData',
        JSON.stringify({ id: 'e1', name: 'M', email: 'm@m.com', entryTime: '08:00', exitTime: '17:00', role: 'Dev', overtimeAllowed: false, lateToleranceAllowed: false }),
      );
    }
  } else {
    localStorage.clear();
  }

  return render(
    <AuthProvider>
      <MemoryRouter initialEntries={['/protegido']}>
        <Routes>
          <Route path="/login" element={<div>Login Page</div>} />
          <Route path="/ponto" element={<div>Ponto Page</div>} />
          <Route path="/admin/dashboard" element={<div>Admin Dashboard</div>} />
          <Route element={<ProtectedRoute allowedType={allowedType} />}>
            <Route path="/protegido" element={<div>Conteúdo Protegido</div>} />
          </Route>
        </Routes>
      </MemoryRouter>
    </AuthProvider>,
  );
}

describe('ProtectedRoute', () => {
  afterEach(() => localStorage.clear());

  it('redireciona para login quando não autenticado', () => {
    renderWithRoute(false, null, 'employee');
    expect(screen.getByText('Login Page')).toBeInTheDocument();
  });

  it('exibe conteúdo quando autenticado com tipo correto', () => {
    renderWithRoute(true, 'employee', 'employee');
    expect(screen.getByText('Conteúdo Protegido')).toBeInTheDocument();
  });

  it('redireciona para dashboard admin quando employee tenta acessar rota company', () => {
    renderWithRoute(true, 'employee', 'company');
    expect(screen.getByText('Ponto Page')).toBeInTheDocument();
  });
});

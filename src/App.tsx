import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { AuthProvider } from './contexts/AuthContext';
import { ProtectedRoute } from './components/ProtectedRoute';

// Páginas públicas
import EmployeeLoginPage from './pages/employee/LoginPage';
import EmployeeVerifyEmailPage from './pages/employee/VerifyEmailPage';
import AdminLoginPage from './pages/admin/LoginPage';
import AdminRegisterPage from './pages/admin/RegisterPage';

// Páginas do funcionário (protegidas)
import PontoPage from './pages/employee/PontoPage';

// Páginas admin (protegidas)
import AdminLayout from './pages/admin/AdminLayout';
import DashboardPage from './pages/admin/DashboardPage';
import EmployeesPage from './pages/admin/EmployeesPage';
import RolesPage from './pages/admin/RolesPage';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      staleTime: 30_000,
    },
  },
});

export default function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <BrowserRouter>
          <Routes>
            {/* Página raiz → login do funcionário */}
            <Route path="/" element={<Navigate to="/login" replace />} />

            {/* Portal do funcionário — públicas */}
            <Route path="/login" element={<EmployeeLoginPage />} />
            <Route path="/funcionario/verificar-email" element={<EmployeeVerifyEmailPage />} />

            {/* Portal do funcionário — protegidas */}
            <Route element={<ProtectedRoute allowedType="employee" />}>
              <Route path="/ponto" element={<PontoPage />} />
            </Route>

            {/* Portal admin — públicas */}
            <Route path="/admin/login" element={<AdminLoginPage />} />
            <Route path="/admin/cadastro" element={<AdminRegisterPage />} />
            <Route path="/empresa/verificar-email" element={<EmployeeVerifyEmailPage />} />

            {/* Portal admin — protegidas */}
            <Route element={<ProtectedRoute allowedType="company" redirectTo="/admin/login" />}>
              <Route element={<AdminLayout />}>
                <Route path="/admin/dashboard" element={<DashboardPage />} />
                <Route path="/admin/funcionarios" element={<EmployeesPage />} />
                <Route path="/admin/cargos" element={<RolesPage />} />
              </Route>
            </Route>

            {/* 404 → login */}
            <Route path="*" element={<Navigate to="/login" replace />} />
          </Routes>
        </BrowserRouter>
      </AuthProvider>
    </QueryClientProvider>
  );
}

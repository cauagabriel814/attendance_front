import { createContext, useContext, useState, useCallback, type ReactNode } from 'react';
import { clearSession } from '../api/client';
import type { CompanyProfile, EmployeeProfile } from '../types';

// ─── Tipos ────────────────────────────────────────────────────────────────────

interface AuthState {
  userType: 'company' | 'employee' | null;
  company: CompanyProfile | null;
  employee: EmployeeProfile | null;
  isAuthenticated: boolean;
}

interface AuthContextValue extends AuthState {
  loginAsCompany: (tokens: { accessToken: string; refreshToken: string }, profile: CompanyProfile) => void;
  loginAsEmployee: (tokens: { accessToken: string; refreshToken: string }, profile: EmployeeProfile) => void;
  logout: () => void;
}

// ─── Context ──────────────────────────────────────────────────────────────────

const AuthContext = createContext<AuthContextValue | null>(null);

// ─── Helpers de persistência ──────────────────────────────────────────────────

function loadInitialState(): AuthState {
  const userType = localStorage.getItem('userType') as 'company' | 'employee' | null;
  if (!userType || !localStorage.getItem('accessToken')) {
    return { userType: null, company: null, employee: null, isAuthenticated: false };
  }

  try {
    const company =
      userType === 'company'
        ? (JSON.parse(localStorage.getItem('companyData') ?? 'null') as CompanyProfile | null)
        : null;
    const employee =
      userType === 'employee'
        ? (JSON.parse(localStorage.getItem('employeeData') ?? 'null') as EmployeeProfile | null)
        : null;

    return { userType, company, employee, isAuthenticated: true };
  } catch {
    return { userType: null, company: null, employee: null, isAuthenticated: false };
  }
}

// ─── Provider ─────────────────────────────────────────────────────────────────

export function AuthProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<AuthState>(loadInitialState);

  const loginAsCompany = useCallback(
    (tokens: { accessToken: string; refreshToken: string }, profile: CompanyProfile) => {
      localStorage.setItem('accessToken', tokens.accessToken);
      localStorage.setItem('refreshToken', tokens.refreshToken);
      localStorage.setItem('userType', 'company');
      localStorage.setItem('companyData', JSON.stringify(profile));
      setState({ userType: 'company', company: profile, employee: null, isAuthenticated: true });
    },
    [],
  );

  const loginAsEmployee = useCallback(
    (tokens: { accessToken: string; refreshToken: string }, profile: EmployeeProfile) => {
      localStorage.setItem('accessToken', tokens.accessToken);
      localStorage.setItem('refreshToken', tokens.refreshToken);
      localStorage.setItem('userType', 'employee');
      localStorage.setItem('employeeData', JSON.stringify(profile));
      setState({ userType: 'employee', company: null, employee: profile, isAuthenticated: true });
    },
    [],
  );

  const logout = useCallback(() => {
    clearSession();
    setState({ userType: null, company: null, employee: null, isAuthenticated: false });
  }, []);

  return (
    <AuthContext.Provider value={{ ...state, loginAsCompany, loginAsEmployee, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

// ─── Hook ─────────────────────────────────────────────────────────────────────

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth deve ser usado dentro de AuthProvider');
  return ctx;
}

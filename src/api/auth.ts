import { api } from './client';
import type { AuthTokens, CompanyProfile, EmployeeProfile } from '../types';

// ─── Company Auth ─────────────────────────────────────────────────────────────

export interface RegisterCompanyPayload {
  email: string;
  ownerName: string;
  cnpj: string;
  ownerBirthDate: string;
  allowOvertime: boolean;
  maxOvertimeHours?: number;
  maxEmployees: number;
  password: string;
}

export const companyApi = {
  register: (data: RegisterCompanyPayload) =>
    api.post<{ message: string; companyId: string }>('/companies/register', data),

  verifyEmail: (token: string) =>
    api.post<{ message: string }>('/companies/verify-email', { token }),

  login: (email: string, password: string) =>
    api.post<AuthTokens & { company: CompanyProfile }>('/companies/login', { email, password }),

  logout: () => api.post('/companies/logout'),

  me: () => api.get<CompanyProfile>('/companies/me'),
};

// ─── Employee Auth ────────────────────────────────────────────────────────────

export const employeeApi = {
  verifyEmail: (token: string) =>
    api.post<{ message: string }>('/employees/verify-email', { token }),

  login: (email: string, password: string) =>
    api.post<AuthTokens & { employee: EmployeeProfile }>('/employees/login', { email, password }),

  logout: () => api.post('/employees/logout'),

  me: (id: string) => api.get<EmployeeProfile>(`/employees/${id}`),
};

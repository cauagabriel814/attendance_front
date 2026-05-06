import { api } from './client';
import type { Employee, Role, DashboardData } from '../types';

// ─── Employees (admin) ────────────────────────────────────────────────────────

export interface CreateEmployeePayload {
  name: string;
  email: string;
  cpf: string;
  birthDate: string;
  roleId: string;
  entryTime: string;
  exitTime: string;
  lateToleranceAllowed: boolean;
  overtimeAllowed: boolean;
  password: string;
}

export const employeesApi = {
  list: () => api.get<Employee[]>('/employees'),

  create: (data: CreateEmployeePayload) =>
    api.post<{ message: string; employeeId: string }>('/employees', data),

  deactivate: (id: string) => api.delete(`/employees/${id}`),
};

// ─── Roles ────────────────────────────────────────────────────────────────────

export const rolesApi = {
  list: () => api.get<Role[]>('/roles'),

  create: (name: string, permissions: string[] = []) =>
    api.post<Role>('/roles', { name, permissions }),

  update: (id: string, data: { name?: string; permissions?: string[] }) =>
    api.patch<Role>(`/roles/${id}`, data),

  remove: (id: string) => api.delete<{ message: string }>(`/roles/${id}`),
};

// ─── Dashboard ────────────────────────────────────────────────────────────────

export const dashboardApi = {
  getMetrics: (period: 'today' | 'week' | 'month' = 'month') =>
    api.get<DashboardData>('/dashboard', { params: { period } }),
};

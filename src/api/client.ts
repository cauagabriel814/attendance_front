import axios, { AxiosError } from 'axios';

const BASE_URL = import.meta.env.VITE_API_URL ?? 'http://localhost:3000/api/v1';

export const api = axios.create({
  baseURL: BASE_URL,
  headers: { 'Content-Type': 'application/json' },
});

// ─── Interceptor de request: injeta o access token ───────────────────────────
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('accessToken');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// ─── Interceptor de response: renova o token automaticamente ─────────────────
let isRefreshing = false;
let pendingRequests: Array<(token: string) => void> = [];

api.interceptors.response.use(
  (response) => response,
  async (error: AxiosError) => {
    const original = error.config as typeof error.config & { _retry?: boolean };

    // Endpoints de login não devem acionar o fluxo de refresh — propaga o erro direto
    const isLoginEndpoint = original?.url?.includes('/login');

    if (error.response?.status === 401 && !original?._retry && !isLoginEndpoint) {
      const refreshToken = localStorage.getItem('refreshToken');
      const userType = localStorage.getItem('userType'); // 'company' | 'employee'

      if (!refreshToken || !userType) {
        clearSession();
        window.location.href = '/login';
        return Promise.reject(error);
      }

      if (isRefreshing) {
        return new Promise((resolve) => {
          pendingRequests.push((token) => {
            if (original) original.headers!.Authorization = `Bearer ${token}`;
            resolve(api(original!));
          });
        });
      }

      original!._retry = true;
      isRefreshing = true;

      try {
        const endpoint =
          userType === 'company' ? '/companies/refresh' : '/employees/refresh';

        const { data } = await api.post<{ accessToken: string; refreshToken: string }>(
          endpoint,
          {},
          { headers: { Authorization: `Bearer ${refreshToken}` } },
        );

        localStorage.setItem('accessToken', data.accessToken);
        localStorage.setItem('refreshToken', data.refreshToken);

        pendingRequests.forEach((cb) => cb(data.accessToken));
        pendingRequests = [];

        original!.headers!.Authorization = `Bearer ${data.accessToken}`;
        return api(original!);
      } catch {
        clearSession();
        window.location.href = '/login';
        return Promise.reject(error);
      } finally {
        isRefreshing = false;
      }
    }

    return Promise.reject(error);
  },
);

export function clearSession() {
  localStorage.removeItem('accessToken');
  localStorage.removeItem('refreshToken');
  localStorage.removeItem('userType');
  localStorage.removeItem('companyData');
  localStorage.removeItem('employeeData');
}

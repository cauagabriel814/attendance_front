import { api } from './client';
import type { TodayStatus, AttendanceRecord, PaginatedResponse, MonthlySummary } from '../types';

export const attendanceApi = {
  todayStatus: () => api.get<TodayStatus>('/attendance/today'),

  checkIn: () => api.post('/attendance/check-in'),

  checkOut: () => api.post('/attendance/check-out'),

  myHistory: (page = 1, limit = 30) =>
    api.get<PaginatedResponse<AttendanceRecord>>('/attendance/my-history', {
      params: { page, limit },
    }),

  monthlySummary: () => api.get<MonthlySummary>('/attendance/monthly-summary'),
};

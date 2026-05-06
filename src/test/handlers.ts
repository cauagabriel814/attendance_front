import { http, HttpResponse } from 'msw';

const API = 'http://localhost:3000/api/v1';

export const handlers = [
  // ─── Companies ──────────────────────────────────────────────────────────
  http.post(`${API}/companies/register`, () =>
    HttpResponse.json({
      message: 'Empresa cadastrada. Verifique seu e-mail para ativar a conta.',
      companyId: 'company-mock-uuid',
    }, { status: 201 }),
  ),

  http.post(`${API}/companies/verify-email`, () =>
    HttpResponse.json({ message: 'E-mail verificado com sucesso.' }),
  ),

  http.post(`${API}/companies/login`, () =>
    HttpResponse.json({
      accessToken: 'mock-access-token',
      refreshToken: 'mock-refresh-token',
      company: {
        id: 'company-mock-uuid',
        email: 'empresa@teste.com',
        ownerName: 'João Silva',
        allowOvertime: false,
        maxEmployees: 10,
      },
    }),
  ),

  http.post(`${API}/companies/logout`, () =>
    HttpResponse.json({ message: 'Logout realizado com sucesso' }),
  ),

  http.get(`${API}/companies/me`, () =>
    HttpResponse.json({
      id: 'company-mock-uuid',
      email: 'empresa@teste.com',
      ownerName: 'João Silva',
      allowOvertime: false,
      maxEmployees: 10,
      emailVerified: true,
      isActive: true,
      createdAt: new Date().toISOString(),
      _count: { employees: 3 },
    }),
  ),

  // ─── Employees ──────────────────────────────────────────────────────────
  http.post(`${API}/employees/login`, () =>
    HttpResponse.json({
      accessToken: 'mock-emp-access-token',
      refreshToken: 'mock-emp-refresh-token',
      employee: {
        id: 'employee-mock-uuid',
        name: 'Maria Souza',
        email: 'maria@teste.com',
        entryTime: '08:00',
        exitTime: '17:00',
        role: 'Desenvolvedor',
        overtimeAllowed: false,
        lateToleranceAllowed: false,
      },
    }),
  ),

  http.post(`${API}/employees/verify-email`, () =>
    HttpResponse.json({ message: 'E-mail verificado com sucesso.' }),
  ),

  http.post(`${API}/employees/logout`, () =>
    HttpResponse.json({ message: 'Logout realizado com sucesso' }),
  ),

  http.get(`${API}/employees`, () =>
    HttpResponse.json([
      {
        id: 'employee-mock-uuid',
        name: 'Maria Souza',
        email: 'maria@teste.com',
        cpf: '***.***789-**',
        entryTime: '08:00',
        exitTime: '17:00',
        isActive: true,
        lateToleranceAllowed: false,
        overtimeAllowed: false,
        createdAt: new Date().toISOString(),
        role: { id: 'role-uuid', name: 'Desenvolvedor' },
      },
    ]),
  ),

  // ─── Roles ──────────────────────────────────────────────────────────────
  http.get(`${API}/roles`, () =>
    HttpResponse.json([
      {
        id: 'role-mock-uuid',
        name: 'Desenvolvedor',
        permissions: ['view_dashboard'],
        createdAt: new Date().toISOString(),
        _count: { employees: 1 },
      },
    ]),
  ),

  http.post(`${API}/roles`, () =>
    HttpResponse.json({
      id: 'role-new-uuid',
      name: 'Novo Cargo',
      permissions: [],
      createdAt: new Date().toISOString(),
    }, { status: 201 }),
  ),

  // ─── Attendance ─────────────────────────────────────────────────────────
  http.get(`${API}/attendance/today`, () =>
    HttpResponse.json({
      today: new Date().toISOString().split('T')[0],
      scheduledEntry: '08:00',
      scheduledExit: '17:00',
      checkIn: null,
      checkOut: null,
      status: null,
      minutesLate: 0,
      overtimeMinutes: 0,
    }),
  ),

  http.post(`${API}/attendance/check-in`, () =>
    HttpResponse.json({
      message: 'Check-in registrado com sucesso',
      checkIn: new Date().toISOString(),
      status: 'ON_TIME',
      minutesLate: 0,
      scheduledEntry: '08:00',
    }),
  ),

  http.post(`${API}/attendance/check-out`, () =>
    HttpResponse.json({
      message: 'Check-out registrado com sucesso',
      checkIn: new Date().toISOString(),
      checkOut: new Date().toISOString(),
      status: 'ON_TIME',
      minutesLate: 0,
      overtimeMinutes: 0,
      scheduledExit: '17:00',
    }),
  ),

  http.get(`${API}/attendance/my-history`, () =>
    HttpResponse.json({
      data: [
        {
          id: 'record-uuid',
          date: new Date().toISOString(),
          checkIn: '2024-01-15T08:02:00.000Z',
          checkOut: '2024-01-15T17:01:00.000Z',
          status: 'ON_TIME',
          minutesLate: 0,
          overtimeMinutes: 0,
        },
      ],
      meta: { total: 1, page: 1, limit: 30, totalPages: 1 },
    }),
  ),

  // ─── Dashboard ──────────────────────────────────────────────────────────
  http.get(`${API}/dashboard`, () =>
    HttpResponse.json({
      period: 'month',
      periodStart: '2024-01-01',
      periodEnd: '2024-01-31',
      summary: {
        totalActiveEmployees: 5,
        presentToday: 4,
        absentToday: 1,
        onTimeToday: 3,
        lateToday: 1,
        overtimeToday: 0,
        totalOvertimeHours: 2.5,
        avgLateMinutes: 8.3,
      },
      rankings: {
        mostPunctual: [
          { employeeId: 'e1', name: 'Ana', onTimeCount: 20, totalDays: 20, punctualityRate: 100 },
        ],
        mostLate: [
          { employeeId: 'e2', name: 'Bob', lateCount: 3, totalLateMinutes: 45, avgLateMinutes: 15 },
        ],
      },
      overtimeByEmployee: [],
      dailyTrend: [
        { date: '2024-01-15', present: 4, absent: 1, late: 1, onTime: 3, overtime: 0 },
      ],
    }),
  ),
];

// ─── Auth ────────────────────────────────────────────────────────────────────

export interface AuthTokens {
  accessToken: string;
  refreshToken: string;
}

export interface CompanyProfile {
  id: string;
  email: string;
  ownerName: string;
  allowOvertime: boolean;
  maxEmployees: number;
  emailVerified: boolean;
  isActive: boolean;
  createdAt: string;
  _count?: { employees: number };
}

export interface EmployeeProfile {
  id: string;
  name: string;
  email: string;
  entryTime: string;
  exitTime: string;
  role: string;
  overtimeAllowed: boolean;
  lateToleranceAllowed: boolean;
  cpf?: string;
  birthDate?: string;
  isActive?: boolean;
  createdAt?: string;
}

// ─── Attendance ───────────────────────────────────────────────────────────────

export type AttendanceStatus = 'ON_TIME' | 'LATE' | 'ABSENT' | 'OVERTIME' | 'PRESENT' | null;

export interface TodayStatus {
  today: string;
  scheduledEntry: string;
  scheduledExit: string;
  checkIn: string | null;
  checkOut: string | null;
  status: AttendanceStatus;
  minutesLate: number;
  overtimeMinutes: number;
}

export interface AttendanceRecord {
  id: string;
  date: string;
  checkIn: string | null;
  checkOut: string | null;
  status: AttendanceStatus;
  minutesLate: number;
  overtimeMinutes: number;
}

export interface PaginatedResponse<T> {
  data: T[];
  meta: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
}

export interface MonthlySummary {
  workedHours: number;
  scheduledHours: number;
  workedDays: number;
}

// ─── Roles ────────────────────────────────────────────────────────────────────

export interface Role {
  id: string;
  name: string;
  permissions: string[];
  createdAt: string;
  _count?: { employees: number };
}

// ─── Employees ───────────────────────────────────────────────────────────────

export interface Employee {
  id: string;
  name: string;
  email: string;
  cpf: string;
  entryTime: string;
  exitTime: string;
  isActive: boolean;
  lateToleranceAllowed: boolean;
  overtimeAllowed: boolean;
  createdAt: string;
  role: { id: string; name: string };
}

// ─── Dashboard ────────────────────────────────────────────────────────────────

export interface DashboardSummary {
  totalActiveEmployees: number;
  presentToday: number;
  absentToday: number;
  onTimeToday: number;
  lateToday: number;
  overtimeToday: number;
  totalOvertimeHours: number;
  avgLateMinutes: number;
}

export interface RankingEntry {
  employeeId: string;
  name: string;
  onTimeCount?: number;
  totalDays?: number;
  punctualityRate?: number;
  lateCount?: number;
  totalLateMinutes?: number;
  avgLateMinutes?: number;
}

export interface OvertimeEntry {
  employeeId: string;
  name: string;
  overtimeMinutes: number;
  overtimeHours: number;
}

export interface DailyTrendEntry {
  date: string;
  present: number;
  absent: number;
  late: number;
  onTime: number;
  overtime: number;
}

export interface ComplianceEmployee {
  employeeId: string;
  name: string;
  overtimeHours: number;
  exceeded: boolean;
}

export interface ComplianceReport {
  maxOvertimeHours: number | null;
  employees: ComplianceEmployee[];
}

export interface DashboardData {
  period: 'today' | 'week' | 'month';
  periodStart: string;
  periodEnd: string;
  summary: DashboardSummary;
  rankings: {
    mostPunctual: RankingEntry[];
    mostLate: RankingEntry[];
  };
  overtimeByEmployee: OvertimeEntry[];
  complianceReport: ComplianceReport;
  dailyTrend: DailyTrendEntry[];
}

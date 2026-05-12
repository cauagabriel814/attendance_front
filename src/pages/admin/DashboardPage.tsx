import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Legend,
  PieChart, Pie, Cell,
} from 'recharts';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { dashboardApi } from '../../api/company';
import type { DashboardData } from '../../types';

type Period = 'today' | 'week' | 'month';

const PERIOD_LABELS: Record<Period, string> = {
  today: 'Hoje',
  week: 'Últimos 7 dias',
  month: 'Este mês',
};

const PIE_COLORS = ['#22c55e', '#ef4444', '#f59e0b'];

function StatCard({ label, value, color = 'text-gray-900' }: { label: string; value: number | string; color?: string }) {
  return (
    <div className="bg-white rounded-2xl shadow-sm p-5">
      <p className="text-xs text-gray-500 mb-1">{label}</p>
      <p className={`text-2xl font-bold ${color}`}>{value}</p>
    </div>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="bg-white rounded-2xl shadow-sm p-6">
      <h3 className="text-sm font-semibold text-gray-700 mb-4">{title}</h3>
      {children}
    </div>
  );
}

export default function DashboardPage() {
  const [period, setPeriod] = useState<Period>('month');

  const { data, isLoading } = useQuery<DashboardData>({
    queryKey: ['dashboard', period],
    queryFn: () => dashboardApi.getMetrics(period).then((r) => r.data),
  });

  if (isLoading || !data) {
    return (
      <div className="flex justify-center items-center py-24">
        <div className="animate-spin w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full" />
      </div>
    );
  }

  const { summary, rankings, overtimeByEmployee, complianceReport, dailyTrend } = data;

  // Dados para o gráfico de pizza
  const pieData = [
    { name: 'No horário', value: summary.onTimeToday },
    { name: 'Ausentes', value: summary.absentToday },
    { name: 'Atrasados', value: summary.lateToday },
  ];

  // Formata as datas do trend para exibição no gráfico
  const trendData = dailyTrend.map((d) => ({
    ...d,
    dateLabel: format(new Date(d.date + 'T12:00:00'), 'dd/MM', { locale: ptBR }),
  }));

  return (
    <div className="p-6 max-w-6xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-bold text-gray-900">Dashboard</h2>
        <div className="flex gap-2">
          {(Object.entries(PERIOD_LABELS) as [Period, string][]).map(([p, label]) => (
            <button
              key={p}
              onClick={() => setPeriod(p)}
              className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                period === p
                  ? 'bg-blue-600 text-white'
                  : 'bg-white text-gray-600 hover:bg-gray-50 border'
              }`}
            >
              {label}
            </button>
          ))}
        </div>
      </div>

      {/* Cards de resumo */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <StatCard label="Funcionários ativos" value={summary.totalActiveEmployees} />
        <StatCard label="Presentes hoje" value={summary.presentToday} color="text-green-600" />
        <StatCard label="Ausentes hoje" value={summary.absentToday} color="text-red-600" />
        <StatCard label="Atrasados hoje" value={summary.lateToday} color="text-yellow-600" />
        <StatCard label="Horas extras (período)" value={`${summary.totalOvertimeHours}h`} color="text-orange-600" />
        <StatCard label="Média de atraso" value={`${summary.avgLateMinutes} min`} />
        <StatCard label="No horário hoje" value={summary.onTimeToday} color="text-blue-600" />
        <StatCard label="Com hora extra hoje" value={summary.overtimeToday} color="text-purple-600" />
      </div>

      {/* Gráficos */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Gráfico de barras: presença diária — ocupa 2/3 */}
        <div className="lg:col-span-2">
          <Section title="Presença diária">
            <ResponsiveContainer width="100%" height={220}>
              <BarChart data={trendData} margin={{ top: 0, right: 0, bottom: 0, left: -20 }}>
                <XAxis dataKey="dateLabel" tick={{ fontSize: 11 }} />
                <YAxis tick={{ fontSize: 11 }} allowDecimals={false} />
                <Tooltip />
                <Legend iconSize={10} wrapperStyle={{ fontSize: 12 }} />
                <Bar dataKey="present" name="Presentes" fill="#22c55e" radius={[4, 4, 0, 0]} />
                <Bar dataKey="absent" name="Ausentes" fill="#ef4444" radius={[4, 4, 0, 0]} />
                <Bar dataKey="late" name="Atrasados" fill="#f59e0b" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </Section>
        </div>

        {/* Gráfico de pizza: distribuição do dia — ocupa 1/3 */}
        <Section title="Distribuição hoje">
          <ResponsiveContainer width="100%" height={200}>
            <PieChart>
              <Pie
                data={pieData}
                cx="50%"
                cy="50%"
                innerRadius={50}
                outerRadius={75}
                paddingAngle={3}
                dataKey="value"
              >
                {pieData.map((_, index) => (
                  <Cell key={index} fill={PIE_COLORS[index % PIE_COLORS.length]} />
                ))}
              </Pie>
              <Tooltip />
              <Legend
                iconSize={10}
                iconType="circle"
                wrapperStyle={{ fontSize: 12 }}
                formatter={(value) => value}
              />
            </PieChart>
          </ResponsiveContainer>
        </Section>
      </div>

      {/* Rankings */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
        <Section title="Top 5 mais pontuais">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-xs text-gray-400">
                <th className="text-left pb-2">#</th>
                <th className="text-left pb-2">Nome</th>
                <th className="text-right pb-2">Pontualidade</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {rankings.mostPunctual.map((r, i) => (
                <tr key={r.employeeId}>
                  <td className="py-2 text-gray-400">{i + 1}</td>
                  <td className="py-2 font-medium text-gray-800">{r.name}</td>
                  <td className="py-2 text-right text-green-600">{r.punctualityRate}%</td>
                </tr>
              ))}
              {rankings.mostPunctual.length === 0 && (
                <tr><td colSpan={3} className="py-4 text-center text-gray-400 text-xs">Sem dados</td></tr>
              )}
            </tbody>
          </table>
        </Section>

        <Section title="Top 5 mais atrasados">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-xs text-gray-400">
                <th className="text-left pb-2">#</th>
                <th className="text-left pb-2">Nome</th>
                <th className="text-right pb-2">Total atrasado</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {rankings.mostLate.map((r, i) => (
                <tr key={r.employeeId}>
                  <td className="py-2 text-gray-400">{i + 1}</td>
                  <td className="py-2 font-medium text-gray-800">{r.name}</td>
                  <td className="py-2 text-right text-red-500">{r.totalLateMinutes} min</td>
                </tr>
              ))}
              {rankings.mostLate.length === 0 && (
                <tr><td colSpan={3} className="py-4 text-center text-gray-400 text-xs">Sem dados</td></tr>
              )}
            </tbody>
          </table>
        </Section>
      </div>

      {/* Horas extras por funcionário */}
      {overtimeByEmployee.length > 0 && (
        <Section title="Horas extras por funcionário (período)">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-xs text-gray-400">
                <th className="text-left pb-2">Nome</th>
                <th className="text-right pb-2">Horas extras</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {overtimeByEmployee.map((emp) => (
                <tr key={emp.employeeId}>
                  <td className="py-2 font-medium text-gray-800">{emp.name}</td>
                  <td className="py-2 text-right text-orange-600">{emp.overtimeHours}h</td>
                </tr>
              ))}
            </tbody>
          </table>
        </Section>
      )}

      {/* Conformidade de Jornada */}
      {complianceReport.employees.length > 0 && (
        <Section title="Conformidade de Jornada">
          {complianceReport.maxOvertimeHours !== null && (
            <p className="text-xs text-gray-500 mb-3">
              Limite da empresa:{' '}
              <span className="font-semibold">{complianceReport.maxOvertimeHours}h</span>{' '}
              de hora extra no período
            </p>
          )}
          <table className="w-full text-sm">
            <thead>
              <tr className="text-xs text-gray-400">
                <th className="text-left pb-2">Funcionário</th>
                <th className="text-right pb-2">Horas extras</th>
                <th className="text-right pb-2">Situação</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {complianceReport.employees.map((emp) => (
                <tr key={emp.employeeId}>
                  <td className="py-2 font-medium text-gray-800">{emp.name}</td>
                  <td className="py-2 text-right text-orange-600">{emp.overtimeHours}h</td>
                  <td className="py-2 text-right">
                    {emp.exceeded ? (
                      <span className="text-red-600 font-medium">Limite excedido</span>
                    ) : (
                      <span className="text-green-600">Dentro do limite</span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </Section>
      )}
    </div>
  );
}

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { attendanceApi } from '../../api/attendance';
import { useAuth } from '../../contexts/AuthContext';
import { employeeApi } from '../../api/auth';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';

const STATUS_LABEL: Record<string, { label: string; color: string }> = {
  ON_TIME: { label: 'No horário', color: 'text-green-600 bg-green-50' },
  LATE: { label: 'Atrasado', color: 'text-yellow-600 bg-yellow-50' },
  OVERTIME: { label: 'Hora extra', color: 'text-orange-600 bg-orange-50' },
  ABSENT: { label: 'Ausente', color: 'text-red-600 bg-red-50' },
  PRESENT: { label: 'Presente', color: 'text-blue-600 bg-blue-50' },
};

export default function PontoPage() {
  const { logout, employee } = useAuth();
  const queryClient = useQueryClient();

  const { data: today, isLoading } = useQuery({
    queryKey: ['today-status'],
    queryFn: () => attendanceApi.todayStatus().then((r) => r.data),
    refetchInterval: 30_000, // atualiza a cada 30s
  });

  const { data: summary } = useQuery({
    queryKey: ['monthly-summary'],
    queryFn: () => attendanceApi.monthlySummary().then((r) => r.data),
    staleTime: 5 * 60_000,
  });

  const checkIn = useMutation({
    mutationFn: () => attendanceApi.checkIn(),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['today-status'] }),
  });

  const checkOut = useMutation({
    mutationFn: () => attendanceApi.checkOut(),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['today-status'] }),
  });

  const handleLogout = async () => {
    try { await employeeApi.logout(); } catch { /* ignora */ }
    logout();
  };

  const nowStr = format(new Date(), "EEEE, d 'de' MMMM 'de' yyyy", { locale: ptBR });

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="animate-spin w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full" />
      </div>
    );
  }

  const statusInfo = today?.status ? STATUS_LABEL[today.status] : null;

  return (
    <div className="min-h-screen bg-gray-50 p-4">
      <header className="max-w-md mx-auto flex items-center justify-between mb-6">
        <div>
          <p className="text-sm text-gray-500">Olá,</p>
          <h1 className="text-lg font-bold text-gray-900">{employee?.name ?? 'Funcionário'}</h1>
        </div>
        <button
          onClick={handleLogout}
          className="text-sm text-gray-500 hover:text-red-500 transition-colors"
        >
          Sair
        </button>
      </header>

      <main className="max-w-md mx-auto space-y-4">
        {/* Data atual */}
        <div className="bg-white rounded-2xl shadow-sm p-6">
          <p className="text-sm text-gray-500 capitalize">{nowStr}</p>
          <div className="mt-3 flex gap-6">
            <div>
              <p className="text-xs text-gray-400">Entrada programada</p>
              <p className="text-lg font-semibold text-gray-900">{today?.scheduledEntry}</p>
            </div>
            <div>
              <p className="text-xs text-gray-400">Saída programada</p>
              <p className="text-lg font-semibold text-gray-900">{today?.scheduledExit}</p>
            </div>
          </div>
        </div>

        {/* Status do dia */}
        {statusInfo && (
          <div className={`rounded-2xl px-6 py-4 ${statusInfo.color}`}>
            <p className="font-medium">{statusInfo.label}</p>
            {(today?.minutesLate ?? 0) > 0 && (
              <p className="text-sm mt-1">{today!.minutesLate} min de atraso</p>
            )}
            {(today?.overtimeMinutes ?? 0) > 0 && (
              <p className="text-sm mt-1">{today!.overtimeMinutes} min extras</p>
            )}
          </div>
        )}

        {/* Registro de ponto */}
        <div className="bg-white rounded-2xl shadow-sm p-6 space-y-4">
          <div className="flex justify-between text-sm">
            <span className="text-gray-500">Check-in</span>
            <span className="font-medium text-gray-900">
              {today?.checkIn
                ? format(new Date(today.checkIn), 'HH:mm')
                : '—'}
            </span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-gray-500">Check-out</span>
            <span className="font-medium text-gray-900">
              {today?.checkOut
                ? format(new Date(today.checkOut), 'HH:mm')
                : '—'}
            </span>
          </div>

          <div className="pt-2 grid grid-cols-2 gap-3">
            <button
              onClick={() => checkIn.mutate()}
              disabled={!!today?.checkIn || checkIn.isPending}
              aria-label="Registrar entrada"
              className="bg-green-600 hover:bg-green-700 disabled:opacity-40 disabled:cursor-not-allowed text-white font-medium rounded-xl py-3 text-sm transition-colors"
            >
              {checkIn.isPending ? 'Registrando...' : 'Registrar Entrada'}
            </button>
            <button
              onClick={() => checkOut.mutate()}
              disabled={!today?.checkIn || !!today?.checkOut || checkOut.isPending}
              aria-label="Registrar saída"
              className="bg-red-600 hover:bg-red-700 disabled:opacity-40 disabled:cursor-not-allowed text-white font-medium rounded-xl py-3 text-sm transition-colors"
            >
              {checkOut.isPending ? 'Registrando...' : 'Registrar Saída'}
            </button>
          </div>
        </div>

        {/* Resumo do mês */}
        {summary && (
          <div className="bg-white rounded-2xl shadow-sm p-6">
            <h2 className="text-sm font-semibold text-gray-700 mb-4">Resumo do mês</h2>
            <div className="grid grid-cols-3 gap-4 text-center">
              <div>
                <p className="text-2xl font-bold text-blue-600">{summary.workedDays}</p>
                <p className="text-xs text-gray-500 mt-1">Dias trabalhados</p>
              </div>
              <div>
                <p className="text-2xl font-bold text-green-600">{summary.workedHours}h</p>
                <p className="text-xs text-gray-500 mt-1">Horas trabalhadas</p>
              </div>
              <div>
                <p className="text-2xl font-bold text-gray-700">{summary.scheduledHours}h</p>
                <p className="text-xs text-gray-500 mt-1">Horas previstas</p>
              </div>
            </div>
          </div>
        )}

        {/* Erros */}
        {checkIn.isError && (
          <p role="alert" className="text-red-600 text-sm bg-red-50 rounded-xl px-4 py-3">
            {(checkIn.error as { response?: { data?: { message?: string } } })?.response?.data?.message ?? 'Erro ao registrar entrada'}
          </p>
        )}
        {checkOut.isError && (
          <p role="alert" className="text-red-600 text-sm bg-red-50 rounded-xl px-4 py-3">
            {(checkOut.error as { response?: { data?: { message?: string } } })?.response?.data?.message ?? 'Erro ao registrar saída'}
          </p>
        )}
      </main>
    </div>
  );
}

import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { employeesApi, rolesApi, type CreateEmployeePayload } from '../../api/company';
import type { Employee } from '../../types';

const schema = z.object({
  name: z.string().min(2, 'Nome é obrigatório'),
  email: z.string().email('E-mail inválido'),
  cpf: z.string().regex(/^\d{3}\.?\d{3}\.?\d{3}-?\d{2}$/, 'CPF inválido'),
  birthDate: z.string().min(1, 'Data de nascimento é obrigatória'),
  roleId: z.string().uuid('Selecione um cargo'),
  entryTime: z.string().regex(/^([01]\d|2[0-3]):[0-5]\d$/, 'Horário inválido (HH:MM)'),
  exitTime: z.string().regex(/^([01]\d|2[0-3]):[0-5]\d$/, 'Horário inválido (HH:MM)'),
  lateToleranceAllowed: z.boolean(),
  overtimeAllowed: z.boolean(),
  password: z.string().min(8, 'Mínimo 8 caracteres'),
});

type FormData = z.infer<typeof schema>;

function StatusBadge({ active }: { active: boolean }) {
  return (
    <span
      className={`inline-block text-xs font-medium px-2 py-0.5 rounded-full ${
        active ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-500'
      }`}
    >
      {active ? 'Ativo' : 'Inativo'}
    </span>
  );
}

export default function EmployeesPage() {
  const queryClient = useQueryClient();
  const [showModal, setShowModal] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const { data: employees = [], isLoading } = useQuery({
    queryKey: ['employees'],
    queryFn: () => employeesApi.list().then((r) => r.data),
  });

  const { data: roles = [] } = useQuery({
    queryKey: ['roles'],
    queryFn: () => rolesApi.list().then((r) => r.data),
  });

  const createMutation = useMutation({
    mutationFn: (data: CreateEmployeePayload) => employeesApi.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['employees'] });
      setShowModal(false);
      setSuccess('Funcionário cadastrado! Um e-mail de boas-vindas foi enviado.');
      reset();
      setTimeout(() => setSuccess(''), 4000);
    },
    onError: (err: unknown) => {
      const msg = (err as { response?: { data?: { message?: string } } })?.response?.data?.message;
      setError(msg ?? 'Erro ao cadastrar funcionário');
    },
  });

  const deactivateMutation = useMutation({
    mutationFn: (id: string) => employeesApi.deactivate(id),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['employees'] }),
  });

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: { lateToleranceAllowed: false, overtimeAllowed: false },
  });

  function onSubmit(data: FormData) {
    setError('');
    createMutation.mutate(data as CreateEmployeePayload);
  }

  return (
    <div className="p-6 max-w-5xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-bold text-gray-900">Funcionários</h2>
        <button
          onClick={() => { setShowModal(true); setError(''); }}
          className="bg-blue-600 text-white rounded-lg px-4 py-2 text-sm font-medium hover:bg-blue-700"
        >
          + Cadastrar funcionário
        </button>
      </div>

      {success && (
        <div className="mb-4 bg-green-50 text-green-700 rounded-lg px-4 py-3 text-sm">
          {success}
        </div>
      )}

      {/* Tabela */}
      {isLoading ? (
        <div className="flex justify-center py-12">
          <div className="animate-spin w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full" />
        </div>
      ) : (
        <div className="bg-white rounded-2xl shadow-sm overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 text-gray-500 text-xs uppercase">
              <tr>
                <th className="px-4 py-3 text-left">Nome</th>
                <th className="px-4 py-3 text-left">E-mail</th>
                <th className="px-4 py-3 text-left">Cargo</th>
                <th className="px-4 py-3 text-left">Entrada</th>
                <th className="px-4 py-3 text-left">Saída</th>
                <th className="px-4 py-3 text-left">Status</th>
                <th className="px-4 py-3" />
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {employees.length === 0 ? (
                <tr>
                  <td colSpan={7} className="text-center py-8 text-gray-400">
                    Nenhum funcionário cadastrado
                  </td>
                </tr>
              ) : (
                employees.map((emp: Employee) => (
                  <tr key={emp.id} className="hover:bg-gray-50">
                    <td className="px-4 py-3 font-medium text-gray-900">{emp.name}</td>
                    <td className="px-4 py-3 text-gray-600">{emp.email}</td>
                    <td className="px-4 py-3 text-gray-600">{emp.role.name}</td>
                    <td className="px-4 py-3 text-gray-600">{emp.entryTime}</td>
                    <td className="px-4 py-3 text-gray-600">{emp.exitTime}</td>
                    <td className="px-4 py-3"><StatusBadge active={emp.isActive} /></td>
                    <td className="px-4 py-3 text-right">
                      {emp.isActive && (
                        <button
                          onClick={() => deactivateMutation.mutate(emp.id)}
                          className="text-red-500 hover:text-red-700 text-xs"
                        >
                          Desativar
                        </button>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      )}

      {/* Modal de cadastro */}
      {showModal && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-lg max-h-[90vh] overflow-y-auto p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-bold text-gray-900">Cadastrar Funcionário</h3>
              <button onClick={() => setShowModal(false)} className="text-gray-400 hover:text-gray-600 text-xl">×</button>
            </div>

            <form onSubmit={handleSubmit(onSubmit)} className="space-y-3" noValidate>
              {[
                { id: 'name', label: 'Nome completo', type: 'text' },
                { id: 'email', label: 'E-mail', type: 'email' },
                { id: 'cpf', label: 'CPF', type: 'text', placeholder: '000.000.000-00' },
                { id: 'birthDate', label: 'Data de nascimento', type: 'date' },
                { id: 'password', label: 'Senha temporária', type: 'password' },
              ].map(({ id, label, type, placeholder }) => (
                <div key={id}>
                  <label htmlFor={id} className="block text-sm font-medium text-gray-700 mb-1">{label}</label>
                  <input
                    id={id}
                    type={type}
                    placeholder={placeholder}
                    className="w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                    {...register(id as keyof FormData)}
                  />
                  {errors[id as keyof FormData] && (
                    <p className="text-red-500 text-xs mt-1">
                      {errors[id as keyof FormData]?.message as string}
                    </p>
                  )}
                </div>
              ))}

              <div>
                <label htmlFor="roleId" className="block text-sm font-medium text-gray-700 mb-1">Cargo</label>
                <select
                  id="roleId"
                  className="w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  {...register('roleId')}
                >
                  <option value="">Selecione um cargo</option>
                  {roles.map((r) => (
                    <option key={r.id} value={r.id}>{r.name}</option>
                  ))}
                </select>
                {errors.roleId && <p className="text-red-500 text-xs mt-1">{errors.roleId.message}</p>}
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label htmlFor="entryTime" className="block text-sm font-medium text-gray-700 mb-1">Horário de entrada</label>
                  <input id="entryTime" type="time" className="w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" {...register('entryTime')} />
                  {errors.entryTime && <p className="text-red-500 text-xs mt-1">{errors.entryTime.message}</p>}
                </div>
                <div>
                  <label htmlFor="exitTime" className="block text-sm font-medium text-gray-700 mb-1">Horário de saída</label>
                  <input id="exitTime" type="time" className="w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" {...register('exitTime')} />
                  {errors.exitTime && <p className="text-red-500 text-xs mt-1">{errors.exitTime.message}</p>}
                </div>
              </div>

              <div className="flex gap-4">
                <label className="flex items-center gap-2 text-sm">
                  <input type="checkbox" {...register('lateToleranceAllowed')} />
                  Tolerância de atraso
                </label>
                <label className="flex items-center gap-2 text-sm">
                  <input type="checkbox" {...register('overtimeAllowed')} />
                  Horas extras
                </label>
              </div>

              {error && (
                <p role="alert" className="text-red-600 text-sm bg-red-50 rounded-lg px-3 py-2">
                  {error}
                </p>
              )}

              <div className="flex gap-3 pt-2">
                <button type="button" onClick={() => setShowModal(false)} className="flex-1 border rounded-lg py-2 text-sm text-gray-700 hover:bg-gray-50">
                  Cancelar
                </button>
                <button type="submit" disabled={isSubmitting} className="flex-1 bg-blue-600 text-white rounded-lg py-2 text-sm font-medium hover:bg-blue-700 disabled:opacity-50">
                  {isSubmitting ? 'Cadastrando...' : 'Cadastrar'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

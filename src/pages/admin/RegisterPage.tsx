import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { companyApi } from '../../api/auth';
import { validateCnpj } from '../../utils/cnpj';

const schema = z.object({
  email: z.string().email('E-mail inválido'),
  ownerName: z.string().min(2, 'Nome é obrigatório'),
  cnpj: z
    .string()
    .refine(validateCnpj, 'CNPJ inválido'),
  ownerBirthDate: z.string().min(1, 'Data de nascimento é obrigatória'),
  allowOvertime: z.boolean(),
  maxOvertimeHours: z.number().min(0.5).max(4).optional(),
  maxEmployees: z.number().int().min(1, 'Mínimo 1 funcionário'),
  password: z.string().min(8, 'Mínimo 8 caracteres'),
  confirmPassword: z.string(),
}).refine((d) => d.password === d.confirmPassword, {
  message: 'Senhas não conferem',
  path: ['confirmPassword'],
});

type FormData = z.infer<typeof schema>;

export default function AdminRegisterPage() {
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors, isSubmitting },
  } = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: { allowOvertime: false, maxEmployees: 10 },
  });

  const allowOvertime = watch('allowOvertime');

  async function onSubmit(data: FormData) {
    setError('');
    try {
      await companyApi.register({
        email: data.email,
        ownerName: data.ownerName,
        cnpj: data.cnpj,
        ownerBirthDate: data.ownerBirthDate,
        allowOvertime: data.allowOvertime,
        maxOvertimeHours: data.allowOvertime ? data.maxOvertimeHours : undefined,
        maxEmployees: data.maxEmployees,
        password: data.password,
      });
      setSuccess(true);
    } catch (err: unknown) {
      const msg = (err as { response?: { data?: { message?: string } } })?.response?.data?.message;
      setError(msg ?? 'Erro ao cadastrar empresa');
    }
  }

  if (success) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
        <div className="max-w-sm w-full bg-white rounded-2xl shadow-md p-8 text-center">
          <div className="text-green-500 text-4xl mb-4">✓</div>
          <h2 className="text-xl font-bold text-gray-900 mb-2">Empresa cadastrada!</h2>
          <p className="text-gray-600 mb-6">
            Verifique seu e-mail para ativar a conta antes de fazer login.
          </p>
          <Link
            to="/admin/login"
            className="inline-block bg-blue-600 text-white rounded-lg px-6 py-2 text-sm font-medium hover:bg-blue-700"
          >
            Ir para o login
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
      <div className="w-full max-w-lg bg-white rounded-2xl shadow-md p-8">
        <h1 className="text-2xl font-bold text-gray-900 mb-1">Cadastro de Empresa</h1>
        <p className="text-sm text-gray-500 mb-6">Crie a conta da sua empresa</p>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4" noValidate>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="sm:col-span-2">
              <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">E-mail</label>
              <input
                id="email"
                type="email"
                className="w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                {...register('email')}
              />
              {errors.email && <p className="text-red-500 text-xs mt-1">{errors.email.message}</p>}
            </div>

            <div className="sm:col-span-2">
              <label htmlFor="ownerName" className="block text-sm font-medium text-gray-700 mb-1">Nome do responsável</label>
              <input
                id="ownerName"
                type="text"
                className="w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                {...register('ownerName')}
              />
              {errors.ownerName && <p className="text-red-500 text-xs mt-1">{errors.ownerName.message}</p>}
            </div>

            <div>
              <label htmlFor="cnpj" className="block text-sm font-medium text-gray-700 mb-1">CNPJ</label>
              <input
                id="cnpj"
                type="text"
                placeholder="00.000.000/0000-00"
                className="w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                {...register('cnpj')}
              />
              {errors.cnpj && <p className="text-red-500 text-xs mt-1">{errors.cnpj.message}</p>}
            </div>

            <div>
              <label htmlFor="ownerBirthDate" className="block text-sm font-medium text-gray-700 mb-1">Data de nascimento do responsável</label>
              <input
                id="ownerBirthDate"
                type="date"
                className="w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                {...register('ownerBirthDate')}
              />
              {errors.ownerBirthDate && <p className="text-red-500 text-xs mt-1">{errors.ownerBirthDate.message}</p>}
            </div>

            <div>
              <label htmlFor="maxEmployees" className="block text-sm font-medium text-gray-700 mb-1">Máx. de funcionários</label>
              <input
                id="maxEmployees"
                type="number"
                min={1}
                className="w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                {...register('maxEmployees', { valueAsNumber: true })}
              />
              {errors.maxEmployees && <p className="text-red-500 text-xs mt-1">{errors.maxEmployees.message}</p>}
            </div>

            <div className="flex items-center gap-3">
              <input
                type="checkbox"
                id="allowOvertime"
                className="w-4 h-4 rounded"
                {...register('allowOvertime')}
              />
              <label htmlFor="allowOvertime" className="text-sm text-gray-700">
                Permite horas extras
              </label>
            </div>

            {allowOvertime && (
              <div>
                <label htmlFor="maxOvertimeHours" className="block text-sm font-medium text-gray-700 mb-1">Máx. horas extras/dia</label>
                <input
                  id="maxOvertimeHours"
                  type="number"
                  step="0.5"
                  min="0.5"
                  max="4"
                  className="w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  {...register('maxOvertimeHours', { valueAsNumber: true })}
                />
              </div>
            )}

            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1">Senha</label>
              <input
                id="password"
                type="password"
                className="w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                {...register('password')}
              />
              {errors.password && <p className="text-red-500 text-xs mt-1">{errors.password.message}</p>}
            </div>

            <div>
              <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700 mb-1">Confirmar senha</label>
              <input
                id="confirmPassword"
                type="password"
                className="w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                {...register('confirmPassword')}
              />
              {errors.confirmPassword && <p className="text-red-500 text-xs mt-1">{errors.confirmPassword.message}</p>}
            </div>
          </div>

          {error && (
            <p role="alert" className="text-red-600 text-sm bg-red-50 rounded-lg px-3 py-2">
              {error}
            </p>
          )}

          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white font-medium rounded-lg py-2 text-sm transition-colors"
          >
            {isSubmitting ? 'Cadastrando...' : 'Cadastrar empresa'}
          </button>
        </form>

        <p className="text-center text-xs text-gray-500 mt-4">
          Já tem conta?{' '}
          <Link to="/admin/login" className="text-blue-600 hover:underline">
            Entrar
          </Link>
        </p>
      </div>
    </div>
  );
}

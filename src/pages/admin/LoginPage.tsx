import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { companyApi } from '../../api/auth';
import { useAuth } from '../../contexts/AuthContext';

const schema = z.object({
  email: z.string().email('E-mail inválido'),
  password: z.string().min(1, 'Senha é obrigatória'),
});

type FormData = z.infer<typeof schema>;

export default function AdminLoginPage() {
  const navigate = useNavigate();
  const { loginAsCompany } = useAuth();
  const [error, setError] = useState('');

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<FormData>({ resolver: zodResolver(schema) });

  async function onSubmit(data: FormData) {
    setError('');
    try {
      const res = await companyApi.login(data.email, data.password);
      loginAsCompany(
        { accessToken: res.data.accessToken, refreshToken: res.data.refreshToken },
        res.data.company,
      );
      navigate('/admin/dashboard');
    } catch {
      setError('E-mail ou senha inválidos');
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
      <div className="w-full max-w-sm bg-white rounded-2xl shadow-md p-8">
        <h1 className="text-2xl font-bold text-gray-900 mb-1">Portal Administrativo</h1>
        <p className="text-sm text-gray-500 mb-6">Acesse o painel da empresa</p>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4" noValidate>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1" htmlFor="email">
              E-mail da empresa
            </label>
            <input
              id="email"
              type="email"
              autoComplete="email"
              className="w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              {...register('email')}
            />
            {errors.email && (
              <p role="alert" className="text-red-500 text-xs mt-1">{errors.email.message}</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1" htmlFor="password">
              Senha
            </label>
            <input
              id="password"
              type="password"
              autoComplete="current-password"
              className="w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              {...register('password')}
            />
            {errors.password && (
              <p role="alert" className="text-red-500 text-xs mt-1">{errors.password.message}</p>
            )}
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
            {isSubmitting ? 'Entrando...' : 'Entrar'}
          </button>
        </form>

        <div className="mt-6 space-y-2 text-center text-xs text-gray-500">
          <p>
            Não tem conta?{' '}
            <Link to="/admin/cadastro" className="text-blue-600 hover:underline">
              Cadastre sua empresa
            </Link>
          </p>
          <p>
            É funcionário?{' '}
            <Link to="/login" className="text-blue-600 hover:underline">
              Acesso do funcionário
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}

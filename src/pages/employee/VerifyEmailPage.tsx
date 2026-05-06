import { useEffect, useState } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { employeeApi } from '../../api/auth';

export default function EmployeeVerifyEmailPage() {
  const [params] = useSearchParams();
  const token = params.get('token') ?? '';
  const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading');

  useEffect(() => {
    if (!token) {
      setStatus('error');
      return;
    }
    employeeApi
      .verifyEmail(token)
      .then(() => setStatus('success'))
      .catch(() => setStatus('error'));
  }, [token]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
      <div className="w-full max-w-sm bg-white rounded-2xl shadow-md p-8 text-center">
        {status === 'loading' && (
          <>
            <div className="animate-spin w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full mx-auto mb-4" />
            <p className="text-gray-600">Verificando seu e-mail...</p>
          </>
        )}
        {status === 'success' && (
          <>
            <div className="text-green-500 text-4xl mb-4">✓</div>
            <h2 className="text-xl font-bold text-gray-900 mb-2">E-mail confirmado!</h2>
            <p className="text-gray-600 mb-6">Sua conta está ativa. Você já pode fazer login.</p>
            <Link
              to="/login"
              className="inline-block bg-blue-600 text-white rounded-lg px-6 py-2 text-sm font-medium hover:bg-blue-700"
            >
              Ir para o login
            </Link>
          </>
        )}
        {status === 'error' && (
          <>
            <div className="text-red-500 text-4xl mb-4">✗</div>
            <h2 className="text-xl font-bold text-gray-900 mb-2">Link inválido ou expirado</h2>
            <p className="text-gray-600">Solicite um novo e-mail de verificação ao administrador.</p>
          </>
        )}
      </div>
    </div>
  );
}

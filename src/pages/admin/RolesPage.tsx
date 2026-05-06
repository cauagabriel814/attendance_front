import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { rolesApi } from '../../api/company';
import type { Role } from '../../types';

export default function RolesPage() {
  const queryClient = useQueryClient();
  const [showForm, setShowForm] = useState(false);
  const [newRoleName, setNewRoleName] = useState('');
  const [error, setError] = useState('');

  const { data: roles = [], isLoading } = useQuery({
    queryKey: ['roles'],
    queryFn: () => rolesApi.list().then((r) => r.data),
  });

  const createMutation = useMutation({
    mutationFn: () => rolesApi.create(newRoleName.trim()),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['roles'] });
      setNewRoleName('');
      setShowForm(false);
      setError('');
    },
    onError: (err: unknown) => {
      const msg = (err as { response?: { data?: { message?: string } } })?.response?.data?.message;
      setError(msg ?? 'Erro ao criar cargo');
    },
  });

  const removeMutation = useMutation({
    mutationFn: (id: string) => rolesApi.remove(id),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['roles'] }),
    onError: (err: unknown) => {
      const msg = (err as { response?: { data?: { message?: string } } })?.response?.data?.message;
      alert(msg ?? 'Erro ao remover cargo');
    },
  });

  return (
    <div className="p-6 max-w-3xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-bold text-gray-900">Cargos</h2>
        <button
          onClick={() => { setShowForm(true); setError(''); }}
          className="bg-blue-600 text-white rounded-lg px-4 py-2 text-sm font-medium hover:bg-blue-700"
        >
          + Novo cargo
        </button>
      </div>

      {showForm && (
        <div className="bg-white rounded-2xl shadow-sm p-4 mb-4">
          <p className="text-sm font-medium text-gray-700 mb-2">Nome do cargo</p>
          <div className="flex gap-3">
            <input
              type="text"
              value={newRoleName}
              onChange={(e) => setNewRoleName(e.target.value)}
              placeholder="Ex: Analista de RH"
              className="flex-1 border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              onKeyDown={(e) => e.key === 'Enter' && createMutation.mutate()}
            />
            <button
              onClick={() => createMutation.mutate()}
              disabled={!newRoleName.trim() || createMutation.isPending}
              className="bg-blue-600 text-white rounded-lg px-4 py-2 text-sm font-medium hover:bg-blue-700 disabled:opacity-50"
            >
              Criar
            </button>
            <button onClick={() => setShowForm(false)} className="text-gray-500 hover:text-gray-700 px-2">
              ✕
            </button>
          </div>
          {error && <p className="text-red-500 text-xs mt-2">{error}</p>}
        </div>
      )}

      {isLoading ? (
        <div className="flex justify-center py-12">
          <div className="animate-spin w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full" />
        </div>
      ) : (
        <div className="bg-white rounded-2xl shadow-sm overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 text-gray-500 text-xs uppercase">
              <tr>
                <th className="px-4 py-3 text-left">Cargo</th>
                <th className="px-4 py-3 text-center">Funcionários</th>
                <th className="px-4 py-3" />
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {roles.length === 0 ? (
                <tr>
                  <td colSpan={3} className="text-center py-8 text-gray-400">
                    Nenhum cargo cadastrado
                  </td>
                </tr>
              ) : (
                roles.map((role: Role) => (
                  <tr key={role.id} className="hover:bg-gray-50">
                    <td className="px-4 py-3 font-medium text-gray-900">{role.name}</td>
                    <td className="px-4 py-3 text-center text-gray-600">
                      {role._count?.employees ?? 0}
                    </td>
                    <td className="px-4 py-3 text-right">
                      <button
                        onClick={() => {
                          if (confirm(`Remover cargo "${role.name}"?`)) {
                            removeMutation.mutate(role.id);
                          }
                        }}
                        disabled={(role._count?.employees ?? 0) > 0}
                        title={(role._count?.employees ?? 0) > 0 ? 'Cargo em uso' : 'Remover cargo'}
                        className="text-red-500 hover:text-red-700 text-xs disabled:opacity-30 disabled:cursor-not-allowed"
                      >
                        Remover
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

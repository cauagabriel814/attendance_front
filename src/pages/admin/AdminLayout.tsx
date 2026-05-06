import { NavLink, Outlet, useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { companyApi } from '../../api/auth';

const navItems = [
  { to: '/admin/dashboard', label: 'Dashboard' },
  { to: '/admin/funcionarios', label: 'Funcionários' },
  { to: '/admin/cargos', label: 'Cargos' },
];

export default function AdminLayout() {
  const { company, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    try { await companyApi.logout(); } catch { /* ignora */ }
    logout();
    navigate('/admin/login');
  };

  return (
    <div className="min-h-screen bg-gray-50 flex">
      {/* Sidebar */}
      <aside className="w-56 bg-white border-r border-gray-200 flex flex-col">
        <div className="p-5 border-b border-gray-100">
          <p className="text-xs text-gray-400">Empresa</p>
          <p className="text-sm font-semibold text-gray-900 truncate">{company?.ownerName}</p>
        </div>
        <nav className="flex-1 p-3 space-y-1">
          {navItems.map(({ to, label }) => (
            <NavLink
              key={to}
              to={to}
              className={({ isActive }) =>
                `block px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                  isActive
                    ? 'bg-blue-50 text-blue-700'
                    : 'text-gray-600 hover:bg-gray-50'
                }`
              }
            >
              {label}
            </NavLink>
          ))}
        </nav>
        <div className="p-4 border-t border-gray-100">
          <button
            onClick={handleLogout}
            className="w-full text-left text-sm text-gray-500 hover:text-red-500 transition-colors"
          >
            Sair
          </button>
        </div>
      </aside>

      {/* Conteúdo */}
      <main className="flex-1 overflow-auto">
        <Outlet />
      </main>
    </div>
  );
}

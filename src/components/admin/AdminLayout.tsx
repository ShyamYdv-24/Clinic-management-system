import React from 'react';
import {
  LayoutDashboard,
  CalendarCheck2,
  UserCheck,
  Activity,
  Image,
  HelpCircle,
  Settings,
  LogOut,
  Stethoscope,
  ExternalLink,
  ShieldAlert,
} from 'lucide-react';
import { useRouter, Link } from '../../routes/RouterContext';
import { useAuth } from '../../context/AuthContext';

export const AdminLayout: React.FC<{ children: React.ReactNode; title: string }> = ({ children, title }) => {
  const { pathname, navigate } = useRouter();
  const { user, logout } = useAuth();

  const navItems = [
    { label: 'Overview Dashboard', href: '/dashboard-admin', icon: LayoutDashboard },
    { label: 'Clinic Settings', href: '/dashboard-admin/settings', icon: Settings },
  ];

  const handleLogout = () => {
    logout();
    navigate('/dashboard-admin/login');
  };

  return (
    <div className="min-h-screen bg-slate-100 flex flex-col md:flex-row">
      {/* Sidebar */}
      <aside className="w-full md:w-64 bg-slate-900 text-slate-300 flex flex-col shrink-0">
        <div className="p-5 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-lg bg-emerald-600 flex items-center justify-center text-white">
              <Stethoscope className="w-5 h-5" />
            </div>
            <div>
              <div className="font-bold text-white text-sm tracking-tight">Om Sai Clinic</div>
              <div className="text-[10px] text-emerald-400 font-semibold uppercase tracking-wider">CMS Console</div>
            </div>
          </div>
        </div>

        {/* User Info Bar */}
        <div className="px-5 py-3 bg-slate-800/60 border-b border-slate-800 flex items-center gap-3">
          <div className="w-8 h-8 rounded-full bg-emerald-700 text-white flex items-center justify-center text-xs font-bold uppercase">
            {user?.name ? user.name[0] : 'A'}
          </div>
          <div className="min-w-0 flex-1">
            <div className="text-xs font-semibold text-white truncate">{user?.name || 'Administrator'}</div>
            <div className="text-[10px] text-slate-400 truncate">{user?.email || 'admin@om-sai.clinic'}</div>
          </div>
        </div>

        {/* Navigation */}
        <nav className="p-4 space-y-1 flex-1">
          <div className="text-[10px] uppercase font-bold text-slate-500 px-3 py-1 tracking-wider">
            Admin Controls
          </div>
          {navItems.map((item) => {
            const active = pathname === item.href;
            const Icon = item.icon;
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex items-center gap-3 px-3 py-2 text-xs font-medium rounded-lg transition-colors ${
                  active
                    ? 'bg-emerald-600 text-white shadow-xs'
                    : 'text-slate-400 hover:text-white hover:bg-slate-800'
                }`}
              >
                <Icon className="w-4 h-4" />
                <span>{item.label}</span>
              </Link>
            );
          })}

          <div className="pt-4 mt-4 border-t border-slate-800">
            <div className="text-[10px] uppercase font-bold text-slate-500 px-3 py-1 tracking-wider">
              External
            </div>
            <Link
              href="/"
              className="flex items-center gap-3 px-3 py-2 text-xs font-medium rounded-lg text-slate-400 hover:text-white hover:bg-slate-800"
            >
              <ExternalLink className="w-4 h-4" />
              <span>View Public Portal</span>
            </Link>
          </div>
        </nav>

        {/* Logout */}
        <div className="p-4 border-t border-slate-800">
          <button
            onClick={handleLogout}
            className="w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-xs font-semibold text-rose-400 hover:text-rose-300 hover:bg-rose-950/40 transition-colors cursor-pointer"
          >
            <LogOut className="w-4 h-4" />
            <span>Sign Out</span>
          </button>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 flex flex-col min-w-0">
        <header className="bg-white border-b border-slate-200 px-6 py-4 flex items-center justify-between">
          <h1 className="text-xl font-bold text-slate-900">{title}</h1>
          <div className="flex items-center gap-3">
            <span className="text-xs bg-emerald-50 text-emerald-700 px-2.5 py-1 rounded-full font-medium border border-emerald-200">
              Role: {user?.role || 'Administrator'}
            </span>
          </div>
        </header>

        <div className="p-6 sm:p-8 flex-1 overflow-y-auto">{children}</div>
      </main>
    </div>
  );
};

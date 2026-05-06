import { Link, useLocation } from 'react-router-dom';
import {
  LayoutDashboard,
  Target,
  TrendingUp,
  Users,
  KanbanSquare,
  PieChart,
  Activity,
} from 'lucide-react';

const NAV = [
  { to: '/', icon: LayoutDashboard, label: 'Overview' },
  { to: '/targets', icon: Target, label: 'Monthly Targets' },
  { to: '/revenue', icon: TrendingUp, label: 'Revenue Tracking' },
  { to: '/leads', icon: Users, label: 'Leads' },
  { to: '/kanban', icon: KanbanSquare, label: 'Leads Board' },
  { to: '/profitability', icon: PieChart, label: 'Profitability' },
];

export default function Layout({ children }) {
  const { pathname } = useLocation();

  return (
    <div className="flex min-h-screen bg-gray-50">
      {/* Sidebar */}
      <aside className="w-64 bg-gradient-to-b from-blue-900 to-blue-800 flex flex-col shadow-xl flex-shrink-0">
        {/* Logo */}
        <div className="px-5 py-5 border-b border-blue-700">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 bg-white rounded-lg flex items-center justify-center">
              <Activity className="w-5 h-5 text-blue-800" />
            </div>
            <div>
              <p className="text-white font-bold text-sm leading-tight">NDC Diagnostic</p>
              <p className="text-blue-300 text-xs">Centre Dashboard</p>
            </div>
          </div>
        </div>

        {/* Nav links */}
        <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
          {NAV.map(({ to, icon: Icon, label }) => {
            const active = pathname === to;
            return (
              <Link
                key={to}
                to={to}
                className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all ${
                  active
                    ? 'bg-white text-blue-800 shadow-sm'
                    : 'text-blue-100 hover:bg-blue-700/60 hover:text-white'
                }`}
              >
                <Icon className="w-4 h-4 flex-shrink-0" />
                {label}
              </Link>
            );
          })}
        </nav>

        <div className="px-5 py-4 border-t border-blue-700">
          <p className="text-blue-300 text-xs text-center">NDC Diagnostic Centre © {new Date().getFullYear()}</p>
        </div>
      </aside>

      {/* Main content */}
      <main className="flex-1 overflow-auto">
        {children}
      </main>
    </div>
  );
}

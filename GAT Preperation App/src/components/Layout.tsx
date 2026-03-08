import { Link, useLocation } from 'react-router-dom';
import { LayoutDashboard, BookOpen, FileText, BarChart2, MessageSquare, Menu, X } from 'lucide-react';
import { useState } from 'react';
import { clsx } from 'clsx';

const navItems = [
  { name: 'Dashboard', path: '/', icon: LayoutDashboard },
  { name: 'Practice', path: '/practice', icon: BookOpen },
  { name: 'Mock Test', path: '/mock-test', icon: FileText },
  { name: 'Analytics', path: '/analytics', icon: BarChart2 },
  { name: 'AI Tutor', path: '/tutor', icon: MessageSquare },
];

export default function Layout({ children }: { children: React.ReactNode }) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const location = useLocation();

  return (
    <div className="min-h-screen bg-slate-50 flex">
      {/* Mobile sidebar toggle */}
      <div className="lg:hidden fixed top-0 left-0 right-0 h-16 bg-white border-b border-slate-200 z-50 flex items-center px-4">
        <button onClick={() => setSidebarOpen(true)} className="p-2 -ml-2 text-slate-600">
          <Menu className="w-6 h-6" />
        </button>
        <span className="ml-2 font-bold text-lg text-slate-900">GAT Prep AI</span>
      </div>

      {/* Sidebar */}
      <div
        className={clsx(
          "fixed inset-y-0 left-0 z-50 w-64 bg-white border-r border-slate-200 transform transition-transform duration-200 ease-in-out lg:translate-x-0 lg:static lg:block",
          sidebarOpen ? "translate-x-0" : "-translate-x-full"
        )}
      >
        <div className="h-16 flex items-center justify-between px-6 border-b border-slate-200">
          <span className="font-bold text-xl text-slate-900">GAT Prep AI</span>
          <button onClick={() => setSidebarOpen(false)} className="lg:hidden p-2 -mr-2 text-slate-600">
            <X className="w-6 h-6" />
          </button>
        </div>
        <nav className="p-4 space-y-1">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = location.pathname === item.path;
            return (
              <Link
                key={item.name}
                to={item.path}
                onClick={() => setSidebarOpen(false)}
                className={clsx(
                  "flex items-center px-4 py-3 text-sm font-medium rounded-xl transition-colors",
                  isActive
                    ? "bg-indigo-50 text-indigo-700"
                    : "text-slate-600 hover:bg-slate-50 hover:text-slate-900"
                )}
              >
                <Icon className={clsx("w-5 h-5 mr-3", isActive ? "text-indigo-700" : "text-slate-400")} />
                {item.name}
              </Link>
            );
          })}
        </nav>
      </div>

      {/* Main content */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden pt-16 lg:pt-0">
        <main className="flex-1 overflow-y-auto p-4 lg:p-8">
          <div className="max-w-7xl mx-auto">
            {children}
          </div>
        </main>
      </div>

      {/* Mobile overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-slate-900/50 z-40 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}
    </div>
  );
}

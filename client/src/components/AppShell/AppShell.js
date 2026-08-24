import { useState, useEffect } from 'react';
import NextLink from 'next/link';
import { useRouter } from 'next/router';
import { useAuthStore } from '../../store/authStore';
import NotificationDrawer from './NotificationDrawer';
import {
  LayoutDashboard,
  GitBranch,
  Sparkles,
  PlaySquare,
  Network,
  Settings,
  LogOut,
  Bell,
  Menu,
  X,
  Bot,
  GraduationCap,
  Activity,
} from 'lucide-react';

const THEME_KEY = 'agentflow-theme';

export default function AppShell({ children }) {
  const router = useRouter();
  const { user, logout } = useAuthStore();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [notifOpen, setNotifOpen] = useState(false);
  const [theme, setTheme] = useState('dark');

  useEffect(() => {
    const updateTheme = (value = localStorage.getItem(THEME_KEY) || 'dark') => {
      setTheme(value);
      document.documentElement.classList.toggle('dark', value === 'dark');
      document.documentElement.classList.toggle('light', value === 'light');
      document.documentElement.style.colorScheme = value;
    };

    updateTheme();
    const handleThemeChange = (event) => updateTheme(event.detail || localStorage.getItem(THEME_KEY) || 'dark');
    window.addEventListener('themechange', handleThemeChange);

    return () => window.removeEventListener('themechange', handleThemeChange);
  }, []);

  const isDark = theme === 'dark';

  const navItems = [
    { name: 'Dashboard', href: '/dashboard', icon: LayoutDashboard },
    { name: 'Workflows', href: '/workflows', icon: GitBranch },
    { name: 'AI Prompt Builder', href: '/workflows/builder', icon: Sparkles, badge: 'AI' },
    { name: 'Executions', href: '/executions', icon: PlaySquare },
    { name: 'Integrations', href: '/integrations', icon: Network },
    { name: 'Settings', href: '/settings', icon: Settings },
  ];

  const handleLogout = () => {
    logout();
    router.push('/login');
  };

  return (
    <div className={`min-h-screen flex flex-col lg:flex-row ${isDark ? 'bg-slate-950 text-slate-100' : 'bg-slate-100 text-slate-900'}`}>
      {/* Mobile Header */}
      <header className={`lg:hidden h-16 border-b px-4 flex items-center justify-between sticky top-0 z-30 ${
        isDark ? 'bg-slate-900 border-slate-800' : 'bg-white/90 border-slate-200'
      }`}>
        <div className="flex items-center space-x-2">
          <div className="w-8 h-8 rounded-lg bg-brand-500/20 border border-brand-500/40 flex items-center justify-center text-brand-400">
            <Bot className="w-5 h-5" />
          </div>
          <span className={`font-bold tracking-tight ${isDark ? 'text-white' : 'text-slate-900'}`}>
            Agentflow<span className="text-brand-400">_AI</span>
          </span>
        </div>
        <div className="flex items-center space-x-2">
          <button
            type="button"
            onClick={() => setNotifOpen(true)}
            className={`p-2 rounded-lg transition ${isDark ? 'text-slate-400 hover:text-slate-200 hover:bg-slate-800' : 'text-slate-500 hover:text-slate-800 hover:bg-slate-200'}`}
          >
            <Bell className="w-5 h-5" />
          </button>
          <button
            type="button"
            onClick={() => setMobileOpen(!mobileOpen)}
            className={`p-2 rounded-lg transition ${isDark ? 'text-slate-400 hover:text-slate-200 hover:bg-slate-800' : 'text-slate-500 hover:text-slate-800 hover:bg-slate-200'}`}
          >
            {mobileOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>
      </header>

      {/* Sidebar Desktop & Mobile drawer */}
      <aside
        className={`fixed inset-y-0 left-0 z-40 w-64 border-r flex flex-col transition-transform duration-200 ease-in-out lg:translate-x-0 lg:static ${
          isDark ? 'bg-slate-900/95 border-slate-800/80' : 'bg-white/95 border-slate-200/80'
        } ${mobileOpen ? 'translate-x-0' : '-translate-x-full'}`}
      >
        {/* Brand Header */}
        <div className={`p-5 border-b flex items-center justify-between ${isDark ? 'border-slate-800' : 'border-slate-200'}`}>
          <NextLink href="/dashboard" className="flex items-center space-x-3 group">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-brand-600 to-emerald-400 p-[1px] shadow-lg shadow-brand-500/20">
              <div className={`w-full h-full rounded-[11px] flex items-center justify-center text-brand-400 group-hover:scale-105 transition ${isDark ? 'bg-slate-950' : 'bg-white'}`}>
                <Bot className="w-5 h-5" />
              </div>
            </div>
            <div>
              <div className={`font-bold text-base tracking-tight flex items-center ${isDark ? 'text-slate-100' : 'text-slate-900'}`}>
                Agentflow<span className="text-brand-400">_AI</span>
              </div>
              <div className="flex items-center space-x-1 text-[10px] font-semibold text-emerald-400/90 tracking-wider uppercase">
                <GraduationCap className="w-3 h-3 text-emerald-400" />
                <span>NIT CALICUT</span>
              </div>
            </div>
          </NextLink>
        </div>

        {/* Navigation Items */}
        <nav className="flex-1 px-3 py-4 space-y-1.5 overflow-y-auto">
          <div className={`px-3 pb-2 text-[10px] font-bold uppercase tracking-widest ${isDark ? 'text-slate-500' : 'text-slate-400'}`}>
            Platform Navigation
          </div>
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = router.pathname === item.href || (item.href !== '/dashboard' && router.pathname.startsWith(item.href));
            return (
              <NextLink
                key={item.name}
                href={item.href}
                onClick={() => setMobileOpen(false)}
                className={`flex items-center justify-between px-3.5 py-2.5 rounded-xl text-sm font-medium transition-all group ${
                  isActive
                    ? 'bg-gradient-to-r from-brand-600/20 to-emerald-500/10 text-brand-300 border border-brand-500/30 shadow-sm'
                    : isDark
                      ? 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
                      : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/80'
                }`}
              >
                <div className="flex items-center space-x-3">
                  <Icon className={`w-4 h-4 transition ${isActive ? 'text-brand-400' : isDark ? 'text-slate-400 group-hover:text-slate-200' : 'text-slate-500 group-hover:text-slate-900'}`} />
                  <span>{item.name}</span>
                </div>
                {item.badge && (
                  <span className="px-1.5 py-0.5 text-[10px] font-extrabold bg-brand-500/20 text-brand-400 rounded-md border border-brand-500/30">
                    {item.badge}
                  </span>
                )}
              </NextLink>
            );
          })}
        </nav>

        {/* User Card & Logout */}
        <div className={`p-3 border-t ${isDark ? 'border-slate-800 bg-slate-900/60' : 'border-slate-200 bg-slate-100/80'}`}>
          <div className={`p-2.5 rounded-xl border flex items-center justify-between ${isDark ? 'bg-slate-850/80 border-slate-800' : 'bg-slate-50 border-slate-200'}`}>
            <div className="min-w-0 pr-2">
              <div className={`text-xs font-semibold truncate ${isDark ? 'text-slate-200' : 'text-slate-800'}`}>{user?.name || 'Operator'}</div>
              <div className={`text-[11px] truncate ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>{user?.email || 'operator@nitc.ac.in'}</div>
              <div className="mt-1 flex items-center space-x-1 text-[10px] text-brand-400 font-medium">
                <span className="w-1.5 h-1.5 rounded-full bg-brand-400 animate-ping" />
                <span className="capitalize">{user?.role || 'operator'} role</span>
              </div>
            </div>
            <button
              type="button"
              onClick={handleLogout}
              className={`p-2 rounded-lg transition ${isDark ? 'text-slate-400 hover:text-rose-400 hover:bg-rose-500/10' : 'text-slate-500 hover:text-rose-500 hover:bg-rose-100'}`}
              title="Logout"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        </div>
      </aside>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Desktop Topbar */}
        <header className={`hidden lg:flex h-16 backdrop-blur-md border-b px-8 items-center justify-between sticky top-0 z-20 ${
          isDark ? 'bg-slate-900/80 border-slate-800/80' : 'bg-white/80 border-slate-200/80'
        }`}>
          <div className="flex items-center space-x-4">
            <div className={`flex items-center space-x-2 px-3 py-1 rounded-full border text-xs ${isDark ? 'bg-slate-800/80 border-slate-700 text-slate-300' : 'bg-slate-100 border-slate-200 text-slate-600'}`}>
              <Activity className="w-3.5 h-3.5 text-brand-400 animate-pulse" />
              <span>Multi-Agent Engine:</span>
              <span className="font-semibold text-brand-500">ONLINE</span>
            </div>
            <div className={`text-xs ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>
              Institution: <span className={`font-semibold ${isDark ? 'text-slate-200' : 'text-slate-800'}`}>National Institute of Technology Calicut</span>
            </div>
          </div>

          <div className="flex items-center space-x-3">
            <button
              type="button"
              onClick={() => setNotifOpen(true)}
              className={`relative p-2 rounded-xl transition border ${isDark ? 'text-slate-400 hover:text-slate-200 hover:bg-slate-800 border-transparent hover:border-slate-700' : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200 border-slate-200 hover:border-slate-300'}`}
              title="View Live Notifications"
            >
              <Bell className="w-5 h-5" />
              <span className={`absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-brand-400 ring-2 ${isDark ? 'ring-slate-900' : 'ring-white'}`} />
            </button>
            <NextLink
              href="/workflows/builder"
              className="flex items-center space-x-2 px-3.5 py-1.5 rounded-xl bg-gradient-to-r from-brand-600 to-emerald-600 hover:from-brand-500 hover:to-emerald-500 text-white font-medium text-xs shadow-lg shadow-brand-500/20 transition transform active:scale-95"
            >
              <Sparkles className="w-3.5 h-3.5" />
              <span>Generate Workflow</span>
            </NextLink>
          </div>
        </header>

        {/* Page Content Viewport */}
        <main className={`flex-1 p-4 lg:p-8 overflow-y-auto ${isDark ? 'bg-slate-950' : 'bg-slate-100'}`}>
          {children}
        </main>
      </div>

      {/* Notifications Drawer */}
      <NotificationDrawer isOpen={notifOpen} onClose={() => setNotifOpen(false)} />
    </div>
  );
}

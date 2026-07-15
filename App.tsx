import React, { useState, useEffect, createContext, useContext } from 'react';
import { HashRouter as Router, Routes, Route, Link, useLocation } from 'react-router-dom';
import Dashboard from './components/Dashboard';
import Campaigns from './components/Campaigns';
import Audience from './components/Audience';
import CampaignWizard from './components/CampaignWizard';
import Unsubscribe from './components/Unsubscribe';
import Reports from './components/Reports';
import {
  LayoutDashboard,
  Send,
  Users,
  BarChart3,
  Settings,
  Menu,
  X,
  Sparkles,
  Sun,
  Moon
} from 'lucide-react';
import pkg from './package.json';

// Theme Context Definition
export const ThemeContext = createContext<{
  theme: 'light' | 'dark';
  toggleTheme: () => void;
}>({ theme: 'light', toggleTheme: () => {} });

export const useTheme = () => useContext(ThemeContext);

const ThemeProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [theme, setTheme] = useState<'light' | 'dark'>(() => {
    try {
      const stored = localStorage.getItem('theme');
      if (stored === 'light' || stored === 'dark') return stored;
      return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
    } catch (_) {
      return 'light';
    }
  });

  const toggleTheme = () => {
    setTheme(prev => {
      const next = prev === 'light' ? 'dark' : 'light';
      try {
        localStorage.setItem('theme', next);
      } catch (_) {}
      return next;
    });
  };

  useEffect(() => {
    const root = document.documentElement;
    if (theme === 'dark') {
      root.classList.add('dark');
    } else {
      root.classList.remove('dark');
    }
  }, [theme]);

  return (
    <ThemeContext.Provider value={{ theme, toggleTheme }}>
      {children}
    </ThemeContext.Provider>
  );
};

const SidebarItem: React.FC<{ to: string; icon: React.ReactNode; label: string; active: boolean }> = ({ to, icon, label, active }) => (
  <Link
    to={to}
    className={`flex items-center space-x-3 px-4 py-3 rounded-lg transition-colors ${
      active
        ? 'bg-brand-500 text-white shadow-md shadow-brand-500/20'
        : 'text-slate-350 hover:bg-navy-800/60 hover:text-white'
    }`}
  >
    {icon}
    <span className="font-medium">{label}</span>
  </Link>
);

const DashboardLayout: React.FC = () => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const { theme, toggleTheme } = useTheme();

  return (
    <div className="flex min-h-screen bg-brand-100 dark:bg-navy-950 text-slate-900 dark:text-slate-100 transition-colors duration-200">
      {/* Mobile Toggle */}
      <button
        className="lg:hidden fixed top-4 right-4 z-50 p-2 bg-navy-900 text-slate-100 rounded-full shadow-lg border border-navy-800"
        onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
      >
        {isMobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
      </button>

      {/* Sidebar - Always Dark Navy for Premium look */}
      <aside className={`
        fixed inset-y-0 left-0 z-40 w-64 bg-navy-900 border-r border-navy-800 transform transition-transform duration-300 ease-in-out lg:translate-x-0
        ${isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full'}
      `}>
        <div className="h-full flex flex-col p-4">
          <div className="flex items-center space-x-2.5 px-4 py-6 mb-4">
            <div className="w-8 h-8 bg-brand-500 rounded-lg flex items-center justify-center text-white">
              <Send size={18} className="text-white" />
            </div>
            <span className="text-2xl font-serif font-bold tracking-wider text-brand-500">PHDMail</span>
          </div>

          <nav className="flex-1 space-y-1">
            <SidebarContent />
          </nav>

          <div className="pt-4 border-t border-navy-800 mt-auto space-y-4">
            {/* Theme Toggle Button */}
            <button
              onClick={toggleTheme}
              className="w-full flex items-center justify-between px-4 py-2.5 rounded-lg text-slate-350 hover:bg-navy-800/60 hover:text-white transition-colors text-sm font-medium"
            >
              <div className="flex items-center space-x-3">
                {theme === 'dark' ? <Sun size={18} /> : <Moon size={18} />}
                <span>{theme === 'dark' ? 'Modo Claro' : 'Modo Escuro'}</span>
              </div>
            </button>

            <div className="bg-navy-850/60 border border-navy-800 p-4 rounded-xl">
              <div className="flex items-center space-x-2 text-brand-500 mb-2">
                <Sparkles size={16} />
                <span className="text-sm font-semibold">IA Ativa</span>
              </div>
              <p className="text-xs text-slate-400">O Gemini 3 Flash está pronto para ajudar na sua escrita.</p>
            </div>
            <div className="px-4">
              <span className="text-[10px] text-slate-500 font-mono">v{pkg.version}</span>
            </div>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 lg:ml-64 p-4 lg:p-8">
        <div className="max-w-6xl mx-auto">
          <Routes>
            <Route path="/" element={<Dashboard />} />
            <Route path="/campaigns" element={<Campaigns />} />
            <Route path="/campaigns/new" element={<CampaignWizard />} />
            <Route path="/campaigns/edit/:id" element={<CampaignWizard />} />
            <Route path="/audience" element={<Audience />} />
            <Route path="/reports" element={<Reports />} />
            <Route path="/settings" element={<div className="p-8 text-center bg-white dark:bg-slate-900 rounded-2xl border border-slate-100 dark:border-slate-800 border-dashed text-slate-500">Configurações em breve</div>} />
          </Routes>
        </div>
      </main>
    </div>
  );
};

const App: React.FC = () => {
  return (
    <ThemeProvider>
      <Router>
        <Routes>
          <Route path="/unsubscribe" element={<Unsubscribe />} />
          <Route path="/*" element={<DashboardLayout />} />
        </Routes>
      </Router>
    </ThemeProvider>
  );
};

const SidebarContent = () => {
  const location = useLocation();
  const isActive = (path: string) => location.pathname === path;

  return (
    <>
      <SidebarItem to="/" icon={<LayoutDashboard size={20} />} label="Painel" active={isActive('/')} />
      <SidebarItem to="/campaigns" icon={<Send size={20} />} label="Campanhas" active={location.pathname.startsWith('/campaigns')} />
      <SidebarItem to="/audience" icon={<Users size={20} />} label="Público" active={isActive('/audience')} />
      <SidebarItem to="/reports" icon={<BarChart3 size={20} />} label="Relatórios" active={isActive('/reports')} />
      <SidebarItem to="/settings" icon={<Settings size={20} />} label="Ajustes" active={isActive('/settings')} />
    </>
  );
};

export default App;

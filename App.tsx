
import React, { useState } from 'react';
import { HashRouter as Router, Routes, Route, Link, useLocation } from 'react-router-dom';
import Dashboard from './components/Dashboard';
import Campaigns from './components/Campaigns';
import Audience from './components/Audience';
import CampaignWizard from './components/CampaignWizard';
import { 
  LayoutDashboard, 
  Send, 
  Users, 
  BarChart3, 
  Settings,
  Menu,
  X,
  Sparkles
} from 'lucide-react';

const SidebarItem: React.FC<{ to: string; icon: React.ReactNode; label: string; active: boolean }> = ({ to, icon, label, active }) => (
  <Link 
    to={to} 
    className={`flex items-center space-x-3 px-4 py-3 rounded-lg transition-colors ${
      active ? 'bg-indigo-600 text-white' : 'text-slate-600 hover:bg-indigo-50 hover:text-indigo-600'
    }`}
  >
    {icon}
    <span className="font-medium">{label}</span>
  </Link>
);

const App: React.FC = () => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  return (
    <Router>
      <div className="flex min-h-screen bg-slate-50">
        {/* Mobile Toggle */}
        <button 
          className="lg:hidden fixed top-4 right-4 z-50 p-2 bg-white rounded-full shadow-lg border"
          onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
        >
          {isMobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
        </button>

        {/* Sidebar */}
        <aside className={`
          fixed inset-y-0 left-0 z-40 w-64 bg-white border-r transform transition-transform duration-300 ease-in-out lg:translate-x-0
          ${isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full'}
        `}>
          <div className="h-full flex flex-col p-4">
            <div className="flex items-center space-x-2 px-4 py-6 mb-4">
              <div className="w-8 h-8 bg-indigo-600 rounded-lg flex items-center justify-center text-white">
                <Send size={20} />
              </div>
              <span className="text-xl font-bold tracking-tight">GeminiMail</span>
            </div>

            <nav className="flex-1 space-y-1">
              <SidebarContent />
            </nav>

            <div className="pt-4 border-t mt-auto">
              <div className="bg-indigo-50 p-4 rounded-xl">
                <div className="flex items-center space-x-2 text-indigo-700 mb-2">
                  <Sparkles size={16} />
                  <span className="text-sm font-semibold">IA Ativa</span>
                </div>
                <p className="text-xs text-indigo-600">O Gemini 3 Flash está pronto para ajudar na sua escrita.</p>
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
              <Route path="/reports" element={<div className="p-8 text-center bg-white rounded-2xl border border-dashed text-slate-500">Módulo de Relatórios em breve</div>} />
              <Route path="/settings" element={<div className="p-8 text-center bg-white rounded-2xl border border-dashed text-slate-500">Configurações em breve</div>} />
            </Routes>
          </div>
        </main>
      </div>
    </Router>
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

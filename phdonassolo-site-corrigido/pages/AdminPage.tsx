import React, { useState, useEffect } from 'react';
import { DataService } from '../services/dataService';
import { SITE_CONFIG } from '../config/site-config';
import { 
  Settings, Activity, CheckCircle, XCircle, 
  Database, LogOut, Save, RefreshCw, BookOpen, ShieldCheck
} from 'lucide-react';

const AdminPage = () => {
  const [activeTab, setActiveTab] = useState('status');
  const [isWpConnected, setIsWpConnected] = useState(null);
  const [saving, setSaving] = useState(false);
  const [syncing, setSyncing] = useState(false);
  
  const [config, setConfig] = useState(SITE_CONFIG);

  useEffect(() => {
    if (localStorage.getItem('phd_session') !== 'admin') {
      window.location.hash = '#/login';
      return;
    }
    checkConn();
  }, []);

  const checkConn = async () => {
    setIsWpConnected(null);
    try {
      const status = await DataService.testConnection();
      setIsWpConnected(status);
    } catch (e) {
      setIsWpConnected(false);
    }
  };

  const handleForceSync = async () => {
    setSyncing(true);
    try {
      await DataService.clearCache();
      alert('Cache limpo e nova sincronização iniciada!');
      checkConn();
    } catch (e) {
      alert('Erro ao sincronizar.');
    } finally {
      setSyncing(false);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('phd_session');
    window.location.hash = '#/login';
  };

  const handleSave = () => {
    setSaving(true);
    localStorage.setItem('phd_site_config', JSON.stringify(config));
    setTimeout(() => {
      setSaving(false);
      alert('Alterações salvas no navegador!');
      window.location.reload();
    }, 800);
  };

  return (
    <main className="min-h-screen pt-24 bg-[#f5f5f7]">
      <div className="max-w-6xl mx-auto px-4 md:px-6 pb-20">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Painel de Controle</h1>
            <p className="text-gray-500 font-medium text-sm">Monitoramento do Ecossistema PH Donassolo.</p>
          </div>
          <button onClick={handleLogout} className="p-3 bg-white border border-gray-200 text-red-500 rounded-2xl hover:bg-red-50 transition-colors shadow-sm" title="Sair">
            <LogOut size={20} />
          </button>
        </div>

        <div className="flex bg-gray-200/50 p-1 rounded-2xl border border-gray-200 shadow-sm overflow-x-auto mb-8 no-scrollbar">
          <button onClick={() => setActiveTab('status')} className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs font-bold transition-all whitespace-nowrap ${activeTab === 'status' ? 'bg-white shadow-sm text-black' : 'text-gray-500'}`}>
            <Activity size={16} /> Conexão API
          </button>
          <button onClick={() => setActiveTab('guide')} className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs font-bold transition-all whitespace-nowrap ${activeTab === 'guide' ? 'bg-white shadow-sm text-black' : 'text-gray-500'}`}>
            <BookOpen size={16} /> Guia de Edição
          </button>
          <button onClick={() => setActiveTab('server')} className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs font-bold transition-all whitespace-nowrap ${activeTab === 'server' ? 'bg-white shadow-sm text-black' : 'text-gray-500'}`}>
            <ShieldCheck size={16} /> Segurança Hostgator
          </button>
          <button onClick={() => setActiveTab('editor')} className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs font-bold transition-all whitespace-nowrap ${activeTab === 'editor' ? 'bg-white shadow-sm text-black' : 'text-gray-500'}`}>
            <Settings size={16} /> Configurações Rápidas
          </button>
        </div>

        {activeTab === 'status' && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 animate-in fade-in duration-500">
            <div className="bg-white p-8 rounded-[32px] card-shadow border border-gray-100">
              <div className="flex items-center justify-between mb-6">
                <div className="p-3 bg-gray-50 rounded-2xl"><Database className="text-blue-600" /></div>
                <div>
                  {isWpConnected === null ? <RefreshCw className="animate-spin text-gray-300" /> : isWpConnected ? <CheckCircle className="text-green-500" size={28} /> : <XCircle className="text-red-500" size={28} />}
                </div>
              </div>
              <h3 className="text-2xl font-bold mb-2">Status da API</h3>
              <p className="text-sm text-gray-500 mb-6 leading-relaxed">Verificando comunicação com <strong>phdonassolo.com</strong>.</p>
              
              <div className="flex flex-col gap-3">
                <button onClick={handleForceSync} disabled={syncing} className="bg-blue-600 text-white px-6 py-3 rounded-xl font-bold text-xs flex items-center justify-center gap-2 hover:bg-blue-700 transition-all shadow-lg shadow-blue-500/20 disabled:opacity-50">
                  <RefreshCw size={14} className={syncing ? 'animate-spin' : ''} /> {syncing ? 'Sincronizando Conteúdo...' : 'Forçar Sincronização de Vídeos e Posts'}
                </button>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'editor' && (
          <div className="bg-white rounded-[32px] p-8 md:p-10 card-shadow border border-gray-100 animate-in fade-in duration-500">
            <h2 className="text-2xl font-bold mb-8">Configurações Rápidas</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
               <div className="space-y-6">
                 <div>
                   <label className="block text-xs font-bold mb-2 uppercase text-gray-400">Nome do Site</label>
                   <input type="text" value={config.name} onChange={(e) => setConfig({...config, name: e.target.value})} className="w-full p-4 bg-gray-50 rounded-xl border border-gray-100 font-medium" />
                 </div>
                 <div>
                   <label className="block text-xs font-bold mb-2 uppercase text-gray-400">WhatsApp Oficial</label>
                   <input type="text" value={config.whatsapp} onChange={(e) => setConfig({...config, whatsapp: e.target.value})} className="w-full p-4 bg-gray-50 rounded-xl border border-gray-100 font-medium" />
                 </div>
               </div>
               <div>
                 <label className="block text-xs font-bold mb-2 uppercase text-gray-400">Personalidade da IA (Prompt)</label>
                 <textarea value={config.assistant.instructions} onChange={(e) => setConfig({...config, assistant: {...config.assistant, instructions: e.target.value}})} rows={5} className="w-full p-4 bg-gray-50 rounded-xl border border-gray-100 resize-none text-xs leading-relaxed font-medium"></textarea>
               </div>
            </div>
            <div className="mt-10 flex justify-end">
              <button onClick={handleSave} disabled={saving} className="bg-black text-white px-10 py-4 rounded-2xl font-bold hover:bg-gray-800 transition-all disabled:opacity-50 flex items-center gap-2">
                <Save size={20} /> {saving ? 'Gravando...' : 'Salvar no Navegador'}
              </button>
            </div>
          </div>
        )}
      </div>
    </main>
  );
};

export default AdminPage;
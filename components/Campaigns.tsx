
import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Plus, Search, Filter, MoreVertical, Calendar, Mail, Copy, Trash2, Edit2 } from 'lucide-react';
import { Campaign } from '../types';
import { getCampaigns, cloneCampaign, deleteCampaign, subscribeToCampaigns } from '../services/campaignService';

const StatusBadge: React.FC<{ status: string }> = ({ status }) => {
  const styles: Record<string, string> = {
    sent: 'bg-emerald-50 dark:bg-emerald-950/20 text-emerald-700 dark:text-emerald-400 border-emerald-100 dark:border-emerald-900/50',
    scheduled: 'bg-indigo-50 dark:bg-indigo-950/20 text-indigo-700 dark:text-indigo-400 border-indigo-100 dark:border-indigo-900/50',
    draft: 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-350 border-slate-200 dark:border-slate-750',
    queued: 'bg-amber-50 dark:bg-amber-950/20 text-amber-700 dark:text-amber-400 border-amber-100 dark:border-amber-900/50',
    sending: 'bg-blue-50 dark:bg-blue-950/20 text-blue-700 dark:text-blue-400 border-blue-100 dark:border-blue-900/50 animate-pulse'
  };
  const labels: Record<string, string> = {
    sent: 'Enviada',
    scheduled: 'Agendada',
    draft: 'Rascunho',
    queued: 'Na Fila',
    sending: 'Enviando...'
  };
  return (
    <span className={`px-2 py-1 rounded-full text-xs font-semibold border ${styles[status] || styles['draft']}`}>
      {labels[status] || 'Desconhecido'}
    </span>
  );
};

const Campaigns: React.FC = () => {
  const navigate = useNavigate();
  const [campaigns, setCampaigns] = useState<Campaign[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [activeMenu, setActiveMenu] = useState<string | null>(null);
  const [sortField, setSortField] = useState<'createdAt' | 'name' | 'status'>('createdAt');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');
  const [showFilterBar, setShowFilterBar] = useState(false);
  const [statusFilter, setStatusFilter] = useState<'all' | 'sent' | 'sending' | 'queued' | 'draft'>('all');
  const [debugLog, setDebugLog] = useState<string>("Iniciando...");

  useEffect(() => {
    const loadCampaigns = async () => {
      try {
        setDebugLog("Chamando getCampaigns()...");
        const data = await getCampaigns();
        setCampaigns(data);
        setDebugLog(`Sucesso: ${data.length} campanhas carregadas às ${new Date().toLocaleTimeString()}`);
      } catch (error) {
        console.error("Failed to fetch campaigns", error);
        const errMsg = error instanceof Error ? error.message : String(error);
        setDebugLog(`Erro: ${errMsg} às ${new Date().toLocaleTimeString()}`);
        alert("Erro ao carregar lista de campanhas: " + errMsg);
      }
    };

    loadCampaigns(); // Initial fetch

    // Polling every 5 seconds as requested
    const interval = setInterval(loadCampaigns, 5000);

    return () => clearInterval(interval);
  }, []);

  const handleClone = async (campaign: Campaign) => {
    await cloneCampaign(campaign);
    const data = await getCampaigns(); // Immediate refresh
    setCampaigns(data);
    setActiveMenu(null);
  };

  const handleDelete = async (id: string) => {
    await deleteCampaign(id);
    const data = await getCampaigns(); // Immediate refresh
    setCampaigns(data);
    setActiveMenu(null);
  };

  const handleEdit = (id: string) => {
    navigate(`/campaigns/edit/${id}`);
    setActiveMenu(null);
  };

  const filteredCampaigns = campaigns
    .filter(c => !c.isTest)
    .filter(c => statusFilter === 'all' || c.status === statusFilter)
    .filter(c =>
      (c.name || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
      (c.subject || '').toLowerCase().includes(searchTerm.toLowerCase())
    )
    .sort((a, b) => {
      let comparison = 0;
      if (sortField === 'name') {
        comparison = (a.name || '').localeCompare(b.name || '');
      } else if (sortField === 'status') {
        comparison = (a.status || '').localeCompare(b.status || '');
      } else if (sortField === 'createdAt') {
        const getTimestamp = (date: any) => {
          if (!date) return 0;
          if (typeof date === 'object' && (date as any).seconds) return (date as any).seconds * 1000;
          const t = new Date(date).getTime();
          return isNaN(t) ? 0 : t;
        };
        const valA = getTimestamp(a.createdAt || a.sentAt);
        const valB = getTimestamp(b.createdAt || b.sentAt);
        comparison = valA - valB;
      }
      return sortOrder === 'asc' ? comparison : -comparison;
    });

  const formatDate = (date: any) => {
    if (!date) return null;
    if (typeof date === 'string') return date;
    if (date?.seconds) {
      return new Date(date.seconds * 1000).toLocaleString('pt-BR');
    }
    return 'Data desconhecida';
  };

  return (
    <div className="space-y-6 animate-in slide-in-from-bottom-4 duration-500">
      <header className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-4xl font-serif font-bold tracking-wide text-slate-900 dark:text-white">Campanhas</h1>
          <p className="text-slate-500 dark:text-slate-400">Crie e gerencie suas campanhas de e-mail marketing.</p>
        </div>
        <Link
          to="/campaigns/new"
          className="bg-brand-500 text-white px-5 py-2.5 rounded-xl font-semibold flex items-center space-x-2 shadow-lg shadow-brand-500/10 hover:bg-brand-600 transition-all"
        >
          <Plus size={20} />
          <span>Nova Campanha</span>
        </Link>
      </header>

      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-100 dark:border-slate-850 shadow-sm overflow-hidden">
        <div className="p-4 border-b border-slate-100 dark:border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
            <input
              type="text"
              placeholder="Buscar campanhas..."
              className="w-full pl-10 pr-4 py-2 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-lg text-sm text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-2 text-sm">
              <span className="text-slate-500 dark:text-slate-400 whitespace-nowrap">Ordenar por:</span>
              <select
                className="bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-350 rounded-lg px-2 py-2 focus:outline-none focus:ring-2 focus:ring-brand-500/20"
                value={sortField}
                onChange={(e) => setSortField(e.target.value as any)}
              >
                <option value="createdAt">Data</option>
                <option value="name">Nome</option>
                <option value="status">Status</option>
              </select>
              <button
                className="p-2 border border-slate-200 dark:border-slate-800 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-650 dark:text-slate-350"
                onClick={() => setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')}
                title={sortOrder === 'asc' ? 'Crescente' : 'Decrescente'}
              >
                <Filter size={16} className={sortOrder === 'desc' ? 'rotate-180 transition-transform' : 'transition-transform'} />
              </button>
            </div>
            <button 
              onClick={() => setShowFilterBar(!showFilterBar)}
              className={`flex items-center space-x-2 px-3 py-2 border rounded-lg text-sm font-medium transition-colors ${
                showFilterBar || statusFilter !== 'all'
                  ? 'border-brand-500 bg-brand-50/10 text-brand-500'
                  : 'border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-650 dark:text-slate-350'
              }`}
            >
              <Plus size={16} className={showFilterBar ? "rotate-45 transition-transform" : "transition-transform"} />
              <span>Filtros</span>
            </button>
          </div>
        </div>

        {showFilterBar && (
          <div className="flex flex-wrap items-center gap-3 p-4 bg-slate-50 dark:bg-slate-900/60 rounded-xl border border-slate-100 dark:border-slate-800 mb-6">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-400">Filtrar por Status:</span>
            <div className="flex flex-wrap gap-2">
              {(['all', 'sent', 'sending', 'queued', 'draft'] as const).map((status) => {
                const labelMap = {
                  all: 'Todas',
                  sent: 'Enviadas',
                  sending: 'Enviando',
                  queued: 'Fila',
                  draft: 'Rascunhos'
                };
                return (
                  <button
                    key={status}
                    type="button"
                    onClick={() => setStatusFilter(status)}
                    className={`px-3 py-1 rounded-full text-xs font-semibold border transition-all ${
                      statusFilter === status
                        ? 'bg-brand-500 text-white border-brand-500 shadow-sm'
                        : 'bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-650 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-700'
                    }`}
                  >
                    {labelMap[status]}
                  </button>
                );
              })}
            </div>
          </div>
        )}

        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="bg-brand-50/50 dark:bg-navy-900/40 text-slate-700 dark:text-slate-350 text-xs font-serif font-bold uppercase tracking-wider border-b border-slate-100 dark:border-slate-800">
                <th className="px-6 py-4">Nome da Campanha</th>
                <th className="px-6 py-4">Status</th>
                <th className="px-6 py-4">Público</th>
                <th className="px-6 py-4">Entrega</th>
                <th className="px-6 py-4">Engajamento</th>
                <th className="px-6 py-4"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800 text-slate-700 dark:text-slate-300">
              {filteredCampaigns.map((campaign) => (
                <tr key={campaign.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-900/20 transition-colors group">
                  <td className="px-6 py-5">
                    <div>
                      <div className="font-semibold text-slate-900 dark:text-white flex items-center group-hover:text-brand-500 dark:group-hover:text-brand-400 transition-colors cursor-pointer">
                        {campaign.name || 'Sem nome'}
                      </div>
                      <div className="text-xs text-slate-400 dark:text-slate-500 mt-0.5 line-clamp-1">
                        {campaign.subject || 'Sem assunto'}
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-5">
                    <div className="flex flex-col items-start gap-1">
                      <StatusBadge status={campaign.status} />

                      {/* Sending Progress Bar */}
                      {campaign.status === 'sending' && (campaign.totalRecipients || 0) > 0 && (
                        <div className="w-full min-w-[120px] mt-2">
                          <div className="flex justify-between items-center text-[10px] text-slate-500 dark:text-slate-405 mb-1">
                            <span>Progresso</span>
                            <span className="font-medium">
                              {Math.round((((campaign.sentCount || 0) + (campaign.failedCount || 0)) / (campaign.totalRecipients || 1)) * 100)}%
                            </span>
                          </div>
                          <div className="w-full bg-slate-100 dark:bg-slate-800 rounded-full h-1.5 overflow-hidden">
                            <div
                               className="bg-brand-500 h-1.5 rounded-full transition-all duration-500 ease-out"
                              style={{ width: `${Math.min(100, (((campaign.sentCount || 0) + (campaign.failedCount || 0)) / (campaign.totalRecipients || 1)) * 100)}%` }}
                            ></div>
                          </div>
                          <div className="text-[10px] text-slate-400 dark:text-slate-500 mt-1 font-mono">
                            {(campaign.sentCount || 0) + (campaign.failedCount || 0)} de {campaign.totalRecipients} enviados
                          </div>
                        </div>
                      )}

                      {/* Failures Badge (Only show if not sending or if significant failures happen during send) */}
                      {campaign.failedResults && campaign.failedResults.length > 0 && (
                        <span className="mt-1 text-[10px] font-bold text-rose-600 dark:text-rose-400 bg-rose-50 dark:bg-rose-950/20 px-2 py-0.5 rounded-full border border-rose-100 dark:border-rose-900/50 flex items-center">
                          {campaign.failedResults.length} falhas
                        </span>
                      )}
                    </div>
                  </td>
                  <td className="px-6 py-5 text-sm text-slate-600 dark:text-slate-400">
                    <div className="flex items-center">
                      <Mail size={14} className="mr-1.5 text-slate-400" />
                      {campaign.recipientsCount.toLocaleString()}
                    </div>
                  </td>
                  <td className="px-6 py-5">
                    {campaign.sentAt ? (
                      <div className="flex flex-col gap-1">
                        <div className="flex items-center text-xs text-slate-500 dark:text-slate-405">
                          <Calendar size={14} className="mr-1.5 text-slate-400" />
                          {formatDate(campaign.sentAt)}
                        </div>
                        <div className="text-[10px] text-slate-400 dark:text-slate-500 font-mono">
                          {campaign.sentCount ?? 0} de {campaign.totalRecipients ?? 0} enviados
                        </div>
                      </div>
                    ) : campaign.status === 'scheduled' && campaign.scheduledFor ? (
                      <div className="flex flex-col gap-1">
                        <div className="flex items-center text-xs text-brand-650 dark:text-brand-400">
                          <Calendar size={14} className="mr-1.5 text-brand-500" />
                          {formatDate(campaign.scheduledFor)}
                        </div>
                        <div className="text-[10px] text-slate-400 dark:text-slate-500">
                          Agendado
                        </div>
                      </div>
                    ) : (
                      <span className="text-xs text-slate-400 dark:text-slate-600">—</span>
                    )}
                  </td>
                  <td className="px-6 py-5">
                    {campaign.stats ? (
                      <div className="flex items-center space-x-3 text-xs text-slate-700 dark:text-slate-300">
                        <div>
                          <span className="block font-semibold">{((campaign.stats.opens / campaign.recipientsCount) * 100).toFixed(1)}%</span>
                          <span className="text-slate-400 dark:text-slate-500 uppercase text-[10px]">Abertura</span>
                        </div>
                        <div className="w-px h-6 bg-slate-200 dark:bg-slate-800"></div>
                        <div>
                          <span className="block font-semibold">{((campaign.stats.opens > 0) ? ((campaign.stats.clicks / campaign.stats.opens) * 100).toFixed(1) : "0.0")}%</span>
                          <span className="text-slate-400 dark:text-slate-500 uppercase text-[10px]">CTO</span>
                        </div>
                      </div>
                    ) : (
                      <span className="text-xs text-slate-400 dark:text-slate-600">—</span>
                    )}
                  </td>
                  <td className="px-6 py-5 text-right relative">
                    <button
                      onClick={() => setActiveMenu(activeMenu === campaign.id ? null : campaign.id)}
                      className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 p-1"
                    >
                      <MoreVertical size={18} />
                    </button>
                    {activeMenu === campaign.id && (
                      <div className="absolute right-6 top-12 w-44 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl shadow-xl z-20 py-1 overflow-hidden animate-in fade-in zoom-in-95 duration-200">
                        {campaign.status !== 'sent' && campaign.status !== 'sending' && (
                          <button
                            onClick={() => handleEdit(campaign.id)}
                            className="w-full text-left px-4 py-2.5 text-sm text-slate-600 dark:text-slate-300 hover:bg-brand-50 dark:hover:bg-slate-800 hover:text-brand-600 dark:hover:text-brand-400 flex items-center space-x-2"
                          >
                            <Edit2 size={14} />
                            <span>Editar</span>
                          </button>
                        )}
                        {campaign.status === 'sending' && (
                          <div className="px-4 py-2.5 text-xs text-slate-400 italic text-center">
                            Campanha em andamento...
                          </div>
                        )}
                        <button
                          onClick={() => handleClone(campaign)}
                          className="w-full text-left px-4 py-2.5 text-sm text-slate-600 dark:text-slate-300 hover:bg-brand-50 dark:hover:bg-slate-800 hover:text-brand-600 dark:hover:text-brand-400 flex items-center space-x-2"
                        >
                          <Copy size={14} />
                          <span>Clonar</span>
                        </button>
                        <button
                          onClick={() => handleDelete(campaign.id)}
                          className="w-full text-left px-4 py-2.5 text-sm text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/20 flex items-center space-x-2"
                        >
                          <Trash2 size={14} />
                          <span>Excluir</span>
                        </button>
                      </div>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="p-4 border-t border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-slate-950/50 flex justify-between items-center text-slate-500 dark:text-slate-405">
          <p className="text-sm">Exibindo {filteredCampaigns.length} de {campaigns.length} campanhas</p>
          <div className="flex space-x-2">
            <button className="px-3 py-1 border border-slate-200 dark:border-slate-800 rounded bg-white dark:bg-slate-900 text-sm hover:bg-slate-50 dark:hover:bg-slate-800 disabled:opacity-50">Anterior</button>
            <button className="px-3 py-1 border border-slate-200 dark:border-slate-800 rounded bg-white dark:bg-slate-900 text-sm hover:bg-slate-50 dark:hover:bg-slate-800">Próximo</button>
          </div>
        </div>
      </div>

      {/* Visual Debug Panel */}
      <div className="bg-amber-50 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-900/50 rounded-2xl p-4 mt-6 text-xs font-mono text-amber-800 dark:text-amber-300">
        <p className="font-bold mb-1">Painel de Diagnóstico Técnico:</p>
        <p>Log: {debugLog}</p>
        <p>Projeto Firebase: {import.meta.env.VITE_FIREBASE_PROJECT_ID || 'Não definido'}</p>
        <p>URL da API: {import.meta.env.VITE_API_URL || 'Não definida'}</p>
        <p>Qtd. Campanhas no Estado React: {campaigns.length}</p>
        <button 
          onClick={async () => {
            setDebugLog("Recarregamento forçado acionado...");
            try {
              const data = await getCampaigns();
              setCampaigns(data);
              setDebugLog(`Forçado com sucesso: ${data.length} campanhas às ${new Date().toLocaleTimeString()}`);
            } catch (err) {
              setDebugLog(`Erro no forçado: ${err instanceof Error ? err.message : String(err)} às ${new Date().toLocaleTimeString()}`);
            }
          }}
          className="mt-2 px-3 py-1 bg-amber-500 hover:bg-amber-600 text-white rounded font-bold uppercase tracking-wider transition-colors"
        >
          Forçar Consulta Firestore
        </button>
      </div>
    </div>
  );
};

export default Campaigns;

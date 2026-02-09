
import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Plus, Search, Filter, MoreVertical, Calendar, Mail, Copy, Trash2, Edit2 } from 'lucide-react';
import { Campaign } from '../types';
import { getCampaigns, cloneCampaign, deleteCampaign } from '../services/campaignService';

const StatusBadge: React.FC<{ status: string }> = ({ status }) => {
  const styles: Record<string, string> = {
    sent: 'bg-emerald-50 text-emerald-700 border-emerald-100',
    scheduled: 'bg-indigo-50 text-indigo-700 border-indigo-100',
    draft: 'bg-slate-100 text-slate-700 border-slate-200'
  };
  const labels: Record<string, string> = {
    sent: 'Enviada',
    scheduled: 'Agendada',
    draft: 'Rascunho'
  };
  return (
    <span className={`px-2 py-1 rounded-full text-xs font-semibold border ${styles[status]}`}>
      {labels[status]}
    </span>
  );
};

const Campaigns: React.FC = () => {
  const navigate = useNavigate();
  const [campaigns, setCampaigns] = useState<Campaign[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [activeMenu, setActiveMenu] = useState<string | null>(null);

  const loadCampaigns = async () => {
    const data = await getCampaigns();
    setCampaigns(data);
  };

  useEffect(() => {
    loadCampaigns();
  }, []);

  const handleClone = async (campaign: Campaign) => {
    await cloneCampaign(campaign);
    loadCampaigns();
    setActiveMenu(null);
  };

  const handleDelete = async (id: string) => {
    await deleteCampaign(id);
    loadCampaigns();
    setActiveMenu(null);
  };

  const handleEdit = (id: string) => {
    navigate(`/campaigns/edit/${id}`);
    setActiveMenu(null);
  };

  const filteredCampaigns = campaigns.filter(c =>
    c.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    c.subject.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-6 animate-in slide-in-from-bottom-4 duration-500">
      <header className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold">Campanhas</h1>
          <p className="text-slate-500">Crie e gerencie suas campanhas de e-mail marketing.</p>
        </div>
        <Link
          to="/campaigns/new"
          className="bg-indigo-600 text-white px-5 py-2.5 rounded-xl font-semibold flex items-center space-x-2 shadow-lg shadow-indigo-200 hover:bg-indigo-700 transition-all"
        >
          <Plus size={20} />
          <span>Nova Campanha</span>
        </Link>
      </header>

      <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
        <div className="p-4 border-b flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
            <input
              type="text"
              placeholder="Buscar campanhas..."
              className="w-full pl-10 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <div className="flex items-center space-x-2">
            <button className="flex items-center space-x-2 px-3 py-2 border rounded-lg text-sm font-medium hover:bg-slate-50">
              <Filter size={16} />
              <span>Filtrar</span>
            </button>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="bg-slate-50 text-slate-500 text-xs font-semibold uppercase tracking-wider">
                <th className="px-6 py-4">Nome da Campanha</th>
                <th className="px-6 py-4">Status</th>
                <th className="px-6 py-4">Público</th>
                <th className="px-6 py-4">Entrega</th>
                <th className="px-6 py-4">Engajamento</th>
                <th className="px-6 py-4"></th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {filteredCampaigns.map((campaign) => (
                <tr key={campaign.id} className="hover:bg-slate-50/50 transition-colors group">
                  <td className="px-6 py-5">
                    <div>
                      <div className="font-semibold text-slate-900 flex items-center group-hover:text-indigo-600 transition-colors cursor-pointer">
                        {campaign.name}
                      </div>
                      <div className="text-xs text-slate-400 mt-0.5 line-clamp-1">
                        {campaign.subject}
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-5">
                    <StatusBadge status={campaign.status} />
                  </td>
                  <td className="px-6 py-5 text-sm text-slate-600">
                    <div className="flex items-center">
                      <Mail size={14} className="mr-1.5 text-slate-400" />
                      {campaign.recipientsCount.toLocaleString()}
                    </div>
                  </td>
                  <td className="px-6 py-5">
                    {campaign.sentAt ? (
                      <div className="flex items-center text-xs text-slate-500">
                        <Calendar size={14} className="mr-1.5 text-slate-400" />
                        {campaign.sentAt}
                      </div>
                    ) : (
                      <span className="text-xs text-slate-400">—</span>
                    )}
                  </td>
                  <td className="px-6 py-5">
                    {campaign.stats ? (
                      <div className="flex items-center space-x-3 text-xs">
                        <div>
                          <span className="block font-semibold">{((campaign.stats.opens / campaign.recipientsCount) * 100).toFixed(1)}%</span>
                          <span className="text-slate-400 uppercase text-[10px]">Abertura</span>
                        </div>
                        <div className="w-px h-6 bg-slate-200"></div>
                        <div>
                          <span className="block font-semibold">{((campaign.stats.clicks / campaign.recipientsCount) * 100).toFixed(1)}%</span>
                          <span className="text-slate-400 uppercase text-[10px]">Cliques</span>
                        </div>
                      </div>
                    ) : (
                      <span className="text-xs text-slate-400">—</span>
                    )}
                  </td>
                  <td className="px-6 py-5 text-right relative">
                    <button
                      onClick={() => setActiveMenu(activeMenu === campaign.id ? null : campaign.id)}
                      className="text-slate-400 hover:text-slate-600 p-1"
                    >
                      <MoreVertical size={18} />
                    </button>
                    {activeMenu === campaign.id && (
                      <div className="absolute right-6 top-12 w-44 bg-white border rounded-lg shadow-xl z-20 py-1 overflow-hidden animate-in fade-in zoom-in duration-200">
                        {campaign.status !== 'sent' && (
                          <button
                            onClick={() => handleEdit(campaign.id)}
                            className="w-full text-left px-4 py-2 text-sm text-slate-600 hover:bg-indigo-50 hover:text-indigo-600 flex items-center space-x-2"
                          >
                            <Edit2 size={14} />
                            <span>Editar</span>
                          </button>
                        )}
                        <button
                          onClick={() => handleClone(campaign)}
                          className="w-full text-left px-4 py-2 text-sm text-slate-600 hover:bg-indigo-50 hover:text-indigo-600 flex items-center space-x-2"
                        >
                          <Copy size={14} />
                          <span>Clonar</span>
                        </button>
                        <button
                          onClick={() => handleDelete(campaign.id)}
                          className="w-full text-left px-4 py-2 text-sm text-rose-600 hover:bg-rose-50 flex items-center space-x-2"
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

        <div className="p-4 border-t bg-slate-50 flex justify-between items-center">
          <p className="text-sm text-slate-500">Exibindo {filteredCampaigns.length} de {campaigns.length} campanhas</p>
          <div className="flex space-x-2">
            <button className="px-3 py-1 border rounded bg-white text-sm disabled:opacity-50">Anterior</button>
            <button className="px-3 py-1 border rounded bg-white text-sm">Próximo</button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Campaigns;

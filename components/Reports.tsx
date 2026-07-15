import React, { useEffect, useState } from 'react';
import { getCampaigns, getCampaignClicks } from '../services/campaignService';
import { Campaign } from '../types';
import { ResponsiveContainer, AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, PieChart, Pie, Cell } from 'recharts';
import { BarChart3, TrendingUp, MailOpen, MousePointer2, AlertCircle, FileText, ChevronRight, ArrowLeft, Mail, ExternalLink, RefreshCw } from 'lucide-react';
import { useTheme } from '../App';

interface LinkClickStat {
  url: string;
  count: number;
}

const Reports: React.FC = () => {
  const { theme } = useTheme();
  const isDark = theme === 'dark';
  
  const [campaigns, setCampaigns] = useState<Campaign[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedCampaignId, setSelectedCampaignId] = useState<string>('all');
  const [clicksLog, setClicksLog] = useState<Array<{ email: string; url: string; clickedAt: any }>>([]);
  const [linkStats, setLinkStats] = useState<LinkClickStat[]>([]);
  const [loadingClicks, setLoadingClicks] = useState(false);

  const loadData = async () => {
    setLoading(true);
    try {
      const data = await getCampaigns();
      // Filter campaigns that have been sent or are sending to show in reports
      const filterSent = data.filter(c => (c.status === 'sent' || c.status === 'sending') && !c.isTest);
      setCampaigns(filterSent);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  useEffect(() => {
    if (selectedCampaignId && selectedCampaignId !== 'all') {
      const fetchClicks = async () => {
        setLoadingClicks(true);
        try {
          const clicks = await getCampaignClicks(selectedCampaignId);
          setClicksLog(clicks);
          
          // Compute link click stats
          const counts: Record<string, number> = {};
          clicks.forEach(click => {
            if (click.url) {
              counts[click.url] = (counts[click.url] || 0) + 1;
            }
          });
          
          const sortedStats = Object.keys(counts).map(url => ({
            url,
            count: counts[url]
          })).sort((a, b) => b.count - a.count);
          
          setLinkStats(sortedStats);
        } catch (err) {
          console.error("Erro ao buscar cliques:", err);
        } finally {
          setLoadingClicks(false);
        }
      };
      
      fetchClicks();
    } else {
      setClicksLog([]);
      setLinkStats([]);
    }
  }, [selectedCampaignId]);

  const selectedCampaign = campaigns.find(c => c.id === selectedCampaignId);

  // Helper to format date
  const formatDate = (date: any): string => {
    if (!date) return '';
    if (typeof date === 'string') return date;
    if (date?.seconds) {
      return new Date(date.seconds * 1000).toLocaleString('pt-BR');
    }
    return '';
  };

  // Recharts styling configs
  const gridColor = isDark ? '#334155' : '#f1f5f9';
  const textColor = isDark ? '#94a3b8' : '#64748b';
  const tooltipBg = isDark ? '#1e293b' : '#ffffff';
  const tooltipBorder = isDark ? '#334155' : 'none';

  // Global / General Metrics calculation
  const totalSentCampaigns = campaigns.length;
  const totalEmailsSent = campaigns.reduce((acc, c) => acc + (c.recipientsCount || 0), 0);
  const totalOpensGlobal = campaigns.reduce((acc, c) => acc + (c.stats?.opens || 0), 0);
  const totalClicksGlobal = campaigns.reduce((acc, c) => acc + (c.stats?.clicks || 0), 0);
  const totalFailuresGlobal = campaigns.reduce((acc, c) => acc + (c.failedResults?.length || 0), 0);
  
  const avgOpenRate = totalEmailsSent > 0 ? (totalOpensGlobal / totalEmailsSent) * 100 : 0;
  const avgClickRate = totalEmailsSent > 0 ? (totalClicksGlobal / totalEmailsSent) * 100 : 0;

  // Chart data for historical campaigns performance
  const chartData = campaigns.slice().reverse().map(c => ({
    name: c.name.substring(0, 12),
    aberturas: c.stats?.opens || 0,
    cliques: c.stats?.clicks || 0,
    destinatarios: c.recipientsCount || 0
  }));

  // Pie chart data for current campaign distribution
  const getPieData = (camp: Campaign) => {
    const opens = camp.stats?.opens || 0;
    const clicks = camp.stats?.clicks || 0;
    const rest = Math.max(0, camp.recipientsCount - opens - (camp.failedResults?.length || 0));
    const failures = camp.failedResults?.length || 0;
    
    return [
      { name: 'Cliques', value: clicks, color: '#a87828' },
      { name: 'Aberturas (Sem cliques)', value: Math.max(0, opens - clicks), color: '#c59d74' },
      { name: 'Não Abertos', value: rest, color: isDark ? '#3e4260' : '#e9eaf0' },
      { name: 'Falhas', value: failures, color: '#ef4444' }
    ].filter(d => d.value > 0);
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] space-y-4">
        <RefreshCw className="animate-spin text-brand-500 w-10 h-10" />
        <p className="text-slate-500 dark:text-slate-400 font-medium">Carregando relatórios...</p>
      </div>
    );
  }

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      {/* Header */}
      <header className="flex flex-col sm:flex-row justify-between sm:items-center gap-4 border-b border-slate-100 dark:border-slate-800/80 pb-6">
        <div>
          <h1 className="text-4xl font-serif font-bold text-slate-900 dark:text-white flex items-center">
            <BarChart3 className="mr-2 text-brand-500" />
            Relatórios e Métricas
          </h1>
          <p className="text-slate-500 dark:text-slate-400">Acompanhe a entregabilidade e engajamento das suas campanhas.</p>
        </div>

        <div className="flex items-center space-x-2">
          <span className="text-sm text-slate-500 dark:text-slate-400 font-medium whitespace-nowrap">Campanha:</span>
          <select
            className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500/20 text-slate-700 dark:text-slate-300 font-medium cursor-pointer max-w-xs"
            value={selectedCampaignId}
            onChange={(e) => setSelectedCampaignId(e.target.value)}
          >
            <option value="all">Visão Geral (Todas)</option>
            {campaigns.map(c => (
              <option key={c.id} value={c.id}>{c.name}</option>
            ))}
          </select>
        </div>
      </header>

      {selectedCampaignId === 'all' ? (
        /* VISÃO GERAL REPORT */
        <>
          {/* Stats Grid */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-100 dark:border-slate-850 shadow-sm font-medium text-slate-900 dark:text-white">
              <span className="text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider">Campanhas Enviadas</span>
              <p className="text-3xl font-bold mt-2 text-slate-950 dark:text-white">{totalSentCampaigns}</p>
              <span className="text-xs text-slate-400 mt-2 block font-normal">Histórico completo</span>
            </div>
            <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-100 dark:border-slate-850 shadow-sm font-medium text-slate-900 dark:text-white">
              <span className="text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider">E-mails Disparados</span>
              <p className="text-3xl font-bold mt-2 text-slate-950 dark:text-white">{totalEmailsSent.toLocaleString()}</p>
              <span className="text-xs text-emerald-500 mt-2 flex items-center font-normal">
                <TrendingUp size={14} className="mr-1" />
                Disparo via AWS SES
              </span>
            </div>
            <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-100 dark:border-slate-850 shadow-sm font-medium text-slate-900 dark:text-white">
              <span className="text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider">Taxa Média Abertura</span>
              <p className="text-3xl font-bold mt-2 text-amber-500">{avgOpenRate.toFixed(1)}%</p>
              <span className="text-xs text-slate-400 mt-2 block font-normal">{totalOpensGlobal.toLocaleString()} aberturas</span>
            </div>
            <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-100 dark:border-slate-850 shadow-sm font-medium text-slate-900 dark:text-white">
              <span className="text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider">Taxa Média Cliques</span>
              <p className="text-3xl font-bold mt-2 text-rose-500">{avgClickRate.toFixed(1)}%</p>
              <span className="text-xs text-slate-400 mt-2 block font-normal">{totalClicksGlobal.toLocaleString()} cliques</span>
            </div>
          </div>

          {/* Failures Callout */}
          {totalFailuresGlobal > 0 && (
            <div className="bg-red-50 dark:bg-red-950/20 border border-red-100 dark:border-red-900/50 rounded-xl p-4 flex items-center space-x-3 text-red-800 dark:text-red-400">
              <AlertCircle className="text-red-500 animate-pulse" />
              <div>
                <p className="font-bold">Atenção: {totalFailuresGlobal} falhas globais identificadas</p>
                <p className="text-sm">Selecione uma campanha individual no menu superior para visualizar logs de falhas detalhados.</p>
              </div>
            </div>
          )}

          {/* Historical Chart */}
          <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-100 dark:border-slate-850 shadow-sm">
            <h3 className="text-xl font-serif font-semibold text-slate-950 dark:text-white mb-6">Desempenho Geral de Campanhas</h3>
            <div className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={chartData}>
                  <defs>
                    <linearGradient id="colorOpens" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#a87828" stopOpacity={isDark ? 0.2 : 0.1} />
                      <stop offset="95%" stopColor="#a87828" stopOpacity={0} />
                    </linearGradient>
                    <linearGradient id="colorClicks" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#c59d74" stopOpacity={isDark ? 0.2 : 0.1} />
                      <stop offset="95%" stopColor="#c59d74" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke={gridColor} />
                  <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: textColor, fontSize: 11 }} dy={10} />
                  <YAxis axisLine={false} tickLine={false} tick={{ fill: textColor, fontSize: 11 }} />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: tooltipBg,
                      border: isDark ? '1px solid #334155' : 'none',
                      borderRadius: '12px',
                      boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)'
                    }}
                    labelStyle={{ color: isDark ? '#f8fafc' : '#0f172a' }}
                  />
                  <Area type="monotone" name="Aberturas" dataKey="aberturas" stroke="#a87828" fillOpacity={1} fill="url(#colorOpens)" strokeWidth={2.5} />
                  <Area type="monotone" name="Cliques" dataKey="cliques" stroke="#c59d74" fillOpacity={1} fill="url(#colorClicks)" strokeWidth={2.5} />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* List of Sent Campaigns */}
          <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-100 dark:border-slate-850 shadow-sm overflow-hidden">
            <div className="p-5 border-b border-slate-100 dark:border-slate-800">
              <h3 className="font-serif font-semibold text-lg text-slate-950 dark:text-white">Resumo Histórico</h3>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead>
                  <tr className="bg-brand-50/50 dark:bg-navy-900/40 text-slate-700 dark:text-slate-350 text-xs font-serif font-bold uppercase tracking-wider border-b border-slate-100 dark:border-slate-800">
                    <th className="px-6 py-4">Nome</th>
                    <th className="px-6 py-4">Data Envio</th>
                    <th className="px-6 py-4">Total</th>
                    <th className="px-6 py-4">Aberturas</th>
                    <th className="px-6 py-4">Cliques</th>
                    <th className="px-6 py-4"></th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800 text-slate-600 dark:text-slate-300">
                  {campaigns.map(c => {
                    const opens = c.stats?.opens || 0;
                    const clicks = c.stats?.clicks || 0;
                    const openPct = c.recipientsCount > 0 ? (opens / c.recipientsCount) * 100 : 0;
                    const clickPct = c.recipientsCount > 0 ? (clicks / c.recipientsCount) * 100 : 0;

                    return (
                      <tr key={c.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-900/30 transition-colors">
                        <td className="px-6 py-4">
                          <span className="font-semibold text-slate-900 dark:text-white">{c.name}</span>
                          <span className="block text-xs text-slate-400 dark:text-slate-500 line-clamp-1">{c.subject}</span>
                        </td>
                        <td className="px-6 py-4 text-xs text-slate-500 dark:text-slate-400">{formatDate(c.sentAt)}</td>
                        <td className="px-6 py-4 text-sm font-medium">{c.recipientsCount.toLocaleString()}</td>
                        <td className="px-6 py-4">
                          <span className="font-semibold text-slate-900 dark:text-white">{openPct.toFixed(1)}%</span>
                          <span className="block text-[10px] text-slate-400">{opens.toLocaleString()}</span>
                        </td>
                        <td className="px-6 py-4">
                          <span className="font-semibold text-slate-900 dark:text-white">{clickPct.toFixed(1)}%</span>
                          <span className="block text-[10px] text-slate-400">{clicks.toLocaleString()}</span>
                        </td>
                        <td className="px-6 py-4 text-right">
                          <button
                            onClick={() => setSelectedCampaignId(c.id)}
                            className="p-1.5 rounded-lg border border-slate-100 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800 hover:text-brand-600 transition-colors text-slate-400"
                          >
                            <ChevronRight size={16} />
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </>
      ) : (
        /* CAMPAIGN SPECIFIC DETAIL REPORT */
        selectedCampaign && (
          <>
            {/* Back to list */}
            <div>
              <button
                onClick={() => setSelectedCampaignId('all')}
                className="flex items-center text-sm font-semibold text-slate-500 hover:text-brand-600 transition-colors dark:text-slate-400 dark:hover:text-brand-400"
              >
                <ArrowLeft size={16} className="mr-2" />
                Voltar para Visão Geral
              </button>
            </div>

            {/* Title / Summary block */}
            <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-100 dark:border-slate-850 shadow-sm flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
              <div>
                <span className="text-[10px] uppercase font-bold px-2.5 py-1 rounded-full border bg-emerald-50 dark:bg-emerald-950/20 text-emerald-600 dark:text-emerald-400 border-emerald-100 dark:border-emerald-900/50">
                  {selectedCampaign.status === 'sent' ? 'Enviada' : 'Enviando...'}
                </span>
                <h2 className="text-2xl font-serif font-bold mt-2 text-slate-900 dark:text-white">{selectedCampaign.name}</h2>
                <p className="text-slate-500 dark:text-slate-400 text-sm mt-1">Assunto: {selectedCampaign.subject}</p>
                <span className="text-xs text-slate-400 dark:text-slate-500 block mt-2">Disparada em: {formatDate(selectedCampaign.sentAt)}</span>
              </div>
              
              <div className="flex space-x-2 w-full md:w-auto">
                <button
                  onClick={() => setSelectedCampaignId('all')}
                  className="flex-1 md:flex-none border border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300 px-4 py-2 rounded-xl text-sm font-semibold hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors"
                >
                  Comparar
                </button>
              </div>
            </div>

            {/* Campaign Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
              <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-100 dark:border-slate-850 shadow-sm text-slate-900 dark:text-white">
                <span className="text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider">Destinatários Totais</span>
                <p className="text-3xl font-bold mt-2">{selectedCampaign.recipientsCount.toLocaleString()}</p>
                <span className="text-xs text-slate-400 block mt-2">
                  Taxa de Entrega: {(((selectedCampaign.recipientsCount - (selectedCampaign.failedResults?.length || 0)) / selectedCampaign.recipientsCount) * 100 || 100).toFixed(1)}%
                </span>
              </div>
              <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-100 dark:border-slate-850 shadow-sm text-slate-900 dark:text-white">
                <span className="text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider">Aberturas Únicas</span>
                <p className="text-3xl font-bold mt-2 text-brand-500">
                  {selectedCampaign.stats?.opens || 0}
                </p>
                <span className="text-xs text-slate-400 block mt-2">
                  Taxa: {((selectedCampaign.stats?.opens || 0) / selectedCampaign.recipientsCount * 100).toFixed(1)}%
                </span>
              </div>
              <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-100 dark:border-slate-850 shadow-sm text-slate-900 dark:text-white">
                <span className="text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider">Cliques Totais</span>
                <p className="text-3xl font-bold mt-2 text-brand-500">
                  {selectedCampaign.stats?.clicks || 0}
                </p>
                <span className="text-xs text-slate-400 block mt-2">
                  Taxa: {((selectedCampaign.stats?.clicks || 0) / selectedCampaign.recipientsCount * 100).toFixed(1)}%
                </span>
              </div>
              <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-100 dark:border-slate-850 shadow-sm text-slate-900 dark:text-white">
                <span className="text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider">CTO (Click-to-Open)</span>
                <p className="text-3xl font-bold mt-2 text-brand-500">
                  {selectedCampaign.stats?.opens && selectedCampaign.stats.opens > 0 
                    ? ((selectedCampaign.stats.clicks / selectedCampaign.stats.opens) * 100).toFixed(1) 
                    : '0.0'}%
                </p>
                <span className="text-xs text-slate-400 block mt-2">Conversão sobre aberturas</span>
              </div>
            </div>

            {/* Chart and distribution row */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-100 dark:border-slate-850 shadow-sm flex flex-col justify-between">
                <h3 className="font-serif font-semibold text-lg mb-4 text-slate-950 dark:text-white">Distribuição de Engajamento</h3>
                
                {selectedCampaign.recipientsCount > 0 ? (
                  <>
                    <div className="h-56 relative flex items-center justify-center">
                      <ResponsiveContainer width="100%" height="100%">
                        <PieChart>
                          <Pie
                            data={getPieData(selectedCampaign)}
                            cx="50%"
                            cy="50%"
                            innerRadius={60}
                            outerRadius={80}
                            paddingAngle={4}
                            dataKey="value"
                          >
                            {getPieData(selectedCampaign).map((entry, index) => (
                              <Cell key={`cell-${index}`} fill={entry.color} />
                            ))}
                          </Pie>
                        </PieChart>
                      </ResponsiveContainer>
                      <div className="absolute text-center">
                        <span className="text-xs text-slate-400 block">Total</span>
                        <span className="text-2xl font-bold text-slate-950 dark:text-white">{selectedCampaign.recipientsCount}</span>
                      </div>
                    </div>
                    
                    <div className="space-y-2 mt-4">
                      {getPieData(selectedCampaign).map((item, i) => (
                        <div key={i} className="flex justify-between items-center text-xs">
                          <div className="flex items-center space-x-2">
                            <div className="w-3 h-3 rounded" style={{ backgroundColor: item.color }}></div>
                            <span className="text-slate-600 dark:text-slate-400 font-medium">{item.name}</span>
                          </div>
                          <span className="font-bold text-slate-950 dark:text-white">
                            {item.value} ({((item.value / selectedCampaign.recipientsCount) * 100).toFixed(1)}%)
                          </span>
                        </div>
                      ))}
                    </div>
                  </>
                ) : (
                  <p className="text-slate-400 text-center py-10">Nenhum dado estatístico disponível</p>
                )}
              </div>

              {/* Click Map (Link Analysis) */}
              <div className="lg:col-span-2 bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-100 dark:border-slate-850 shadow-sm">
                <h3 className="font-serif font-semibold text-lg mb-6 text-slate-950 dark:text-white flex items-center">
                  <ExternalLink size={18} className="mr-2 text-brand-500" />
                  Click Map (Análise de Links)
                </h3>
                
                {loadingClicks ? (
                  <div className="flex justify-center items-center py-12">
                    <RefreshCw className="animate-spin text-slate-400" />
                  </div>
                ) : linkStats.length > 0 ? (
                  <div className="space-y-4 overflow-y-auto max-h-[300px] pr-2">
                    {linkStats.map((link, idx) => {
                      const totalClicks = selectedCampaign.stats?.clicks || 1;
                      const pct = (link.count / totalClicks) * 100;
                      return (
                        <div key={idx} className="space-y-1">
                          <div className="flex justify-between text-xs font-semibold">
                            <span className="text-slate-600 dark:text-slate-300 truncate max-w-sm block" title={link.url}>
                              {link.url}
                            </span>
                            <span className="text-slate-950 dark:text-white whitespace-nowrap">
                              {link.count} cliques ({pct.toFixed(0)}%)
                            </span>
                          </div>
                          <div className="w-full bg-slate-100 dark:bg-slate-800 h-2 rounded-full overflow-hidden">
                            <div className="bg-brand-500 h-full" style={{ width: `${pct}%` }}></div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                ) : (
                  <div className="text-center py-12 text-slate-400 dark:text-slate-500 text-sm">
                    Nenhum link foi clicado nesta campanha até o momento.
                  </div>
                )}
              </div>
            </div>

            {/* Click Log & Failures Details row */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Click Ticker Log */}
              <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-100 dark:border-slate-850 shadow-sm">
                <h3 className="font-semibold text-lg mb-4 text-slate-950 dark:text-white flex items-center">
                  <MousePointer2 size={18} className="mr-2 text-rose-500" />
                  Registro de Cliques Recentes
                </h3>
                
                {loadingClicks ? (
                  <div className="flex justify-center items-center py-8">
                    <RefreshCw className="animate-spin text-slate-400" />
                  </div>
                ) : clicksLog.length > 0 ? (
                  <div className="space-y-4 max-h-[280px] overflow-y-auto pr-2">
                    {clicksLog.map((click, i) => (
                      <div key={i} className="flex justify-between items-center text-xs border-b dark:border-slate-800 pb-2">
                        <div>
                          <p className="font-semibold text-slate-900 dark:text-slate-255">{click.email}</p>
                          <p className="text-[10px] text-slate-400 truncate max-w-[280px]" title={click.url}>
                            {click.url}
                          </p>
                        </div>
                        <span className="text-[10px] text-slate-400 whitespace-nowrap">
                          {formatDate(click.clickedAt)}
                        </span>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-slate-400 dark:text-slate-500 text-sm text-center py-12">Nenhum registro de cliques.</p>
                )}
              </div>

              {/* Bounces/Failures Log */}
              <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-100 dark:border-slate-850 shadow-sm">
                <h3 className="font-semibold text-lg mb-4 text-slate-950 dark:text-white flex items-center">
                  <AlertCircle size={18} className="mr-2 text-red-500" />
                  Falhas de Entrega (Bounce Tracker)
                </h3>
                
                {selectedCampaign.failedResults && selectedCampaign.failedResults.length > 0 ? (
                  <div className="space-y-4 max-h-[280px] overflow-y-auto pr-2">
                    {selectedCampaign.failedResults.map((fail, i) => (
                      <div key={i} className="flex justify-between items-start text-xs border-b dark:border-slate-800 pb-2">
                        <div>
                          <p className="font-semibold text-slate-900 dark:text-slate-200">{fail.email}</p>
                          <p className="text-[10px] text-red-500 dark:text-red-400 mt-0.5">{fail.error}</p>
                        </div>
                        <span className="text-[10px] text-slate-400 whitespace-nowrap pl-2">
                          {formatDate(fail.timestamp)}
                        </span>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="flex flex-col items-center justify-center py-12 text-slate-400 dark:text-slate-500">
                    <span className="text-emerald-500 text-2xl mb-2">✓</span>
                    <p className="text-sm">Nenhuma falha de entrega registrada!</p>
                  </div>
                )}
              </div>
            </div>
          </>
        )
      )}
    </div>
  );
};

export default Reports;

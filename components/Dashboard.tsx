
import React, { useEffect, useState } from 'react';
import { XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, AreaChart, Area } from 'recharts';
import { Users, MailOpen, MousePointer2, Send, ArrowUpRight, TrendingUp, AlertCircle } from 'lucide-react';
import { getCampaigns } from '../services/campaignService';
import { getContacts } from '../services/contactService';
import { Campaign } from '../types';
import { useTheme } from '../App';

const StatCard: React.FC<{ title: string; value: string; trend?: string; icon: React.ReactNode; color: string }> = ({ title, value, trend, icon, color }) => (
  <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-100 dark:border-slate-850 shadow-sm hover:shadow-md transition-shadow duration-200">
    <div className="flex justify-between items-start mb-4">
      <div className={`p-3 rounded-xl ${color} bg-opacity-10 dark:bg-opacity-20`}>
        {React.cloneElement(icon as React.ReactElement, { className: `w-6 h-6 ${color.replace('bg-', 'text-')}` })}
      </div>
      {trend && (
        <span className="flex items-center text-xs font-medium text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/30 px-2 py-1 rounded-full">
          <ArrowUpRight size={12} className="mr-1" />
          {trend}
        </span>
      )}
    </div>
    <h3 className="text-slate-500 dark:text-slate-400 text-sm font-medium">{title}</h3>
    <p className="text-2xl font-bold mt-1 text-slate-900 dark:text-white">{value}</p>
  </div>
);

const Dashboard: React.FC = () => {
  const { theme } = useTheme();
  const [daysFilter, setDaysFilter] = useState<number>(30);
  const [stats, setStats] = useState({
    totalSubscribers: 0,
    openRate: 0,
    clickRate: 0,
    campaignsSent: 0,
    totalFailures: 0
  });

  const [chartData, setChartData] = useState<any[]>([]);
  const [recentActivity, setRecentActivity] = useState<any[]>([]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [cData, conData] = await Promise.all([getCampaigns(), getContacts()]);
        
        // Filter by date
        const filterDate = new Date();
        filterDate.setDate(filterDate.getDate() - daysFilter);

        const getCampaignDate = (c: Campaign) => {
          if (c.sentAt) {
            if (typeof c.sentAt === 'object' && (c.sentAt as any).seconds) return new Date((c.sentAt as any).seconds * 1000);
            return new Date(c.sentAt);
          }
          if (c.createdAt) return new Date(c.createdAt);
          return new Date(0);
        };

        const filteredCampaigns = cData.filter(c => {
          if (daysFilter === 9999) return true; // Show all
          return getCampaignDate(c) >= filterDate;
        });

        const sentCampaigns = filteredCampaigns.filter(c => c.status === 'sent');
        const totalRecipients = sentCampaigns.reduce((acc, c) => acc + (c.recipientsCount || 0), 0);
        const totalOpens = sentCampaigns.reduce((acc, c) => acc + (c.stats?.opens || 0), 0);
        const totalClicks = sentCampaigns.reduce((acc, c) => acc + (c.stats?.clicks || 0), 0);
        const failures = filteredCampaigns.reduce((acc, c) => acc + (c.failedResults?.length || 0), 0);

        // Chart Data (last 7 sent campaigns)
        const chart = sentCampaigns.slice(0, 7).reverse().map(c => ({
          name: (c.name || 'Sem nome').substring(0, 10),
          opens: c.stats?.opens || 0,
          subscribers: c.recipientsCount || 0
        }));

        // Helper to safely format date
        const formatDate = (date: any): string => {
          if (!date) return 'Data desconhecida';
          if (typeof date === 'string') return date;
          if (date?.seconds) {
            return new Date(date.seconds * 1000).toLocaleString('pt-BR');
          }
          return 'Data desconhecida';
        };

        // Recent Activity
        const activities = filteredCampaigns.slice(0, 5).map(c => {
          if (c.status === 'sent') return {
            label: 'Campanha Enviada',
            time: formatDate(c.sentAt),
            desc: `${c.name || 'Sem nome'} (${c.recipientsCount} entregues)`,
            icon: '🚀'
          };
          if (c.status === 'draft') return {
            label: 'Rascunho Criado',
            time: 'Recente',
            desc: c.name || 'Nova Campanha',
            icon: '📝'
          };
          return null;
        }).filter(Boolean);

        setStats({
          totalSubscribers: conData.length,
          openRate: totalRecipients > 0 ? (totalOpens / totalRecipients) * 100 : 0,
          clickRate: totalRecipients > 0 ? (totalClicks / totalRecipients) * 100 : 0,
          campaignsSent: sentCampaigns.length,
          totalFailures: failures
        });

        setChartData(chart);
        setRecentActivity(activities);
      } catch (err) {
        console.error("Erro ao carregar dados do Dashboard:", err);
        alert("Erro ao carregar dados do Dashboard: " + (err instanceof Error ? err.message : String(err)));
      }
    };

    fetchData();
  }, [daysFilter]);

  const isDark = theme === 'dark';
  const gridColor = isDark ? '#334155' : '#f1f5f9';
  const textColor = isDark ? '#94a3b8' : '#64748b';
  const tooltipBg = isDark ? '#1e293b' : '#ffffff';
  const tooltipBorder = isDark ? '#334155' : 'none';

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <header className="flex justify-between items-end">
        <div>
          <h1 className="text-4xl font-serif font-bold tracking-wide text-slate-900 dark:text-white">Painel Geral</h1>
          <p className="text-slate-500 dark:text-slate-400">Bem-vindo de volta! Veja o que está acontecendo hoje.</p>
        </div>
        <div className="bg-white dark:bg-slate-900 px-3 py-1.5 rounded-xl border border-slate-100 dark:border-slate-800 flex items-center space-x-1.5 text-sm font-medium text-slate-650 dark:text-slate-350 shadow-sm">
          <select
            value={daysFilter}
            onChange={(e) => setDaysFilter(Number(e.target.value))}
            className="bg-transparent border-none text-slate-700 dark:text-slate-300 font-semibold focus:outline-none cursor-pointer pr-1"
          >
            <option value={30}>Últimos 30 Dias</option>
            <option value={60}>Últimos 60 Dias</option>
            <option value={90}>Últimos 90 Dias</option>
            <option value={120}>Últimos 120 Dias</option>
            <option value={9999}>Todo o Histórico</option>
          </select>
          <TrendingUp size={16} className="text-brand-500" />
        </div>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard title="Total de Contatos" value={stats.totalSubscribers.toLocaleString()} icon={<Users />} color="bg-brand-500" />
        <StatCard title="Taxa de Abertura" value={`${stats.openRate.toFixed(1)}%`} icon={<MailOpen />} color="bg-brand-500" />
        <StatCard title="Taxa de Cliques" value={`${stats.clickRate.toFixed(1)}%`} icon={<MousePointer2 />} color="bg-brand-500" />
        <StatCard title="Campanhas Enviadas" value={stats.campaignsSent.toString()} icon={<Send />} color="bg-brand-500" />
      </div>

      {stats.totalFailures > 0 && (
        <div className="bg-red-50 dark:bg-red-950/20 border border-red-200 dark:border-red-900/50 rounded-xl p-4 flex items-center space-x-3 text-red-700 dark:text-red-400">
          <AlertCircle className="text-red-500" />
          <div>
            <p className="font-bold">Atenção: {stats.totalFailures} falhas de envio detectadas</p>
            <p className="text-sm">Verifique os relatórios das campanhas para detalhes sobre e-mails inválidos.</p>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-100/85 dark:border-slate-850 shadow-sm">
          <div className="flex justify-between items-center mb-6">
            <h3 className="text-xl font-serif font-semibold text-slate-900 dark:text-white">Desempenho Recente</h3>
            <div className="flex space-x-2">
              <span className="flex items-center text-xs text-slate-500 dark:text-slate-400">
                <div className="w-3 h-3 bg-brand-500 rounded-full mr-1"></div> Aberturas
              </span>
            </div>
          </div>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={chartData}>
                <defs>
                  <linearGradient id="colorSub" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#a87828" stopOpacity={isDark ? 0.2 : 0.1} />
                    <stop offset="95%" stopColor="#a87828" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke={gridColor} />
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: textColor, fontSize: 12 }} dy={10} />
                <YAxis axisLine={false} tickLine={false} tick={{ fill: textColor, fontSize: 12 }} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: tooltipBg,
                    border: isDark ? '1px solid #334155' : 'none',
                    borderRadius: '12px',
                    boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)'
                  }}
                  labelStyle={{ color: isDark ? '#f8fafc' : '#0f172a' }}
                />
                <Area type="monotone" dataKey="opens" stroke="#a87828" fillOpacity={1} fill="url(#colorSub)" strokeWidth={3} />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-100/85 dark:border-slate-850 shadow-sm">
          <h3 className="text-xl font-serif font-semibold text-slate-900 dark:text-white mb-6">Atividades Recentes</h3>
          <div className="space-y-6">
            {recentActivity.length > 0 ? recentActivity.map((activity, i) => (
              <div key={i} className="flex space-x-4">
                <div className="w-10 h-10 rounded-full bg-slate-50 dark:bg-slate-800 flex items-center justify-center text-lg shadow-sm border border-slate-100 dark:border-slate-700/80">
                  {activity.icon}
                </div>
                <div>
                  <p className="text-sm font-semibold text-slate-900 dark:text-slate-200">{activity.label}</p>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mb-1">{activity.time}</p>
                  <p className="text-xs text-slate-400 dark:text-slate-500">{activity.desc}</p>
                </div>
              </div>
            )) : (
              <p className="text-slate-400 dark:text-slate-500 text-sm">Nenhuma atividade recente encontrada.</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;

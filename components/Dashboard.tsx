
import React from 'react';
import { XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, AreaChart, Area } from 'recharts';
import { Users, MailOpen, MousePointer2, Send, ArrowUpRight, TrendingUp } from 'lucide-react';

const data = [
  { name: 'Jan', subscribers: 4000, opens: 2400 },
  { name: 'Fev', subscribers: 3000, opens: 1398 },
  { name: 'Mar', subscribers: 2000, opens: 9800 },
  { name: 'Abr', subscribers: 2780, opens: 3908 },
  { name: 'Mai', subscribers: 1890, opens: 4800 },
  { name: 'Jun', subscribers: 2390, opens: 3800 },
];

const StatCard: React.FC<{ title: string; value: string; trend: string; icon: React.ReactNode; color: string }> = ({ title, value, trend, icon, color }) => (
  <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm">
    <div className="flex justify-between items-start mb-4">
      <div className={`p-3 rounded-xl ${color} bg-opacity-10`}>
        {React.cloneElement(icon as React.ReactElement, { className: `w-6 h-6 ${color.replace('bg-', 'text-')}` })}
      </div>
      <span className="flex items-center text-xs font-medium text-emerald-600 bg-emerald-50 px-2 py-1 rounded-full">
        <ArrowUpRight size={12} className="mr-1" />
        {trend}
      </span>
    </div>
    <h3 className="text-slate-500 text-sm font-medium">{title}</h3>
    <p className="text-2xl font-bold mt-1">{value}</p>
  </div>
);

const Dashboard: React.FC = () => {
  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <header className="flex justify-between items-end">
        <div>
          <h1 className="text-3xl font-bold text-slate-900">Painel Geral</h1>
          <p className="text-slate-500">Bem-vindo de volta! Veja o que está acontecendo hoje.</p>
        </div>
        <div className="bg-white px-4 py-2 rounded-lg border flex items-center space-x-2 text-sm font-medium text-slate-600">
          <span>Últimos 30 Dias</span>
          <TrendingUp size={16} />
        </div>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard title="Total de Inscritos" value="12.842" trend="+12%" icon={<Users />} color="bg-indigo-600" />
        <StatCard title="Taxa de Abertura" value="24,8%" trend="+4,5%" icon={<MailOpen />} color="bg-amber-500" />
        <StatCard title="Taxa de Cliques" value="1,2%" trend="+0,8%" icon={<MousePointer2 />} color="bg-rose-500" />
        <StatCard title="Campanhas Enviadas" value="84" trend="+2" icon={<Send />} color="bg-emerald-500" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 bg-white p-6 rounded-2xl border border-slate-100 shadow-sm">
          <div className="flex justify-between items-center mb-6">
            <h3 className="text-lg font-semibold">Crescimento do Público</h3>
            <div className="flex space-x-2">
              <span className="flex items-center text-xs text-slate-500">
                <div className="w-3 h-3 bg-indigo-500 rounded-full mr-1"></div> Inscritos
              </span>
            </div>
          </div>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={data}>
                <defs>
                  <linearGradient id="colorSub" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#6366f1" stopOpacity={0.1}/>
                    <stop offset="95%" stopColor="#6366f1" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fill: '#94a3b8', fontSize: 12}} dy={10} />
                <YAxis axisLine={false} tickLine={false} tick={{fill: '#94a3b8', fontSize: 12}} />
                <Tooltip 
                  contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                />
                <Area type="monotone" dataKey="subscribers" stroke="#6366f1" fillOpacity={1} fill="url(#colorSub)" strokeWidth={3} />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm">
          <h3 className="text-lg font-semibold mb-6">Atividades Recentes</h3>
          <div className="space-y-6">
            {[
              { label: 'Campanha Enviada', time: '2 horas atrás', desc: 'Oferta de Primavera atingiu 8.4k usuários', icon: '🚀' },
              { label: 'Novo Inscrito', time: '5 horas atrás', desc: 'alex@exemplo.com entrou na lista', icon: '👤' },
              { label: 'Link Clicado', time: '8 horas atrás', desc: 'Link de produto clicado por 120 usuários', icon: '🔗' },
              { label: 'Rascunho Criado', time: '1 dia atrás', desc: 'IA ajudou no rascunho de Atualização Q2', icon: '📝' },
            ].map((activity, i) => (
              <div key={i} className="flex space-x-4">
                <div className="w-10 h-10 rounded-full bg-slate-50 flex items-center justify-center text-lg shadow-sm border border-slate-100">
                  {activity.icon}
                </div>
                <div>
                  <p className="text-sm font-semibold">{activity.label}</p>
                  <p className="text-xs text-slate-500 mb-1">{activity.time}</p>
                  <p className="text-xs text-slate-400">{activity.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;


import React, { useState } from 'react';
import { UserPlus, Search, Download, Trash2, Tag, Mail, ExternalLink } from 'lucide-react';
import { Contact } from '../types';

const mockContacts: Contact[] = [
  { id: '1', email: 'john@exemplo.com', firstName: 'João', lastName: 'Silva', status: 'subscribed', tags: ['vip', 'cliente'], addedAt: '12/08/2023' },
  { id: '2', email: 'sarah.smith@gmail.com', firstName: 'Sarah', lastName: 'Smith', status: 'subscribed', tags: ['newsletter'], addedAt: '05/09/2023' },
  { id: '3', email: 'mike.jones@outlook.com', firstName: 'Mike', lastName: 'Jones', status: 'unsubscribed', tags: ['antigo'], addedAt: '01/12/2022' },
  { id: '4', email: 'emily.brown@empresa.io', firstName: 'Emily', lastName: 'Brown', status: 'subscribed', tags: ['plano-pro'], addedAt: '15/10/2023' },
];

const Audience: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState('');

  return (
    <div className="space-y-6 animate-in slide-in-from-bottom-4 duration-500">
      <header className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold text-slate-900 dark:text-white">Público</h1>
          <p className="text-slate-500 dark:text-slate-400">Gerencie seus inscritos e lista de clientes.</p>
        </div>
        <div className="flex space-x-3">
          <button className="flex items-center space-x-2 px-4 py-2 border border-slate-200 dark:border-slate-800 rounded-xl text-sm font-semibold hover:bg-white dark:hover:bg-slate-800 bg-slate-50 dark:bg-slate-900 text-slate-700 dark:text-slate-300 transition-colors">
            <Download size={18} />
            <span>Exportar CSV</span>
          </button>
          <button className="bg-brand-600 text-white px-5 py-2.5 rounded-xl font-semibold flex items-center space-x-2 shadow-lg shadow-brand-500/10 hover:bg-brand-700 transition-all">
            <UserPlus size={20} />
            <span>Adicionar Contato</span>
          </button>
        </div>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-100 dark:border-slate-850 shadow-sm">
          <p className="text-slate-500 dark:text-slate-400 text-xs font-bold uppercase tracking-wider mb-1">Inscritos</p>
          <p className="text-3xl font-bold text-slate-900 dark:text-white">12.104</p>
          <div className="mt-4 w-full bg-slate-100 dark:bg-slate-800 h-2 rounded-full overflow-hidden">
            <div className="bg-emerald-500 h-full w-[94%]"></div>
          </div>
        </div>
        <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-100 dark:border-slate-850 shadow-sm">
          <p className="text-slate-500 dark:text-slate-400 text-xs font-bold uppercase tracking-wider mb-1">Descadastrados</p>
          <p className="text-3xl font-bold text-slate-900 dark:text-white">738</p>
          <div className="mt-4 w-full bg-slate-100 dark:bg-slate-800 h-2 rounded-full overflow-hidden">
            <div className="bg-rose-500 h-full w-[6%]"></div>
          </div>
        </div>
        <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-100 dark:border-slate-850 shadow-sm">
          <p className="text-slate-500 dark:text-slate-400 text-xs font-bold uppercase tracking-wider mb-1">Taxa de Crescimento</p>
          <p className="text-3xl font-bold text-slate-900 dark:text-white">+4,2%</p>
          <p className="text-xs text-emerald-600 dark:text-emerald-400 font-medium mt-2">vs último mês</p>
        </div>
      </div>

      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-100 dark:border-slate-850 shadow-sm overflow-hidden">
        <div className="p-4 border-b border-slate-100 dark:border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
            <input 
              type="text" 
              placeholder="Buscar por e-mail ou nome..." 
              className="w-full pl-10 pr-4 py-2 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-lg text-sm text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="bg-slate-50 dark:bg-slate-950 text-slate-500 dark:text-slate-400 text-xs font-semibold uppercase tracking-wider">
                <th className="px-6 py-4">Contato</th>
                <th className="px-6 py-4">Status</th>
                <th className="px-6 py-4">Tags</th>
                <th className="px-6 py-4">Data de Cadastro</th>
                <th className="px-6 py-4"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800 text-slate-700 dark:text-slate-300">
              {mockContacts.map((contact) => (
                <tr key={contact.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-900/30 transition-colors group">
                  <td className="px-6 py-4">
                    <div className="flex items-center">
                      <div className="w-10 h-10 rounded-full bg-brand-100 dark:bg-slate-850 text-brand-700 dark:text-brand-400 flex items-center justify-center font-bold mr-3 shadow-inner">
                        {contact.firstName[0]}{contact.lastName[0]}
                      </div>
                      <div>
                        <div className="font-semibold text-slate-900 dark:text-white">{contact.firstName} {contact.lastName}</div>
                        <div className="text-xs text-slate-500 dark:text-slate-400 flex items-center">
                          <Mail size={12} className="mr-1" />
                          {contact.email}
                        </div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase border ${
                      contact.status === 'subscribed' 
                        ? 'bg-emerald-50 dark:bg-emerald-950/20 text-emerald-700 dark:text-emerald-400 border-emerald-100 dark:border-emerald-900/50' 
                        : 'bg-slate-100 dark:bg-slate-800 text-slate-400 dark:text-slate-500 border-slate-200 dark:border-slate-750'
                    }`}>
                      {contact.status === 'subscribed' ? 'Inscrito' : 'Descadastrado'}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex flex-wrap gap-1">
                      {contact.tags.map((tag, idx) => (
                        <span key={idx} className="text-[10px] bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400 px-1.5 py-0.5 rounded-md border border-slate-200 dark:border-slate-750">
                          {tag}
                        </span>
                      ))}
                    </div>
                  </td>
                  <td className="px-6 py-4 text-sm text-slate-500 dark:text-slate-400">
                    {contact.addedAt}
                  </td>
                  <td className="px-6 py-4 text-right">
                    <button className="text-slate-400 hover:text-brand-600 opacity-0 group-hover:opacity-100 transition-all">
                      <ExternalLink size={18} />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default Audience;

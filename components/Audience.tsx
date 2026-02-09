
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
          <h1 className="text-3xl font-bold">Público</h1>
          <p className="text-slate-500">Gerencie seus inscritos e lista de clientes.</p>
        </div>
        <div className="flex space-x-3">
          <button className="flex items-center space-x-2 px-4 py-2 border rounded-xl text-sm font-semibold hover:bg-white bg-slate-50 transition-colors">
            <Download size={18} />
            <span>Exportar CSV</span>
          </button>
          <button className="bg-indigo-600 text-white px-5 py-2.5 rounded-xl font-semibold flex items-center space-x-2 shadow-lg shadow-indigo-200 hover:bg-indigo-700 transition-all">
            <UserPlus size={20} />
            <span>Adicionar Contato</span>
          </button>
        </div>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white p-6 rounded-2xl border shadow-sm">
          <p className="text-slate-500 text-xs font-bold uppercase tracking-wider mb-1">Inscritos</p>
          <p className="text-3xl font-bold text-slate-900">12.104</p>
          <div className="mt-4 w-full bg-slate-100 h-2 rounded-full overflow-hidden">
            <div className="bg-emerald-500 h-full w-[94%]"></div>
          </div>
        </div>
        <div className="bg-white p-6 rounded-2xl border shadow-sm">
          <p className="text-slate-500 text-xs font-bold uppercase tracking-wider mb-1">Descadastrados</p>
          <p className="text-3xl font-bold text-slate-900">738</p>
          <div className="mt-4 w-full bg-slate-100 h-2 rounded-full overflow-hidden">
            <div className="bg-rose-500 h-full w-[6%]"></div>
          </div>
        </div>
        <div className="bg-white p-6 rounded-2xl border shadow-sm">
          <p className="text-slate-500 text-xs font-bold uppercase tracking-wider mb-1">Taxa de Crescimento</p>
          <p className="text-3xl font-bold text-slate-900">+4,2%</p>
          <p className="text-xs text-emerald-600 font-medium mt-2">vs último mês</p>
        </div>
      </div>

      <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
        <div className="p-4 border-b flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
            <input 
              type="text" 
              placeholder="Buscar por e-mail ou nome..." 
              className="w-full pl-10 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="bg-slate-50 text-slate-500 text-xs font-semibold uppercase tracking-wider">
                <th className="px-6 py-4">Contato</th>
                <th className="px-6 py-4">Status</th>
                <th className="px-6 py-4">Tags</th>
                <th className="px-6 py-4">Data de Cadastro</th>
                <th className="px-6 py-4"></th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {mockContacts.map((contact) => (
                <tr key={contact.id} className="hover:bg-slate-50/50 transition-colors group">
                  <td className="px-6 py-4">
                    <div className="flex items-center">
                      <div className="w-10 h-10 rounded-full bg-indigo-100 text-indigo-700 flex items-center justify-center font-bold mr-3 shadow-inner">
                        {contact.firstName[0]}{contact.lastName[0]}
                      </div>
                      <div>
                        <div className="font-semibold text-slate-900">{contact.firstName} {contact.lastName}</div>
                        <div className="text-xs text-slate-500 flex items-center">
                          <Mail size={12} className="mr-1" />
                          {contact.email}
                        </div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase border ${
                      contact.status === 'subscribed' ? 'bg-emerald-50 text-emerald-700 border-emerald-100' : 'bg-slate-100 text-slate-400 border-slate-200'
                    }`}>
                      {contact.status === 'subscribed' ? 'Inscrito' : 'Descadastrado'}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex flex-wrap gap-1">
                      {contact.tags.map((tag, idx) => (
                        <span key={idx} className="text-[10px] bg-slate-100 text-slate-500 px-1.5 py-0.5 rounded-md border">
                          {tag}
                        </span>
                      ))}
                    </div>
                  </td>
                  <td className="px-6 py-4 text-sm text-slate-500">
                    {contact.addedAt}
                  </td>
                  <td className="px-6 py-4 text-right">
                    <button className="text-slate-400 hover:text-indigo-600 opacity-0 group-hover:opacity-100 transition-all">
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

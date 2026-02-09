import React, { useState, useEffect } from 'react';
import { DataService } from '../services/dataService';
import { Search, ArrowRight } from 'lucide-react';

interface ArticlesPageProps {
  initialPillar?: string;
}

const ArticlesPage: React.FC<ArticlesPageProps> = ({ initialPillar }) => {
  const [selectedPillar, setSelectedPillar] = useState(initialPillar || 'all');
  const [search, setSearch] = useState('');
  const [articles, setArticles] = useState([]);
  const [pillars, setPillars] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      const [artData, pilData] = await Promise.all([
        DataService.getArticles(100),
        DataService.getPillars()
      ]);
      setArticles(artData);
      setPillars(pilData);
      setLoading(false);
    };
    loadData();
  }, []);

  // Atualizar filtro quando initialPillar mudar
  useEffect(() => {
    if (initialPillar) {
      setSelectedPillar(initialPillar);
    }
  }, [initialPillar]);

  const filteredArticles = articles.filter(article => {
    // ✅ CORRIGIDO: Usa pillarIds.includes() ao invés de pillarId
    const matchesPillar = selectedPillar === 'all' || article.pillarIds.includes(selectedPillar);
    const matchesSearch = article.title.toLowerCase().includes(search.toLowerCase()) || 
                          article.excerpt.toLowerCase().includes(search.toLowerCase());
    return matchesPillar && matchesSearch;
  });

  const handlePillarClick = (pillarId: string) => {
    setSelectedPillar(pillarId);
    // Atualiza URL sem recarregar página
    if (pillarId === 'all') {
      window.history.replaceState(null, '', '#/artigos');
    } else {
      window.history.replaceState(null, '', `#/artigos?pilar=${pillarId}`);
    }
  };

  return (
    <main className="pt-24 min-h-screen bg-white">
      <div className="max-w-6xl mx-auto px-6 pb-20">
        <header className="mb-16">
          <h1 className="text-6xl font-bold tracking-tight mb-4">Biblioteca de Ideias</h1>
          <p className="text-2xl text-gray-500 font-medium max-w-2xl">
            Exploração profunda sobre nossos pilares de conteúdo, mentoria e mercado.
          </p>
        </header>

        <div className="flex flex-col md:flex-row gap-12 mb-12">
          <div className="w-full md:w-64 space-y-10">
            <div className="relative group">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-blue-500 transition-colors" size={18} />
              <input 
                type="text" 
                placeholder="Buscar artigos..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full pl-12 pr-4 py-3 bg-gray-50 rounded-2xl outline-none focus:ring-2 focus:ring-blue-500/20 border border-gray-100 transition-all font-medium"
              />
            </div>

            <div>
              <h4 className="text-[10px] font-bold text-gray-400 uppercase tracking-[0.2em] mb-6">Filtrar por Pilar</h4>
              <div className="space-y-1">
                <button 
                  onClick={() => handlePillarClick('all')} 
                  className={`w-full text-left px-4 py-2.5 rounded-xl text-sm transition-all flex items-center justify-between group ${selectedPillar === 'all' ? 'bg-blue-600 text-white font-bold shadow-lg shadow-blue-500/20' : 'text-gray-500 hover:bg-gray-100'}`}
                >
                  Todos os Pilares {selectedPillar === 'all' && <ArrowRight size={14} />}
                </button>
                {pillars.map(p => (
                  <button 
                    key={p.id} 
                    onClick={() => handlePillarClick(p.id)} 
                    className={`w-full text-left px-4 py-2.5 rounded-xl text-sm transition-all flex items-center justify-between group ${selectedPillar === p.id ? 'bg-blue-600 text-white font-bold shadow-lg shadow-blue-500/20' : 'text-gray-500 hover:bg-gray-100'}`}
                  >
                    {p.title} {selectedPillar === p.id && <ArrowRight size={14} />}
                  </button>
                ))}
              </div>
            </div>
          </div>

          <div className="flex-1">
            {loading ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                {[...Array(4)].map((_, i) => <div key={i} className="aspect-video rounded-3xl bg-gray-50 animate-pulse"></div>)}
              </div>
            ) : filteredArticles.length === 0 ? (
              <div className="text-center py-20">
                <p className="text-gray-400 text-lg">Nenhum artigo encontrado.</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-x-10 gap-y-16">
                {filteredArticles.map(article => (
                  <a 
                    key={article.id} 
                    href={`#/artigo/${article.id}?from=${selectedPillar}`}
                    className="group cursor-pointer flex flex-col"
                  >
                    <div className="aspect-[16/10] rounded-[32px] overflow-hidden mb-6 bg-gray-100 shadow-sm border border-gray-100">
                      <img src={article.imageUrl} alt={article.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700" />
                    </div>
                    <div className="flex items-center gap-3 mb-4">
                      <span className="px-3 py-1 bg-blue-50 text-blue-600 text-[9px] font-bold uppercase tracking-widest rounded-full">{article.category}</span>
                    </div>
                    <h3 className="text-2xl font-bold mb-4 leading-tight group-hover:text-blue-600 transition-colors line-clamp-2">{article.title}</h3>
                    <p className="text-gray-500 leading-relaxed mb-6 line-clamp-3 text-sm font-medium">{article.excerpt}</p>
                    <div className="mt-auto">
                      <span className="text-blue-600 font-bold text-sm inline-flex items-center gap-1">Ler artigo completo <ArrowRight size={16} /></span>
                    </div>
                  </a>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </main>
  );
};

export default ArticlesPage;

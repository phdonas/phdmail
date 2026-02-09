import React, { useState, useEffect } from 'react';
import { DataService } from '../services/dataService';
import { ArrowRight } from 'lucide-react';

interface ArticleGalleryProps {
  limit?: number;
}

const ArticleGallery: React.FC<ArticleGalleryProps> = ({ limit = 6 }) => {
  const [selectedPillar, setSelectedPillar] = useState('all');
  const [articles, setArticles] = useState([]);
  const [pillars, setPillars] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      const [artData, pilData] = await Promise.all([
        DataService.getArticles(30),
        DataService.getPillars()
      ]);
      setArticles(artData);
      setPillars(pilData);
      setLoading(false);
    };
    loadData();
  }, []);

  // ✅ CORRIGIDO: Usa pillarIds.includes() ao invés de pillarId
  const filteredArticles = articles.filter(article => 
    selectedPillar === 'all' || article.pillarIds.includes(selectedPillar)
  ).slice(0, limit);

  return (
    <section className="py-24 px-6 bg-white">
      <div className="max-w-6xl mx-auto">
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-16 gap-6">
          <div>
            <h2 className="text-4xl md:text-5xl font-bold mb-4 tracking-tight">Insights & Pensamento</h2>
            <p className="text-gray-500 text-lg font-medium">Os últimos artigos divididos por pilares de conhecimento.</p>
          </div>
          <a href="#/artigos" className="text-blue-600 font-bold flex items-center gap-2 hover:underline">
            Ver toda biblioteca <ArrowRight size={16} />
          </a>
        </div>

        {/* Filtros */}
        <div className="flex flex-wrap gap-3 mb-12">
          <button
            onClick={() => setSelectedPillar('all')}
            className={`px-6 py-2.5 rounded-full text-sm font-bold transition-all ${
              selectedPillar === 'all'
                ? 'bg-black text-white'
                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            }`}
          >
            TODOS
          </button>
          {pillars.map(pillar => (
            <button
              key={pillar.id}
              onClick={() => setSelectedPillar(pillar.id)}
              className={`px-6 py-2.5 rounded-full text-sm font-bold uppercase transition-all ${
                selectedPillar === pillar.id
                  ? 'bg-black text-white'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              {pillar.title}
            </button>
          ))}
        </div>

        {/* Grid de Artigos */}
        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[...Array(limit)].map((_, i) => (
              <div key={i} className="aspect-video rounded-3xl bg-gray-50 animate-pulse"></div>
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-x-10 gap-y-16">
            {filteredArticles.map(article => (
              <a
                key={article.id}
                href={`#/artigo/${article.id}?from=${selectedPillar}`}
                className="group cursor-pointer flex flex-col"
              >
                <div className="aspect-[16/10] rounded-[32px] overflow-hidden mb-6 bg-gray-100 shadow-sm border border-gray-100">
                  <img
                    src={article.imageUrl}
                    alt={article.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                  />
                </div>
                <div className="flex items-center gap-3 mb-4">
                  <span className="px-3 py-1 bg-blue-50 text-blue-600 text-[9px] font-bold uppercase tracking-widest rounded-full">
                    {article.category}
                  </span>
                </div>
                <h3 className="text-2xl font-bold mb-4 leading-tight group-hover:text-blue-600 transition-colors line-clamp-2">
                  {article.title}
                </h3>
                <p className="text-gray-500 leading-relaxed mb-6 line-clamp-3 text-sm font-medium">
                  {article.excerpt}
                </p>
                <div className="mt-auto">
                  <span className="text-blue-600 font-bold text-sm inline-flex items-center gap-1">
                    Ler artigo completo <ArrowRight size={16} />
                  </span>
                </div>
              </a>
            ))}
          </div>
        )}
      </div>
    </section>
  );
};

export default ArticleGallery;

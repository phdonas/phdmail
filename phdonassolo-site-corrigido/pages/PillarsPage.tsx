import React, { useEffect, useState } from 'react';
import { PILLARS } from '../constants';
import { DataService } from '../services/dataService';
import { ArrowRight } from 'lucide-react';

const PillarRecentArticles = ({ pillarId, pillarTitle }) => {
  const [articles, setArticles] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    DataService.getArticlesByPillar(pillarId, 3).then(data => {
      setArticles(data);
      setLoading(false);
    });
  }, [pillarId]);

  return (
    <div className="bg-[#f5f5f7] rounded-[48px] p-8 md:p-16">
      <h3 className="text-2xl font-bold mb-10">Recentes em {pillarTitle}</h3>
      {loading ? (
        <div className="flex gap-4">
          {[1, 2, 3].map(i => <div key={i} className="flex-1 aspect-video bg-gray-200 rounded-2xl animate-pulse"></div>)}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {articles.map(article => (
            <a key={article.id} href={`#/artigo/${article.id}`} className="group block">
              <div className="aspect-[16/9] rounded-2xl overflow-hidden mb-6 bg-white shadow-sm">
                <img src={article.imageUrl} alt={article.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
              </div>
              <h4 className="text-lg font-bold group-hover:text-blue-600 transition-colors leading-snug">{article.title}</h4>
            </a>
          ))}
        </div>
      )}
    </div>
  );
};

const PillarsPage = () => {
  useEffect(() => {
    if (window.location.hash) {
      const parts = window.location.hash.split('#');
      const id = parts[parts.length - 1];
      if (id && id !== '/pilares') {
        const element = document.getElementById(id);
        if (element) {
          setTimeout(() => element.scrollIntoView({ behavior: 'smooth' }), 100);
        }
      }
    }
  }, []);

  return (
    <main className="pt-24 min-h-screen bg-white">
      <div className="max-w-6xl mx-auto px-6 pb-20">
        <header className="py-20 text-center">
          <h1 className="text-6xl md:text-8xl font-bold tracking-tight mb-8">Nossos Pilares.</h1>
        </header>

        <div className="space-y-32">
          {PILLARS.map((pillar) => (
            <section key={pillar.id} id={pillar.id} className="scroll-mt-32">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center mb-16">
                <div>
                  <span className="text-sm font-bold uppercase tracking-widest mb-4 block" style={{ color: pillar.accentColor }}>{pillar.title}</span>
                  <h2 className="text-4xl md:text-5xl font-bold mb-6 tracking-tight leading-tight">{pillar.description}</h2>
                  <p className="text-xl text-gray-500 leading-relaxed mb-8">{pillar.longDescription}</p>
                </div>
                <div className="rounded-[48px] overflow-hidden aspect-[4/3] bg-gray-100">
                  <img src={pillar.imageUrl} alt={pillar.title} className="w-full h-full object-cover" />
                </div>
              </div>
              <PillarRecentArticles pillarId={pillar.id} pillarTitle={pillar.title} />
            </section>
          ))}
        </div>
      </div>
    </main>
  );
};

export default PillarsPage;
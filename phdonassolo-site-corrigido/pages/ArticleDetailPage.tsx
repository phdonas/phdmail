import { useState, useEffect } from 'react';
import { DataService } from '../services/dataService';
import { Article, PillarId } from '../types';

interface ArticleDetailPageProps {
  articleId: string;
  activePillar?: string;
}

const ArticleDetailPage = ({ articleId, activePillar }: ArticleDetailPageProps) => {
  const [article, setArticle] = useState<Article | null>(null);
  const [prevArticle, setPrevArticle] = useState<Article | null>(null);
  const [nextArticle, setNextArticle] = useState<Article | null>(null);
  const [loading, setLoading] = useState(true);

  // Helper para validar se string é um PillarId válido
  const isValidPillarId = (value: string | undefined): value is PillarId => {
    if (!value) return false;
    const validPillars: PillarId[] = ['prof-paulo', 'consultoria-imobiliaria', '4050oumais', 'academia-do-gas'];
    return validPillars.includes(value as PillarId);
  };

  useEffect(() => {
    const loadArticle = async () => {
      setLoading(true);
      try {
        const currentArticle = await DataService.getArticleById(articleId);
        setArticle(currentArticle || null);

        if (currentArticle) {
          // Usa activePillar se fornecido E válido E o artigo contém esse pilar
          let primaryPillar: PillarId = currentArticle.pillarIds[0];
          
          // ✅ CORRIGIDO: Verifica 'all' ANTES do type guard
          if (activePillar && activePillar !== 'all' && isValidPillarId(activePillar) && currentArticle.pillarIds.includes(activePillar)) {
            primaryPillar = activePillar;
          }
          
          const allArticles = await DataService.getAllArticles();
          
          const samePillarArticles = allArticles
            .filter(a => a.pillarIds.includes(primaryPillar))
            .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

          const currentIndex = samePillarArticles.findIndex(a => a.id === articleId);

          if (currentIndex > 0) {
            setNextArticle(samePillarArticles[currentIndex - 1]);
          } else {
            setNextArticle(null);
          }

          if (currentIndex < samePillarArticles.length - 1) {
            setPrevArticle(samePillarArticles[currentIndex + 1]);
          } else {
            setPrevArticle(null);
          }
        }
      } catch (error) {
        console.error('Erro ao carregar artigo:', error);
      } finally {
        setLoading(false);
      }
    };

    loadArticle();
  }, [articleId, activePillar]);

  const getPillarName = (pillarId: string) => {
    const names: Record<string, string> = {
      'prof-paulo': 'Professor Paulo',
      'consultoria-imobiliaria': 'Consultoria Imobiliária',
      '4050oumais': '4050oumais',
      'academia-do-gas': 'Academia do Gás'
    };
    return names[pillarId] || 'Artigos';
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="w-12 h-12 border-2 border-gray-100 border-t-blue-600 rounded-full animate-spin mx-auto mb-4"></div>
          <p>Carregando artigo...</p>
        </div>
      </div>
    );
  }

  if (!article) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold mb-4">Artigo não encontrado</h2>
          <a href="#/artigos" className="text-blue-600 hover:underline">Voltar para Artigos</a>
        </div>
      </div>
    );
  }

  // ✅ CORRIGIDO: Verifica 'all' ANTES do type guard
  let primaryPillar: PillarId = article.pillarIds[0];
  if (activePillar && activePillar !== 'all' && isValidPillarId(activePillar) && article.pillarIds.includes(activePillar)) {
    primaryPillar = activePillar;
  }

  return (
    <div className="bg-white min-h-screen">
      <div className="bg-gray-50 border-b">
        <div className="max-w-4xl mx-auto px-6 py-6">
          <button
            onClick={() => { window.location.hash = `#/artigos?pilar=${primaryPillar}`; }}
            className="flex items-center gap-2 text-blue-600 hover:text-blue-800 transition"
          >
            <span>← Voltar para {getPillarName(primaryPillar)}</span>
          </button>
        </div>
      </div>

      <article className="max-w-4xl mx-auto px-6 py-12">
        <div className="mb-4 flex flex-wrap gap-2">
          {article.pillarIds.map(pillarId => (
            <span key={pillarId} className="inline-block px-4 py-1 bg-blue-100 text-blue-800 rounded-full text-sm font-medium">
              {getPillarName(pillarId)}
            </span>
          ))}
        </div>

        <h1 className="text-4xl md:text-5xl font-bold mb-6">{article.title}</h1>

        <div className="flex items-center gap-4 text-gray-500 mb-8 pb-8 border-b">
          <time>{new Date(article.date).toLocaleDateString('pt-BR', { day: 'numeric', month: 'long', year: 'numeric' })}</time>
        </div>

        {article.imageUrl && (
          <div className="mb-12">
            <img src={article.imageUrl} alt={article.title} className="w-full h-auto max-h-[600px] object-cover rounded-2xl shadow-lg" />
          </div>
        )}

        <div className="article-content prose prose-lg max-w-none" dangerouslySetInnerHTML={{ __html: article.content }} />
      </article>

      <div className="max-w-4xl mx-auto px-6 pb-16">
        <div className="pt-12 border-t">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {prevArticle && (
              <a href={`#/artigo/${prevArticle.id}?from=${primaryPillar}`} target="_blank" rel="noopener noreferrer" className="group p-6 bg-gray-50 rounded-xl hover:bg-gray-100 transition border">
                <p className="text-xs text-gray-500 uppercase mb-2">Post Anterior</p>
                <h3 className="font-semibold text-gray-900 group-hover:text-blue-600 line-clamp-2">{prevArticle.title}</h3>
              </a>
            )}

            {nextArticle && (
              <a href={`#/artigo/${nextArticle.id}?from=${primaryPillar}`} target="_blank" rel="noopener noreferrer" className="group p-6 bg-gray-50 rounded-xl hover:bg-gray-100 transition border md:text-right">
                <p className="text-xs text-gray-500 uppercase mb-2">Próximo Post</p>
                <h3 className="font-semibold text-gray-900 group-hover:text-blue-600 line-clamp-2">{nextArticle.title}</h3>
              </a>
            )}
          </div>
        </div>
        
        <div className="mt-12 text-center">
          <button
            onClick={() => window.location.hash = `#/artigos?pilar=${primaryPillar}`}
            className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
          >
            Ver Mais Artigos de {getPillarName(primaryPillar)}
          </button>
        </div>
      </div>

      <style>{`
        .article-content { line-height: 1.8; color: #1d1d1f; }
        .article-content h1 { font-size: 2em; font-weight: 700; margin: 1.5em 0 0.5em; }
        .article-content h2 { font-size: 1.75em; font-weight: 700; margin: 1.3em 0 0.5em; }
        .article-content h3 { font-size: 1.5em; font-weight: 600; margin: 1.2em 0 0.5em; }
        .article-content p { margin: 1.2em 0; }
        .article-content ul, .article-content ol { margin: 1.5em 0; padding-left: 2em; }
        .article-content table { width: 100%; border-collapse: collapse; margin: 2em 0; }
        .article-content table th, .article-content table td { border: 1px solid #d2d2d7; padding: 12px; }
        .article-content table th { background-color: #f5f5f7; font-weight: 600; }
        .article-content blockquote { border-left: 4px solid #0071e3; padding-left: 1.5em; margin: 2em 0; font-style: italic; }
        .article-content img { max-width: 100%; height: auto; margin: 2em 0; border-radius: 12px; }
        .article-content a { color: #0071e3; text-decoration: underline; }
        .article-content code { background-color: #f5f5f7; padding: 3px 8px; border-radius: 4px; }
        .article-content pre { background-color: #1d1d1f; color: #f5f5f7; padding: 1.5em; border-radius: 8px; overflow-x: auto; margin: 2em 0; }
      `}</style>
    </div>
  );
};

export default ArticleDetailPage;

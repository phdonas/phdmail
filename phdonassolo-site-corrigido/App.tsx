import React, { useState, useEffect } from 'react';
import Navbar from './components/Navbar.tsx';
import HomePage from './pages/HomePage.tsx';
import LoginPage from './pages/LoginPage.tsx';
import AdminPage from './pages/AdminPage.tsx';
import ArticlesPage from './pages/ArticlesPage.tsx';
import ArticleDetailPage from './pages/ArticleDetailPage.tsx';
import CourseDetailPage from './pages/CourseDetailPage.tsx';
import ServicesPage from './pages/ServicesPage.tsx';
import DownloadsPage from './pages/DownloadsPage.tsx';
import ContactPage from './pages/ContactPage.tsx';
import PillarsPage from './pages/PillarsPage.tsx';
import TrilhasPage from './pages/TrilhasPage.tsx';
import CoursesBooksPage from './pages/CoursesBooksPage.tsx';
import PrivacyPage from './pages/PrivacyPage.tsx';
import NotFoundPage from './pages/NotFoundPage.tsx';
import WhatsAppButton from './components/WhatsAppButton.tsx';
import { SITE_CONFIG } from './config/site-config.ts';
import { DataService } from './services/dataService.ts';

const App = () => {
  const [currentHash, setCurrentHash] = useState(window.location.hash || '#/');

  useEffect(() => {
    // Warm-up data
    DataService.getArticles(10).catch(() => {});
    DataService.getVideos(4).catch(() => {});

    const handleHashChange = () => {
      setCurrentHash(window.location.hash || '#/');
      if (!window.location.hash.includes('#/pilares#')) {
        window.scrollTo({ top: 0, behavior: 'instant' });
      }
    };
    window.addEventListener('hashchange', handleHashChange);
    return () => window.removeEventListener('hashchange', handleHashChange);
  }, []);

  // Helper para extrair parâmetros da URL
  const getUrlParams = (hash: string) => {
    const [path, queryString] = hash.split('?');
    const params: Record<string, string> = {};
    
    if (queryString) {
      queryString.split('&').forEach(param => {
        const [key, value] = param.split('=');
        if (key && value) {
          params[key] = decodeURIComponent(value);
        }
      });
    }
    
    return { path, params };
  };

  const renderContent = () => {
    const { path, params } = getUrlParams(currentHash);
    
    if (path.startsWith('#/artigo/')) {
      const articleId = path.split('/artigo/')[1];
      if (articleId) return <ArticleDetailPage articleId={articleId} activePillar={params.from} />;
    }
    
    if (path.startsWith('#/curso/')) {
      const courseId = path.split('/curso/')[1];
      if (courseId) return <CourseDetailPage courseId={courseId} />;
    }

    switch (path) {
      case '#/': 
      case '#': 
      case '': return <HomePage />;
      case '#/login': return <LoginPage />;
      case '#/admin': return <AdminPage />;
      case '#/artigos': return <ArticlesPage initialPillar={params.pilar} />;
      case '#/servicos': return <ServicesPage />;
      case '#/downloads': return <DownloadsPage />;
      case '#/contato': return <ContactPage />;
      case '#/trilhas': return <TrilhasPage />;
      case '#/livros': return <CoursesBooksPage />;
      case '#/privacidade': return <PrivacyPage />;
      default: 
        if (path.startsWith('#/pilares')) return <PillarsPage />;
        return <NotFoundPage />;
    }
  };

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <div className="flex-1">{renderContent()}</div>
      
      <WhatsAppButton />

      <footer className="py-24 px-6 bg-[#f5f5f7] border-t border-gray-200">
        <div className="max-w-6xl mx-auto">
          <div className="grid grid-cols-2 md:grid-cols-5 gap-12 mb-20">
            <div className="col-span-2">
              <h3 className="text-xl font-bold mb-6 tracking-tighter uppercase">{SITE_CONFIG.name}</h3>
              <p className="text-gray-500 text-sm leading-relaxed max-w-xs">{SITE_CONFIG.footer.description}</p>
              <div className="mt-8">
                <a href="#/admin" className="text-[10px] text-gray-400 hover:text-black uppercase tracking-[0.2em] font-bold transition-colors">Acesso Administrativo</a>
              </div>
            </div>
            <div>
              <h4 className="font-bold text-[10px] uppercase text-gray-400 mb-8 tracking-[0.2em]">Conteúdo</h4>
              <ul className="text-sm space-y-5 text-gray-600 font-medium">
                <li><a href="#/artigos" className="hover:text-blue-600 transition-colors">Artigos & Insights</a></li>
                <li><a href="#/downloads" className="hover:text-blue-600 transition-colors">Downloads Gratuitos</a></li>
                <li><a href="#/livros" className="hover:text-blue-600 transition-colors">Cursos & Livros</a></li>
                <li><a href="#/contato" className="hover:text-blue-600 transition-colors">Fale Conosco</a></li>
              </ul>
            </div>
            <div>
              <h4 className="font-bold text-[10px] uppercase text-gray-400 mb-8 tracking-[0.2em]">Pilares</h4>
              <ul className="text-sm space-y-5 text-gray-600 font-medium">
                <li><a href="#/pilares#prof-paulo" className="hover:text-blue-600 transition-colors">Prof. Paulo</a></li>
                <li><a href="#/pilares#consultoria-imobiliaria" className="hover:text-blue-600 transition-colors">Consultoria</a></li>
                <li><a href="#/pilares#4050oumais" className="hover:text-blue-600 transition-colors">4050oumais</a></li>
                <li><a href="#/pilares#academia-do-gas" className="hover:text-blue-600 transition-colors">Academia do Gás</a></li>
              </ul>
            </div>
            <div>
              <h4 className="font-bold text-[10px] uppercase text-gray-400 mb-8 tracking-[0.2em]">Legal</h4>
              <ul className="text-sm space-y-5 text-gray-600 font-medium">
                <li><a href="#/privacidade" className="hover:text-blue-600 transition-colors">Privacidade</a></li>
                <li><a href="#/login" className="hover:text-blue-600 transition-colors">Área do Aluno</a></li>
              </ul>
            </div>
          </div>
          <div className="pt-10 border-t border-gray-200 text-[11px] text-gray-400 flex flex-col md:flex-row justify-between items-center gap-6">
            <p className="font-medium">{SITE_CONFIG.footer.copyright}</p>
            <div className="flex items-center gap-8 font-bold uppercase tracking-[0.1em]">
              <span className="text-gray-300">Design with Excellence</span>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default App;

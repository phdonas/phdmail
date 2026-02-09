import React, { useState, useEffect } from 'react';
import Hero from '../components/Hero';
import PillarGrid from '../components/PillarGrid';
import ArticleGallery from '../components/ArticleGallery';
import ServicesSection from '../components/ServicesSection';
import LeadForm from '../components/LeadForm';
import VideoModal from '../components/VideoModal';
import { MOCK_VIDEOS } from '../constants'; // ← USANDO DADOS DO CÓDIGO
import { Video } from '../types';
import { Play } from 'lucide-react';

const HomePage = () => {
  const [videos, setVideos] = useState<Video[]>([]);
  const [loadingVideos, setLoadingVideos] = useState(true);
  const [selectedVideo, setSelectedVideo] = useState<Video | null>(null);

  useEffect(() => {
    // Simula carregamento (opcional, pode remover depois)
    setTimeout(() => {
      setVideos(MOCK_VIDEOS.slice(0, 6)); // Pega os 6 primeiros vídeos
      setLoadingVideos(false);
    }, 300);
  }, []);

  return (
    <main>
      <Hero />
      <PillarGrid />
      <ServicesSection />
      
      <section className="py-24 px-6 bg-black text-white overflow-hidden">
        <div className="max-w-6xl mx-auto">
          <div className="flex flex-col md:flex-row md:items-end justify-between mb-16 gap-6">
            <div className="max-w-xl">
              <h2 className="text-4xl md:text-5xl font-bold mb-4 tracking-tight">Aulas Curtas & Insights</h2>
              <p className="text-gray-400 text-lg font-medium">Conteúdo visual direto ao ponto para sua evolução.</p>
            </div>
            <a href="#/artigos" className="text-blue-500 font-bold flex items-center gap-2 hover:underline">
              Ver todos os vídeos <Play size={16} />
            </a>
          </div>
          
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {loadingVideos ? (
              [...Array(6)].map((_, i) => (
                <div key={i} className="aspect-[9/16] bg-gray-900 rounded-[32px] animate-pulse"></div>
              ))
            ) : videos.map((video) => (
              <button
                key={video.id}
                onClick={() => setSelectedVideo(video)}
                className="aspect-[9/16] bg-gray-900 rounded-[32px] overflow-hidden relative group cursor-pointer border border-white/5 hover:border-white/20 transition-all"
              >
                <img src={video.thumb} alt={video.title} className="w-full h-full object-cover opacity-50 group-hover:opacity-70 group-hover:scale-105 transition-all duration-700" />
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="w-14 h-14 bg-white/10 backdrop-blur-xl rounded-full flex items-center justify-center group-hover:scale-110 transition-transform border border-white/20">
                    <div className="w-0 h-0 border-t-[8px] border-t-transparent border-l-[14px] border-l-white border-b-[8px] border-b-transparent ml-1"></div>
                  </div>
                </div>
                <div className="absolute bottom-6 left-6 right-6">
                  <p className="text-sm font-bold leading-tight drop-shadow-lg">{video.title}</p>
                </div>
              </button>
            ))}
          </div>
        </div>
      </section>

      <ArticleGallery limit={6} />
      <LeadForm />

      {/* VIDEO MODAL */}
      {selectedVideo && (
        <VideoModal 
          video={selectedVideo} 
          onClose={() => setSelectedVideo(null)} 
        />
      )}
    </main>
  );
};

export default HomePage;

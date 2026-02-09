import React, { useState, useEffect } from 'react';
import { DataService } from '../services/dataService';
import { ArrowLeft, Play, ExternalLink, ShieldCheck, Check } from 'lucide-react';
import VideoModal from '../components/VideoModal';
import { Video } from '../types';

const CourseDetailPage = ({ courseId }) => {
  const [course, setCourse] = useState(null);
  const [loading, setLoading] = useState(true);
  const [selectedVideo, setSelectedVideo] = useState<Video | null>(null);

  useEffect(() => {
    const loadData = async () => {
      const data = await DataService.getCourseById(courseId);
      setCourse(data || null);
      setLoading(false);
    };
    loadData();
  }, [courseId]);

  const handleVideoClick = (video: any, index: number) => {
    // Converter vídeo do curso para formato Video esperado pelo VideoModal
    const videoForModal: Video = {
      id: `${courseId}-video-${index}`,
      title: video.titulo,
      excerpt: course.description,
      thumb: video.thumbnail,
      url: video.url,
      pillarIds: ['prof-paulo'] // Default, pode ser ajustado
    };
    setSelectedVideo(videoForModal);
  };

  if (loading) return <div className="pt-40 text-center font-medium text-gray-400">Carregando detalhes...</div>;

  if (!course) {
    return (
      <main className="pt-32 min-h-screen bg-white flex flex-col items-center justify-center text-center px-6">
        <h1 className="text-4xl font-bold mb-4">Curso não encontrado.</h1>
        <a href="#/livros" className="bg-blue-600 text-white px-8 py-3 rounded-full font-bold">Voltar</a>
      </main>
    );
  }

  return (
    <main className="bg-white min-h-screen">
      {/* HERO HEADER */}
      <header className="pt-32 pb-16 px-6 bg-[#f5f5f7]">
        <div className="max-w-6xl mx-auto">
          <div className="flex items-center gap-4 mb-8">
            <a href="#/livros" className="w-10 h-10 rounded-full bg-white flex items-center justify-center shadow-sm">
              <ArrowLeft size={20} />
            </a>
            <span className="text-blue-600 font-bold uppercase tracking-widest text-xs">{course.category}</span>
          </div>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div>
              <h1 className="text-5xl font-bold tracking-tight mb-8 leading-tight">{course.name}</h1>
              <p className="text-xl text-gray-500 font-medium leading-relaxed mb-10">{course.description}</p>
              <a href={course.goUrl || course.salesUrl} target="_blank" rel="noopener noreferrer" className="bg-blue-600 text-white px-10 py-5 rounded-2xl font-bold text-lg inline-flex items-center gap-2 hover:bg-blue-700 transition-all">
                Matricular-se Agora <ExternalLink size={20} />
              </a>
            </div>
            <div className="rounded-[48px] overflow-hidden shadow-2xl aspect-video relative group">
              <img src={course.imageUrl} alt={course.name} className="w-full h-full object-cover" />
              <div className="absolute inset-0 bg-black/20 flex items-center justify-center">
                <Play className="text-white fill-current" size={64} />
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* O QUE VOCÊ APRENDERÁ */}
      {course.learningPoints && course.learningPoints.length > 0 && (
        <section className="py-20 px-6 bg-white border-b border-gray-100">
          <div className="max-w-6xl mx-auto">
            <h2 className="text-3xl font-bold mb-10">O que você aprenderá</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-4">
              {course.learningPoints.map((point, idx) => (
                <div key={idx} className="flex items-start gap-3">
                  <div className="flex-shrink-0 mt-1">
                    <Check size={20} className="text-green-600 font-bold" strokeWidth={3} />
                  </div>
                  <p className="text-gray-700 leading-relaxed">{point}</p>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* CONTEÚDO PRINCIPAL */}
      <section className="py-24 px-6">
        <div className="max-w-6xl mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-16">
            <div className="lg:col-span-2 space-y-12">
              <div>
                <h2 className="text-3xl font-bold mb-6">Sobre o Curso</h2>
                <div className="prose prose-lg text-gray-600">{course.longDescription}</div>
              </div>
              <div>
                <h2 className="text-3xl font-bold mb-8">Prévia do Conteúdo</h2>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  {course.videos.map((video, idx) => (
                    <button
                      key={idx}
                      onClick={() => handleVideoClick(video, idx)}
                      className="group cursor-pointer text-left"
                    >
                      <div className="aspect-video bg-gray-100 rounded-3xl overflow-hidden mb-4 relative">
                        <img src={video.thumbnail} alt={video.titulo} className="w-full h-full object-cover opacity-90 group-hover:opacity-100 transition-opacity" />
                        <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                          <Play className="text-white fill-current" size={48} />
                        </div>
                        <div className="absolute bottom-3 right-3 bg-black/60 text-white text-[10px] font-bold px-2 py-1 rounded">{video.duracao}</div>
                      </div>
                      <h4 className="font-bold text-sm leading-tight group-hover:text-blue-600 transition-colors">{idx + 1}. {video.titulo}</h4>
                    </button>
                  ))}
                </div>
              </div>
            </div>
            <div className="space-y-8">
              <div className="bg-[#f5f5f7] rounded-[40px] p-8 border border-gray-100">
                <div className="flex items-center gap-3 text-green-600 mb-6 font-bold uppercase tracking-widest text-xs">
                  <ShieldCheck size={20} /> Compra Segura
                </div>
                <h3 className="text-2xl font-bold mb-4">Garantia de 30 Dias</h3>
                <p className="text-gray-500 mb-8 text-sm">Experimente o conteúdo e, se não estiver satisfeito, garantimos o reembolso integral.</p>
                <a href={course.goUrl || course.salesUrl} target="_blank" rel="noopener noreferrer" className="w-full bg-black text-white py-4 rounded-2xl font-bold text-center block hover:bg-gray-800 transition-all">
                  Comprar Agora
                </a>
              </div>
            </div>
          </div>
        </div>
      </section>

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

export default CourseDetailPage;

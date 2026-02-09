import React from 'react';

const Hero = () => {
  return (
    <section className="pt-32 pb-20 px-6 text-center bg-white">
      <div className="max-w-4xl mx-auto">
        <h2 className="text-xl font-semibold text-orange-500 mb-2">Novo Site</h2>
        <h1 className="text-5xl md:text-7xl font-bold tracking-tight mb-6">
          Conhecimento para <br />o que vem a seguir.
        </h1>
        <p className="text-xl md:text-2xl text-gray-500 font-medium mb-10 max-w-2xl mx-auto leading-relaxed">
          Hub de conteúdo exclusivo sobre educação, mercado imobiliário e longevidade ativa.
        </p>
        <div className="flex flex-col sm:flex-row items-center justify-center gap-6">
          <a 
            href="#/pilares" 
            className="bg-blue-600 text-white px-8 py-3 rounded-full text-lg font-medium hover:bg-blue-700 transition-all transform hover:scale-105"
          >
            Conheça os Pilares
          </a>
          <a 
            href="#/livros" 
            className="apple-link text-lg font-medium group"
          >
            Ver Livros e Cursos <span className="inline-block transform group-hover:translate-x-1 transition-transform">→</span>
          </a>
        </div>
      </div>
    </section>
  );
};

export default Hero;
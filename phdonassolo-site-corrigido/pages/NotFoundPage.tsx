import React from 'react';
import { Search } from 'lucide-react';

const NotFoundPage = () => {
  return (
    <main className="min-h-screen pt-32 px-6 flex flex-col items-center justify-center bg-white text-center">
      <div className="max-w-md">
        <div className="w-20 h-20 bg-gray-50 text-gray-300 rounded-full flex items-center justify-center mx-auto mb-8">
          <Search size={32} />
        </div>
        <h1 className="text-6xl font-bold tracking-tight mb-6">404</h1>
        <h2 className="text-2xl font-bold mb-4">Página não encontrada.</h2>
        <p className="text-gray-500 font-medium mb-12 leading-relaxed">
          O conteúdo que você procura pode ter sido movido, excluído ou o link digitado está incorreto.
        </p>
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <a href="#/" className="bg-blue-600 text-white px-10 py-4 rounded-full font-bold hover:bg-blue-700 transition-all">
            Ir para a Home
          </a>
          <a href="#/contato" className="bg-gray-100 text-black px-10 py-4 rounded-full font-bold hover:bg-gray-200 transition-all">
            Falar conosco
          </a>
        </div>
      </div>
    </main>
  );
};

export default NotFoundPage;
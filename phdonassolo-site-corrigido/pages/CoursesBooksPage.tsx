
import React from 'react';
import { MOCK_COURSES, MOCK_BOOKS } from '../constants';
import { PlayCircle, ShoppingCart, ArrowUpRight } from 'lucide-react';

const CoursesBooksPage: React.FC = () => {
  return (
    <main className="pt-24 min-h-screen bg-white">
      <div className="max-w-6xl mx-auto px-6 pb-20">
        <header className="py-20">
          <h1 className="text-6xl font-bold tracking-tight mb-4">Aprendizado & Literatura.</h1>
          <p className="text-2xl text-gray-500 font-medium">Explore nossos cursos exclusivos e obras publicadas.</p>
        </header>

        {/* Courses Section */}
        <section className="mb-32">
          <div className="flex items-end justify-between mb-12 border-b border-gray-100 pb-8">
            <h2 className="text-4xl font-bold">Cursos Online</h2>
            <p className="text-gray-400 font-bold uppercase tracking-widest text-xs">Conteúdo sob demanda</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
            {MOCK_COURSES.map(course => (
              <div key={course.id} className="group bg-[#f5f5f7] rounded-[48px] overflow-hidden flex flex-col h-full hover:shadow-2xl transition-all duration-500">
                <div className="relative aspect-video overflow-hidden">
                  <img 
                    src={course.imageUrl} 
                    alt={course.name} 
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                  />
                  <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity bg-black/20">
                    <PlayCircle className="text-white" size={64} />
                  </div>
                  <div className="absolute top-6 left-6">
                    <span className="bg-white/90 backdrop-blur-sm px-4 py-1.5 rounded-full text-[10px] font-bold uppercase tracking-widest">
                      {course.category}
                    </span>
                  </div>
                </div>
                <div className="p-10 flex flex-col flex-1 justify-between">
                  <div>
                    <h3 className="text-3xl font-bold mb-4">{course.name}</h3>
                    <p className="text-gray-500 text-lg leading-relaxed mb-8">
                      {course.description}
                    </p>
                  </div>
                  <div className="flex flex-col gap-3">
                    <a 
                      href={`#/curso/${course.id}`}
                      className="bg-black text-white w-full py-4 rounded-2xl font-bold text-center flex items-center justify-center gap-2 hover:bg-gray-800 transition-all text-lg"
                    >
                      Ver Detalhes
                    </a>
                    <a 
                      href={course.goUrl || course.salesUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="bg-white text-black border border-gray-200 w-full py-4 rounded-2xl font-bold text-center flex items-center justify-center gap-2 hover:bg-gray-50 transition-all text-lg"
                    >
                      Ir para o Curso <ArrowUpRight size={20} />
                    </a>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Books Section */}
        <section>
          <div className="flex items-end justify-between mb-12 border-b border-gray-100 pb-8">
            <h2 className="text-4xl font-bold">Livros Publicados</h2>
            <p className="text-gray-400 font-bold uppercase tracking-widest text-xs">Autoria Prof. Paulo</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {MOCK_BOOKS.map(book => (
              <div key={book.id} className="bg-white rounded-[40px] p-8 border border-gray-100 card-shadow flex flex-col">
                <div className="aspect-[3/4] rounded-2xl overflow-hidden mb-8 shadow-lg">
                  <img 
                    src={book.imageUrl} 
                    alt={book.title} 
                    className="w-full h-full object-cover"
                  />
                </div>
                <div className="flex-1 flex flex-col">
                  <h3 className="text-2xl font-bold mb-4">{book.title}</h3>
                  <p className="text-gray-500 leading-relaxed mb-8">
                    {book.description}
                  </p>
                  <a 
                    href={book.buyUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="mt-auto bg-blue-600 text-white w-full py-3 rounded-xl font-bold text-center flex items-center justify-center gap-2 hover:bg-blue-700 transition-colors"
                  >
                    <ShoppingCart size={18} /> Comprar na Amazon
                  </a>
                </div>
              </div>
            ))}
          </div>
        </section>
      </div>
    </main>
  );
};

export default CoursesBooksPage;

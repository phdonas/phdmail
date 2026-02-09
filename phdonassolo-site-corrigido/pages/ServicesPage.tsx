import React from 'react';
import { ArrowRight, CheckCircle2, Star } from 'lucide-react';

const ServicesPage = () => {
  return (
    <main className="pt-24 min-h-screen bg-[#fbfbfd]">
      <section className="py-20 px-6">
        <div className="max-w-6xl mx-auto text-center mb-20">
          <h2 className="text-blue-600 font-bold tracking-widest uppercase text-sm mb-4">Serviços</h2>
          <h1 className="text-6xl font-bold tracking-tight mb-8">Mentoria e Consultoria<br />de Alto Impacto.</h1>
          <p className="text-xl text-gray-500 max-w-3xl mx-auto font-medium leading-relaxed">
            Unindo experiência acadêmica e vivência de mercado para transformar resultados profissionais e empresariais.
          </p>
        </div>

        <div className="max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-12">
          {/* Service 1 */}
          <div className="bg-white rounded-[48px] p-12 card-shadow">
            <div className="mb-8">
              <span className="bg-blue-50 text-blue-600 px-4 py-2 rounded-full text-xs font-bold uppercase tracking-widest">Empresas</span>
            </div>
            <h2 className="text-4xl font-bold mb-6">Consultoria de Gestão e Formação de Pessoas e Negócios </h2>
            <p className="text-lg text-gray-500 mb-8 leading-relaxed">
              Análise equipes, gestão e viabilidade de negócios.
            </p>
            <ul className="space-y-4 mb-10 text-gray-600 font-medium">
              <li className="flex items-center gap-3"><CheckCircle2 className="text-blue-500" size={20} /> Análise de Vendas e Gestão</li>
              <li className="flex items-center gap-3"><CheckCircle2 className="text-blue-500" size={20} /> Estruturação de Processos e Equipes</li>
              <li className="flex items-center gap-3"><CheckCircle2 className="text-blue-500" size={20} /> Treinamento de Equipes de Vendas</li>
            </ul>
            <a href="#/contato" className="bg-black text-white w-full py-4 rounded-2xl font-bold text-center flex items-center justify-center gap-2 hover:bg-gray-800 transition-all">
              Agendar Consultoria <ArrowRight size={18} />
            </a>
          </div>

          {/* Service 2 */}
          <div className="bg-[#000] text-white rounded-[48px] p-12 card-shadow">
            <div className="mb-8">
              <span className="bg-white/10 text-white px-4 py-2 rounded-full text-xs font-bold uppercase tracking-widest">Profissionais</span>
            </div>
            <h2 className="text-4xl font-bold mb-6">Mentoria PHD (Prof. Paulo)</h2>
            <p className="text-lg text-gray-300 mb-8 leading-relaxed">
              Desenvolvimento de carreira, longevidade produtiva (4050oumais) e alta performance acadêmica.
            </p>
            <ul className="space-y-4 mb-10 text-gray-200 font-medium">
              <li className="flex items-center gap-3"><Star className="text-orange-400" size={20} /> Plano de Carreira Pós-40</li>
              <li className="flex items-center gap-3"><Star className="text-orange-400" size={20} /> Mentoria para Autores e Palestrantes</li>
              <li className="flex items-center gap-3"><Star className="text-orange-400" size={20} /> Metodologia de Estudo e Ensino</li>
            </ul>
            <a href="#/contato" className="bg-white text-black w-full py-4 rounded-2xl font-bold text-center flex items-center justify-center gap-2 hover:bg-gray-100 transition-all">
              Saber mais sobre Mentoria <ArrowRight size={18} />
            </a>
          </div>
        </div>
      </section>
    </main>
  );
};

export default ServicesPage;
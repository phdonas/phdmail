import React from 'react';
import { ArrowUpRight, GraduationCap, Briefcase } from 'lucide-react';

const ServicesSection = () => {
  return (
    <section className="py-24 px-6 bg-[#fbfbfd]">
      <div className="max-w-6xl mx-auto">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div className="bg-[#f2f2f7] rounded-[40px] p-12 flex flex-col justify-between items-start min-h-[450px] overflow-hidden relative group">
            <div className="relative z-10">
              <div className="w-12 h-12 bg-white rounded-xl shadow-sm flex items-center justify-center mb-6">
                <Briefcase className="text-blue-600" />
              </div>
              <h3 className="text-5xl font-bold tracking-tight mb-4">Consultoria<br />Estratégica</h3>
              <p className="text-xl text-gray-500 font-medium max-w-sm">
                Soluções sob medida para melhorar o desempenho e os resultados.
              </p>
            </div>
            <a 
              href="#/contato"
              className="bg-black text-white px-8 py-3 rounded-full text-lg font-semibold hover:bg-gray-800 transition-all flex items-center gap-2 group relative z-10"
            >
              Agendar Conversa <ArrowUpRight size={20} />
            </a>
            <div className="absolute -bottom-10 -right-10 w-64 h-64 bg-blue-100 rounded-full blur-3xl opacity-50 group-hover:scale-125 transition-transform"></div>
          </div>

          <div className="bg-[#000] text-white rounded-[40px] p-12 flex flex-col justify-between items-start min-h-[450px] overflow-hidden relative group">
            <div className="relative z-10">
              <div className="w-12 h-12 bg-white/10 rounded-xl flex items-center justify-center mb-6">
                <GraduationCap className="text-white" />
              </div>
              <h3 className="text-5xl font-bold tracking-tight mb-4">Mentoria<br />Individual</h3>
              <p className="text-xl text-gray-300 font-medium max-w-sm">
                Acelere sua carreira e seus projetos com orientação direta do Prof. Paulo.
              </p>
            </div>
            <a 
              href="#/servicos"
              className="bg-white text-black px-8 py-3 rounded-full text-lg font-semibold hover:bg-gray-200 transition-all flex items-center gap-2 relative z-10"
            >
              Saiba Mais <ArrowUpRight size={20} />
            </a>
            <div className="absolute -top-10 -right-10 w-64 h-64 bg-orange-500 rounded-full blur-[100px] opacity-20 group-hover:scale-125 transition-transform"></div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default ServicesSection;
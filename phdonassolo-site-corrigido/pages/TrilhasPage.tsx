import React, { useState } from 'react';
import { MOCK_COURSES } from '../constants';
import { ArrowUpRight } from 'lucide-react';

const TrilhasPage: React.FC = () => {
  const [faqAberta, setFaqAberta] = useState<number | null>(null);

  // Organizar cursos por trilha
  const cursosPorTrilha = {
    financas: MOCK_COURSES.filter(c => c.trilha === 'financas').sort((a, b) => (a.ordem || 0) - (b.ordem || 0)),
    negociacao: MOCK_COURSES.filter(c => c.trilha === 'negociacao').sort((a, b) => (a.ordem || 0) - (b.ordem || 0)),
    execucao: MOCK_COURSES.filter(c => c.trilha === 'execucao').sort((a, b) => (a.ordem || 0) - (b.ordem || 0))
  };

  const trilhas = [
    {
      id: 'financas',
      titulo: 'Finanças do Gestor',
      subtitulo: 'Clareza de resultado e previsibilidade',
      descricao: 'Domine as ferramentas essenciais para entender a saúde financeira do seu negócio e tomar decisões baseadas em dados reais.',
      icone: '💰',
      cor: '#0066CC',
      cursos: cursosPorTrilha.financas
    },
    {
      id: 'negociacao',
      titulo: 'Negociação e Conversas Comerciais',
      subtitulo: 'Negociar com método e reduzir concessões',
      descricao: 'Desenvolva técnicas profissionais de negociação e aprenda a conduzir conversas comerciais que geram resultados sem queimar margem.',
      icone: '🤝',
      cor: '#00AA00',
      cursos: cursosPorTrilha.negociacao
    },
    {
      id: 'execucao',
      titulo: 'Execução Comercial na Prática',
      subtitulo: 'Cadência, rotina e correção de rota',
      descricao: 'Transforme planejamento em ação com processos estruturados de gestão comercial e rotinas que garantem resultados consistentes.',
      icone: '🎯',
      cor: '#FF8C00',
      cursos: cursosPorTrilha.execucao
    }
  ];

  const faqs = [
    {
      pergunta: 'Preciso fazer os cursos em ordem?',
      resposta: 'Não é obrigatório, mas recomendamos seguir a trilha que faz mais sentido para seu momento. Cada trilha foi desenhada com uma sequência lógica de aprendizado.'
    },
    {
      pergunta: 'Os cursos são 100% online?',
      resposta: 'Sim! Você assiste quando e onde quiser, no seu ritmo. O acesso é vitalício e você pode voltar ao conteúdo sempre que precisar.'
    },
    {
      pergunta: 'Vou receber certificado?',
      resposta: 'Sim, todos os cursos oferecem certificado de conclusão digital da Udemy.'
    },
    {
      pergunta: 'Tem suporte para dúvidas?',
      resposta: 'Sim! Cada curso tem área de Perguntas & Respostas onde respondo pessoalmente. SLA de resposta: 24 horas úteis.'
    },
    {
      pergunta: 'Posso comprar apenas um curso?',
      resposta: 'Sim! Você pode começar por um curso específico. Mas seguir a trilha completa potencializa os resultados.'
    },
    {
      pergunta: 'Qual a garantia?',
      resposta: 'Todos os cursos têm garantia de 30 dias da Udemy. Se não gostar, devolução total do valor.'
    }
  ];

  return (
    <main className="pt-24 min-h-screen bg-white">
      {/* HERO SECTION */}
      <section className="py-20 px-6 bg-gradient-to-br from-blue-600 to-blue-800 text-white">
        <div className="max-w-6xl mx-auto text-center">
          <h1 className="text-6xl font-bold tracking-tight mb-6">Trilhas de Aprendizado</h1>
          <p className="text-2xl font-medium mb-4">Domine as habilidades que gestores de sucesso aplicam</p>
          <p className="text-xl opacity-90">+ de 5.000 alunos | Avaliação média 4.6⭐ | Cursos 100% práticos</p>
        </div>
      </section>

      {/* TRILHAS SECTION */}
      <section className="py-20 px-6">
        <div className="max-w-6xl mx-auto">
          <header className="text-center mb-16">
            <h2 className="text-5xl font-bold tracking-tight mb-4">As 3 Trilhas de Desenvolvimento</h2>
            <p className="text-xl text-gray-500 font-medium">Cada trilha agrupa cursos complementares que constroem uma competência específica</p>
          </header>
          
          <div className="space-y-20">
            {trilhas.map((trilha) => (
              <div key={trilha.id} className="border-t-4 pt-12" style={{ borderColor: trilha.cor }}>
                <div className="flex items-start gap-6 mb-10">
                  <span className="text-6xl">{trilha.icone}</span>
                  <div className="flex-1">
                    <h3 className="text-4xl font-bold mb-2" style={{ color: trilha.cor }}>
                      {trilha.titulo}
                    </h3>
                    <p className="text-xl text-gray-500 font-medium mb-4">{trilha.subtitulo}</p>
                    <p className="text-lg text-gray-600 leading-relaxed">{trilha.descricao}</p>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  {trilha.cursos.map((curso) => (
                    <div key={curso.id} className="bg-[#f5f5f7] rounded-[32px] p-8 hover:shadow-2xl transition-all duration-300 flex flex-col">
                      <div className="flex-1">
                        <span className="inline-block bg-white px-4 py-1.5 rounded-full text-xs font-bold uppercase tracking-widest mb-4">
                          {curso.category}
                        </span>
                        <h4 className="text-2xl font-bold mb-3">{curso.name}</h4>
                        <p className="text-gray-600 leading-relaxed mb-6">{curso.description}</p>
                      </div>
                      <div className="flex gap-3">
                        <a 
                          href={`#/curso/${curso.id}`}
                          className="flex-1 bg-white border-2 border-gray-200 text-black py-3 rounded-xl font-bold text-center hover:bg-gray-50 hover:border-gray-300 transition-all"
                        >
                          Ver Detalhes
                        </a>
                        <a 
                          href={curso.goUrl || curso.salesUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex-1 text-white py-3 rounded-xl font-bold text-center flex items-center justify-center gap-2 hover:opacity-90 transition-all shadow-lg"
                          style={{ backgroundColor: trilha.cor }}
                        >
                          Matricular-se <ArrowUpRight size={18} />
                        </a>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* PROVA SOCIAL */}
      <section className="py-20 px-6 bg-[#f5f5f7]">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-4xl font-bold text-center mb-16">Números que Comprovam</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-12 text-center">
            <div>
              <div className="text-6xl font-bold text-blue-600 mb-4">5.000+</div>
              <div className="text-xl text-gray-600 font-medium">Alunos Formados</div>
            </div>
            <div>
              <div className="text-6xl font-bold text-blue-600 mb-4">4.6⭐</div>
              <div className="text-xl text-gray-600 font-medium">Avaliação Média</div>
            </div>
            <div>
              <div className="text-6xl font-bold text-blue-600 mb-4">7</div>
              <div className="text-xl text-gray-600 font-medium">Cursos Publicados</div>
            </div>
          </div>
        </div>
      </section>

      {/* FAQ SECTION */}
      <section className="py-20 px-6">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-4xl font-bold text-center mb-12">Perguntas Frequentes</h2>
          <div className="space-y-4">
            {faqs.map((faq, index) => (
              <div key={index} className="bg-white rounded-[24px] overflow-hidden shadow-sm border border-gray-100">
                <button 
                  className="w-full text-left p-6 font-bold text-lg flex justify-between items-center hover:bg-gray-50 transition-colors"
                  onClick={() => setFaqAberta(faqAberta === index ? null : index)}
                >
                  <span>{faq.pergunta}</span>
                  <span className="text-3xl text-blue-600 font-normal ml-4">{faqAberta === index ? '−' : '+'}</span>
                </button>
                {faqAberta === index && (
                  <div className="px-6 pb-6 text-gray-600 leading-relaxed">
                    {faq.resposta}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA FINAL */}
      <section className="py-24 px-6 bg-gradient-to-br from-green-600 to-green-800 text-white text-center">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-5xl font-bold mb-6">Pronto para Começar?</h2>
          <p className="text-2xl font-medium mb-10">Escolha a trilha que faz mais sentido para seu momento e dê o primeiro passo</p>
          <a 
            href="#/livros"
            className="inline-block bg-white text-green-800 px-12 py-5 rounded-full font-bold text-xl hover:bg-gray-100 transition-all shadow-2xl"
          >
            Explorar Todos os Cursos
          </a>
        </div>
      </section>
    </main>
  );
};

export default TrilhasPage;

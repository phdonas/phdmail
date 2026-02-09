import React, { useState, useEffect } from 'react';
import { DataService } from '../services/dataService.ts';
import { ArrowLeft, Send, CheckCircle2, Instagram, Linkedin, Youtube, ExternalLink } from 'lucide-react';
import { SITE_CONFIG } from '../config/site-config.ts';

const LandingPage = ({ lpId }) => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [submitted, setSubmitted] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    whatsapp: ''
  });

  useEffect(() => {
    const loadLP = async () => {
      // Simulamos a busca de dados da LP. Em um cenário real, isso viria do DataService/WP
      const lpData = await DataService.getLandingPageById(lpId);
      setData(lpData);
      setLoading(false);
    };
    loadLP();
  }, [lpId]);

  const handleSubmit = (e) => {
    e.preventDefault();
    
    // Simulação de registro de lead
    console.log('Lead Capturado:', {
      ...formData,
      material_id: data.material_id,
      tipo_entrega: data.tipo_entrega
    });

    if (data.variation === 'B' && data.targetUrl) {
      window.open(data.targetUrl, '_blank');
    }
    
    setSubmitted(true);
  };

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center bg-white">
      <div className="w-8 h-8 border-2 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
    </div>
  );

  if (!data) return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-white p-6 text-center">
      <h1 className="text-2xl font-bold mb-4">Material não encontrado.</h1>
      <a href="#/" className="text-blue-600 font-bold">Voltar ao site</a>
    </div>
  );

  return (
    <main className="min-h-screen bg-[#fbfbfd] pt-24 pb-12">
      <div className="max-w-6xl mx-auto px-6">
        {/* Top Bar */}
        <div className="mb-12">
          <a href="#/" className="inline-flex items-center gap-2 text-sm font-medium text-gray-500 hover:text-black transition-colors">
            <ArrowLeft size={16} /> Voltar para o Site Principal
          </a>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-start">
          {/* Content Section */}
          <div>
            <span className="inline-block px-4 py-1.5 rounded-full bg-blue-50 text-blue-600 text-[10px] font-bold uppercase tracking-widest mb-6">
              Recurso Exclusivo
            </span>
            <h1 className="text-4xl md:text-6xl font-bold tracking-tight mb-8 leading-[1.1]">
              {data.title}
            </h1>
            <p className="text-xl text-gray-500 font-medium mb-10 leading-relaxed">
              {data.description}
            </p>
            
            <div className="rounded-[40px] overflow-hidden shadow-2xl bg-gray-200 aspect-[4/3] md:aspect-video mb-8">
              <img src={data.imageUrl} alt={data.title} className="w-full h-full object-cover" />
            </div>
          </div>

          {/* Form Section */}
          <div className="bg-white rounded-[48px] p-8 md:p-12 shadow-2xl shadow-gray-200/50 border border-gray-100 relative overflow-hidden">
            {submitted ? (
              <div className="text-center py-12 animate-in zoom-in duration-500">
                <div className="w-20 h-20 bg-green-50 text-green-500 rounded-full flex items-center justify-center mx-auto mb-8">
                  <CheckCircle2 size={40} />
                </div>
                <h2 className="text-3xl font-bold mb-4">Solicitação Concluída!</h2>
                <p className="text-gray-500 font-medium mb-8">
                  {data.variation === 'A' 
                    ? 'Enviamos o material para o seu e-mail. Verifique sua caixa de entrada em instantes.' 
                    : 'Você será redirecionado para o simulador em uma nova aba.'}
                </p>
                <button 
                  onClick={() => setSubmitted(false)}
                  className="text-blue-600 font-bold hover:underline"
                >
                  Enviar novamente
                </button>
              </div>
            ) : (
              <>
                <h3 className="text-2xl font-bold mb-2">Acesse agora</h3>
                <p className="text-gray-500 font-medium mb-8">Preencha os campos abaixo para liberar seu acesso.</p>
                
                <form onSubmit={handleSubmit} className="space-y-5">
                  {/* Hidden Fields */}
                  <input type="hidden" name="material_id" value={data.material_id} />
                  <input type="hidden" name="tipo_entrega" value={data.tipo_entrega} />

                  <div>
                    <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-2 ml-1">Nome Completo</label>
                    <input 
                      type="text" 
                      required 
                      placeholder="Ex: João Silva"
                      className="w-full px-6 py-4 bg-gray-50 border border-transparent focus:border-blue-200 focus:bg-white focus:ring-4 focus:ring-blue-500/5 rounded-2xl outline-none transition-all font-medium"
                      value={formData.name}
                      onChange={(e) => setFormData({...formData, name: e.target.value})}
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-2 ml-1">Seu melhor e-mail</label>
                    <input 
                      type="email" 
                      required 
                      placeholder="seu@email.com"
                      className="w-full px-6 py-4 bg-gray-50 border border-transparent focus:border-blue-200 focus:bg-white focus:ring-4 focus:ring-blue-500/5 rounded-2xl outline-none transition-all font-medium"
                      value={formData.email}
                      onChange={(e) => setFormData({...formData, email: e.target.value})}
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-2 ml-1">WhatsApp</label>
                    <input 
                      type="tel" 
                      required 
                      placeholder="(00) 00000-0000"
                      className="w-full px-6 py-4 bg-gray-50 border border-transparent focus:border-blue-200 focus:bg-white focus:ring-4 focus:ring-blue-500/5 rounded-2xl outline-none transition-all font-medium"
                      value={formData.whatsapp}
                      onChange={(e) => setFormData({...formData, whatsapp: e.target.value})}
                    />
                  </div>
                  
                  <button 
                    type="submit"
                    className="w-full bg-blue-600 text-white py-5 rounded-2xl text-lg font-bold hover:bg-blue-700 shadow-xl shadow-blue-500/20 transition-all flex items-center justify-center gap-2 group mt-4"
                  >
                    {data.variation === 'A' ? 'Receber Material por E-mail' : 'Acessar Agora'}
                    {data.variation === 'A' ? <Send size={20} className="group-hover:translate-x-1 group-hover:-translate-y-1 transition-transform" /> : <ExternalLink size={20} />}
                  </button>
                </form>
                
                <p className="mt-8 text-[11px] text-gray-400 text-center leading-relaxed">
                  Ao clicar no botão, você concorda com nossa <a href="#/privacidade" className="underline">Política de Privacidade</a>. 
                  Não enviamos spam.
                </p>
              </>
            )}
          </div>
        </div>

        {/* Footer Social */}
        <footer className="mt-32 pt-12 border-t border-gray-200 flex flex-col md:flex-row items-center justify-between gap-8">
          <p className="text-sm text-gray-400 font-medium italic">
            Desenvolvido por Prof. PH Donassolo
          </p>
          <div className="flex items-center gap-8 text-gray-400">
            <a href="#" className="hover:text-blue-600 transition-colors"><Instagram size={24} /></a>
            <a href="#" className="hover:text-blue-700 transition-colors"><Linkedin size={24} /></a>
            <a href="#" className="hover:text-red-600 transition-colors"><Youtube size={24} /></a>
          </div>
        </footer>
      </div>
    </main>
  );
};

export default LandingPage;
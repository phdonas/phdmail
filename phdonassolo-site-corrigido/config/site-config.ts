
/**
 * Configurações globais do site.
 * Nota: Para alterações permanentes no servidor, edite este arquivo.
 * Para testes rápidos, o Admin agora salva no LocalStorage.
 */

const DEFAULT_CONFIG = {
  name: "PH Donassolo",
  email_contato: "paulo@phdonassolo.com",
  whatsapp: "351910298213", // Apenas números: Código País + DDD + Número (Ex: 351... ou 55...)
  whatsapp_display: "+351 910 298 213", 
  whatsapp_message: "Olá Paulo, vim pelo site e gostaria de saber mais sobre seu trabalho.",
  
  hero: {
    title: "Conhecimento para o que vem a seguir.",
    subtitle: "Hub de conteúdo exclusivo sobre profissionais de vendas, mercado imobiliário e longevidade ativa.",
    tag: "Site Oficial"
  },
  
  // Seções da Home
  sections: {
    videos_title: "Aulas Curtas & Insights",
    videos_subtitle: "Conteúdo visual direto ao ponto para sua evolução.",
    articles_title: "Insights & Pensamento",
    articles_subtitle: "Os últimos artigos divididos por pilares de conhecimento."
  },
  
  footer: {
    description: "Hub de conteúdos especializados para profissionais, empreendedores e interessados em buscar a excelência em seus pilares de vida e carreira.",
    copyright: `Copyright © ${new Date().getFullYear()} Prof. PH Donassolo. Todos os direitos reservados.`
  }
};

// Tenta carregar do cache para o Admin funcionar dinamicamente
const getSavedConfig = () => {
  const saved = localStorage.getItem('phd_site_config');
  if (saved) {
    try {
      return JSON.parse(saved);
    } catch (e) {
      return DEFAULT_CONFIG;
    }
  }
  return DEFAULT_CONFIG;
};

export const SITE_CONFIG = getSavedConfig();

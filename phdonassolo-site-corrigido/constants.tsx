import { Pillar, Article, Course, Resource, Book, Video } from './types';

// FUNÇÃO GETICON EXPORTADA
export const getIcon = (pillarId: string): string => {
  const icons: Record<string, string> = {
    'prof-paulo': '👨‍🏫',
    'consultoria-imobiliaria': '🏠',
    '4050oumais': '⏰',
    'academia-do-gas': '🔥'
  };
  return icons[pillarId] || '📚';
};

export const PILLARS: Pillar[] = [
  {
    id: 'prof-paulo',
    name: 'Professor Paulo',
    title: 'Prof. Paulo',
    description: 'Estratégias, táticas e ferramentas para Líderes de Pessoas e Equipes de Vendas.',
    longDescription: 'Aliamos a experiência real — e prática — de mercado com o conhecimento acadêmico. Focamos na aplicação em seu dia a dia. Conteúdo para Gestores e Profissionais de Vendas que desejam resultados práticos.',
    icon: '👨‍🏫',
    color: 'blue',
    accentColor: '#0071e3',
    imageUrl: 'https://images.unsplash.com/photo-1552664730-d307ca884978?auto=format&fit=crop&q=80&w=1200',
    youtubeChannel: 'https://www.youtube.com/@prof-paulo-donassolo'
  },
  {
    id: 'consultoria-imobiliaria',
    name: 'Sou Consultor Imobiliário',
    title: 'Sou Consultor Imobiliário',
    description: 'Conteúdos sobre Gestão de Consultores, Negociação, Profissionalização e outros assuntos importantes para Consultores e Gestores.',
    longDescription: 'Veja aqui, em Sou Consultor Imobiliário, conteúdos desenvolvidos e testados para Corretores e Consultores Imobiliários. Leia os artigos, baixe as ferramentas e as utilize no seu dia a dia. Tenha um bom trabalho!',
    icon: '🏠',
    color: 'green',
    accentColor: '#10b981',
    imageUrl: 'https://images.unsplash.com/photo-1560518883-ce09059eeffa?auto=format&fit=crop&q=80&w=1200',
    youtubeChannel: 'https://www.youtube.com/@souconsultorimobiliario'
  },
  {
    id: '4050oumais',
    name: '4050oumais',
    title: '4050oumais',
    description: 'Conteúdos e discussões sobre Longevidade Ativa, Profissionalismo e Carreira.',
    longDescription: 'Discussões e conteúdos sobre Longevidade Ativa, Profissionalismo e Carreira para profissionais que buscam se manter ativos e relevantes no mercado.',
    icon: '⏰',
    color: 'purple',
    accentColor: '#8b5cf6',
    imageUrl: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&q=80&w=1200',
    youtubeChannel: 'https://www.youtube.com/@4050oumais'
  },
  {
    id: 'academia-do-gas',
    name: 'Academia do Gás',
    title: 'Academia do Gás',
    description: 'Academia do Gás é um conteúdo com artigos, ferramentas, planilhas e testes para o Gestor de uma Revenda de Gás.',
    longDescription: 'O Prof. Paulo H. Donassolo e a Academia do Gás oferecem treinamentos e cursos sobre Gestão para revendedores de GLP. Profissionalismo, Qualidade e Rentabilidade para as Revendas.',
    icon: '🔥',
    color: 'orange',
    accentColor: '#f97316',
    imageUrl: 'https://images.unsplash.com/photo-1581092160562-40aa08e78837?auto=format&fit=crop&q=80&w=1200',
    youtubeChannel: 'https://www.youtube.com/@Academia-do-Gás'
  }
];

// ========================================
// VÍDEOS DA HOME - "AULAS CURTAS & INSIGHTS"
// ========================================
// ⚠️ PREENCHER: Substitua os placeholders abaixo pelos dados reais
// Total: 6 vídeos

export const MOCK_VIDEOS: Video[] = [
  {
    id: 'Negociacao1',
    title: '[Técnicas de Negociação Aplicadas a Vendas]', // ⚠️ PREENCHER
    excerpt: '[Negociação Aplicada]', // ⚠️ PREENCHER
    thumb: 'https://phdonassolo.com/imagens/curso_negociacao.jpg', // ⚠️ FAZER UPLOAD da imagem (1280x720)
    url: 'https://youtu.be/xDyNUohDhk8', // ⚠️ PREENCHER (YouTube, Vimeo, Hotmart ou Udemy)
    pillarIds: ['prof-paulo'] // Mantenha ou altere: 'prof-paulo', 'consultoria-imobiliaria', '4050oumais', 'academia-do-gas'
  },
  {
    id: 'DRE',
    title: '[Descomplicando o DRE]', // ⚠️ PREENCHER
    excerpt: '[Aprenda a usar e a rentabilizar com o DRE]', // ⚠️ PREENCHER
    thumb: 'https://phdonassolo.com/imagens/JBP.jpg', // ⚠️ FAZER UPLOAD
    url: 'https://youtu.be/CzSZH_kapWg', // ⚠️ PREENCHER
    pillarIds: ['prof-paulo']
  },
  {
    id: 'Negociacao2',
    title: '[Prof. Paulo H. Donassolo]', // ⚠️ PREENCHER
    excerpt: '[Conheça o Professor]', // ⚠️ PREENCHER
    thumb: 'https://phdonassolo.com/imagens/Livro_Recriar.jpg', // ⚠️ FAZER UPLOAD
    url: 'https://youtu.be/dszGpXWDu6s', // ⚠️ PREENCHER
    pillarIds: ['prof-paulo']
  },
  {
    id: 'Negociacao3',
    title: '[Prof. Paulo]', // ⚠️ PREENCHER
    excerpt: '[Conheça o Prof. Paulo]', // ⚠️ PREENCHER
    thumb: 'https://phdonassolo.com/imagens/Livro_VendaCom.jpg', // ⚠️ FAZER UPLOAD
    url: 'https://youtu.be/yvH0bi_YYwA', // ⚠️ PREENCHER
    pillarIds: ['prof-paulo']
  },
  {
    id: 'Fluxo1',
    title: '[Fluxo de Caixa]', // ⚠️ PREENCHER
    excerpt: '[Descomplicando o Fluxo de Caixa]', // ⚠️ PREENCHER
    thumb: 'https://phdonassolo.com/imagens/Fluxo_Caixa.jpg', // ⚠️ FAZER UPLOAD
    url: 'https://youtu.be/_f98-5g2xyY', // ⚠️ PREENCHER
    pillarIds: ['prof-paulo']
  },
  {
    id: 'Negociacao-4',
    title: '[Professor Paulo H. Donassolo]', // ⚠️ PREENCHER
    excerpt: '[Conheça mais sobre o Professor]', // ⚠️ PREENCHER
    thumb: 'https://phdonassolo.com/imagens/Escuta.jpg', // ⚠️ FAZER UPLOAD
    url: 'https://youtu.be/FWT2xPygSlk', // ⚠️ PREENCHER
    pillarIds: ['prof-paulo']
  },
    {
    id: 'JBP',
    title: '[JBP Na Prática]', // ⚠️ PREENCHER
    excerpt: '[Em 7 dias você irá aprender e utilizar o JBP]', // ⚠️ PREENCHER
    thumb: 'https://phdonassolo.com/imagens/JBP.jpg', // ⚠️ FAZER UPLOAD
    url: 'https://youtu.be/T5x8arz3-SA', // ⚠️ PREENCHER
    pillarIds: ['prof-paulo']
  }
];

// ========================================
// CURSOS - COM URLs PARA PREENCHER
// ========================================
// ⚠️ PREENCHER: 14 URLs de vídeo + 14 thumbnails
// Cada curso tem 2 vídeos

export const MOCK_COURSES: Course[] = [
  {
    id: 'Negociacao',
    name: 'Técnicas de Negociação Aplicadas a Vendas',
    description: 'Domine as técnicas de Negociação para Vendas e use a IA',
    longDescription: 'Pare de deixar dinheiro na mesa! Domine a negociação B2B/B2C/P2P. Mais de 25 anos de experiência em Gestão Comercial e na Academia. Curso Prático. Conheça.',
    imageUrl: 'https://phdonassolo.com/imagens/curso_negociacao.jpg',
    category: 'Negociação',
    trilha: 'negociacao',
    ordem: 2,
    salesUrl: 'https://www.udemy.com/course/negociacao-para-vendas-tecnicas-ia-professor/?referralCode=D579CCC953FC425B1F87',
    goUrl: '/go/negociacao',
    learningPoints: [
      'Técnicas de foco total que fazem seus clientes se sentirem únicos e especiais',
      'Desenvolver a empatia que transforma objeções em oportunidades de venda',
      'As competências fundamentais dos vendedores top performers em escuta ativa',
      'Usar a metodologia FARE para transformar conversas difíceis em oportunidades de fechamento',
      'Aplicar a técnica LAER para superar objeções sem pressionar o cliente',
      'Dominar as perguntas estratégicas que fazem clientes dizerem SIM mais facilmente',
      'Como usar IA (ChatGPT) para preparar negociações e criar roteiros vencedores'
    ],
    videos: [
      { 
        titulo: '[TÍTULO VÍDEO 1 - NEGOCIAÇÃO]', // ⚠️ PREENCHER
        thumbnail: 'https://phdonassolo.com/imagens/thumb-curso-negociacao-1.jpg', // ⚠️ FAZER UPLOAD (1280x720)
        duracao: '2:30', // ⚠️ AJUSTAR se necessário
        url: 'https://www.youtube.com/watch?v=XXXXX' // ⚠️ PREENCHER
      },
      { 
        titulo: '[TÍTULO VÍDEO 2 - NEGOCIAÇÃO]', // ⚠️ PREENCHER
        thumbnail: 'https://phdonassolo.com/imagens/thumb-curso-negociacao-2.jpg', // ⚠️ FAZER UPLOAD
        duracao: '1:45', // ⚠️ AJUSTAR
        url: 'https://www.youtube.com/watch?v=XXXXX' // ⚠️ PREENCHER
      }
    ]
  },
  {
    id: 'JBP',
    name: 'JBP Na Prática',
    description: 'Use o JBP em 7 dias para Transformar as Suas Vendas',
    longDescription: 'Aprenda na prática como construir, implementar e executar um JBP (Joint Business Plan / Plano Conjunto de Negócios). Conheça.',
    imageUrl: 'https://phdonassolo.com/imagens/JBP.jpg',
    category: 'Execução Comercial',
    trilha: 'execucao',
    ordem: 1,
    salesUrl: 'https://www.udemy.com/course/jbp-na-pratica-para-transformar-suas-vendas/?referralCode=9819EA309FBC7C08360E',
    goUrl: '/go/jbp',
    learningPoints: [
      'O que é um JBP e por que ele transforma resultados comerciais',
      'Como estruturar um JBP do zero em 7 dias',
      'Técnicas para envolver o cliente no planejamento conjunto',
      'Como definir metas realistas e alcançáveis com o cliente',
      'Ferramentas práticas para acompanhar a execução do JBP',
      'Como conduzir reuniões de revisão que geram compromisso',
      'Estratégias para usar o JBP como diferencial competitivo'
    ],
    videos: [
      { 
        titulo: '[TÍTULO VÍDEO 1 - JBP]', // ⚠️ PREENCHER
        thumbnail: 'https://phdonassolo.com/imagens/thumb-curso-jbp-1.jpg', // ⚠️ FAZER UPLOAD
        duracao: '2:30',
        url: 'https://www.youtube.com/watch?v=XXXXX' // ⚠️ PREENCHER
      },
      { 
        titulo: '[TÍTULO VÍDEO 2 - JBP]', // ⚠️ PREENCHER
        thumbnail: 'https://phdonassolo.com/imagens/thumb-curso-jbp-2.jpg', // ⚠️ FAZER UPLOAD
        duracao: '5:45',
        url: 'https://www.youtube.com/watch?v=XXXXX' // ⚠️ PREENCHER
      }
    ]
  },
  {
    id: 'DRE',
    name: 'Descomplicando o DRE',
    description: 'Aprenda na prática como esta ferramenta vai mudar a sua gestão',
    longDescription: 'Aprenda na prática como elaborar, analisar e tomar decisões utilizando o DRE e melhore os resultados do seu negócio. Conheça.',
    imageUrl: 'https://phdonassolo.com/imagens/DRE.jpg',
    category: 'Finanças',
    trilha: 'financas',
    ordem: 1,
    salesUrl: 'https://www.udemy.com/course/descomplicando-o-dre/?referralCode=EA71F9A22E8CEA6214C4',
    goUrl: '/go/dre',
    learningPoints: [
      'O que é o DRE e como ele mostra a saúde real do seu negócio',
      'Como montar um DRE do zero, mesmo sem conhecimento contábil',
      'Interpretar cada linha do DRE para identificar problemas financeiros',
      'Calcular corretamente margem bruta, margem operacional e margem líquida',
      'Comparar seu DRE com períodos anteriores e identificar tendências',
      'Usar o DRE para tomar decisões estratégicas de precificação e custos',
      'Ferramentas práticas em Excel para criar e gerenciar seu DRE'
    ],
    videos: [
      { 
        titulo: '[TÍTULO VÍDEO 1 - DRE]', // ⚠️ PREENCHER
        thumbnail: 'https://phdonassolo.com/imagens/thumb-curso-dre-1.jpg', // ⚠️ FAZER UPLOAD
        duracao: '2:30',
        url: 'https://www.youtube.com/watch?v=XXXXX' // ⚠️ PREENCHER
      },
      { 
        titulo: '[TÍTULO VÍDEO 2 - DRE]', // ⚠️ PREENCHER
        thumbnail: 'https://phdonassolo.com/imagens/thumb-curso-dre-2.jpg', // ⚠️ FAZER UPLOAD
        duracao: '5:45',
        url: 'https://www.youtube.com/watch?v=XXXXX' // ⚠️ PREENCHER
      }
    ]
  },
  {
    id: 'Fluxo',
    name: 'Descomplicando o Fluxo de Caixa',
    description: 'Aprenda na prática como construir e analisar seu Fluxo de Caixa',
    longDescription: 'Aprenda na prática como elaborar, utilizar e tomar decisões com esta ferramenta importantíssima de gestão. Conheça.',
    imageUrl: 'https://phdonassolo.com/imagens/Fluxo_Caixa.jpg',
    category: 'Finanças',
    trilha: 'financas',
    ordem: 2,
    salesUrl: 'https://www.udemy.com/course/descomplicando-o-fluxo-de-caixa/?referralCode=96D93BB86AF6EA061850',
    goUrl: '/go/fluxo',
    learningPoints: [
      'Entender a diferença entre lucro e caixa (e por que isso importa)',
      'Montar um Fluxo de Caixa completo em planilha',
      'Prever entradas e saídas para evitar surpresas financeiras',
      'Identificar gargalos de caixa antes que virem crises',
      'Gerenciar prazos de recebimento e pagamento estrategicamente',
      'Tomar decisões de investimento com base no fluxo projetado',
      'Criar rotina de acompanhamento diário, semanal e mensal'
    ],
    videos: [
      { 
        titulo: '[TÍTULO VÍDEO 1 - FLUXO]', // ⚠️ PREENCHER
        thumbnail: 'https://phdonassolo.com/imagens/thumb-curso-fluxo-1.jpg', // ⚠️ FAZER UPLOAD
        duracao: '2:30',
        url: 'https://www.youtube.com/watch?v=XXXXX' // ⚠️ PREENCHER
      },
      { 
        titulo: '[TÍTULO VÍDEO 2 - FLUXO]', // ⚠️ PREENCHER
        thumbnail: 'https://phdonassolo.com/imagens/thumb-curso-fluxo-2.jpg', // ⚠️ FAZER UPLOAD
        duracao: '5:45',
        url: 'https://www.youtube.com/watch?v=XXXXX' // ⚠️ PREENCHER
      }
    ]
  },
  {
    id: 'Escuta',
    name: 'Escuta Ativa e Negociação',
    description: 'A base de toda negociação bem-sucedida',
    longDescription: 'Desenvolva a habilidade essencial de escuta ativa para melhorar suas negociações e construir relacionamentos comerciais duradouros.',
    imageUrl: 'https://phdonassolo.com/imagens/Escuta.jpg',
    category: 'Negociação',
    trilha: 'negociacao',
    ordem: 1,
    salesUrl: 'https://www.udemy.com/course/escuta-ativa-e-negociacao-como-vender-melhor-ouvindo-mais/?referralCode=1904477ABD0D6FAF16D3',
    goUrl: '/go/escuta',
    learningPoints: [
      'Dominar a técnica de Escuta Ativa que aumenta suas vendas e melhora suas negociações',
      'Técnicas para trabalhar a Atenção Plena (mindfulness)',
      'Ler e usar linguagem corporal para identificar objeções antes mesmo do cliente falar',
      'Aplicar a técnica HEAR que faz clientes revelarem suas verdadeiras necessidades',
      'Quais são as Cinco Técnicas e os Cinco Elementos Chaves para compreender nossos Clientes',
      'Exercícios e Autoavaliações práticas'
    ],
    videos: [
      { 
        titulo: '[TÍTULO VÍDEO 1 - ESCUTA]', // ⚠️ PREENCHER
        thumbnail: 'https://phdonassolo.com/imagens/thumb-curso-escuta-1.jpg', // ⚠️ FAZER UPLOAD
        duracao: '1:00',
        url: 'https://www.youtube.com/watch?v=XXXXX' // ⚠️ PREENCHER
      },
      { 
        titulo: '[TÍTULO VÍDEO 2 - ESCUTA]', // ⚠️ PREENCHER
        thumbnail: 'https://phdonassolo.com/imagens/thumb-curso-escuta-2.jpg', // ⚠️ FAZER UPLOAD
        duracao: '2:00',
        url: 'https://www.youtube.com/watch?v=XXXXX' // ⚠️ PREENCHER
      }
    ]
  },
  {
    id: 'Preco',
    name: 'O essencial sobre Formação de Preço',
    description: 'O que você precisa saber',
    longDescription: 'Como gestores devem precificar corretamente os seus produtos. Com exercícios práticos e simulador.',
    imageUrl: 'https://phdonassolo.com/imagens/EssPreco.jpg',
    category: 'Finanças',
    trilha: 'financas',
    ordem: 3,
    salesUrl: 'https://www.udemy.com/course/o-essencial-sobre-o-calculo-do-preco-de-venda-do-gas/?referralCode=76547760C1D22D27D6DB',
    goUrl: '/go/esspreco',
    learningPoints: [
      'Calcular o preço de venda que garante lucratividade',
      'Entender a diferença entre markup e margem (e não errar nunca mais)',
      'Identificar todos os custos escondidos que impactam sua margem',
      'Usar a fórmula do markup corretamente para diferentes cenários',
      'Definir preços competitivos sem queimar margem',
      'Ferramentas práticas com simulador em Excel'
    ],
    videos: [
      { 
        titulo: '[TÍTULO VÍDEO 1 - PREÇO]', // ⚠️ PREENCHER
        thumbnail: 'https://phdonassolo.com/imagens/thumb-curso-preco-1.jpg', // ⚠️ FAZER UPLOAD
        duracao: '4:00',
        url: 'https://www.youtube.com/watch?v=XXXXX' // ⚠️ PREENCHER
      },
      { 
        titulo: '[TÍTULO VÍDEO 2 - PREÇO]', // ⚠️ PREENCHER
        thumbnail: 'https://phdonassolo.com/imagens/thumb-curso-preco-2.jpg', // ⚠️ FAZER UPLOAD
        duracao: '6:00',
        url: 'https://www.youtube.com/watch?v=XXXXX' // ⚠️ PREENCHER
      }
    ]
  },
  {
    id: 'Entrega',
    name: 'O essencial sobre Custo de Entrega',
    description: 'O que você precisa saber sobre Custo de Entrega',
    longDescription: 'Aprenda a calcular corretamente o seu custo de entrega e pare de perder dinheiro. Com ferramenta e simulador.',
    imageUrl: 'https://phdonassolo.com/imagens/EssEntrega.jpg',
    category: 'Finanças',
    trilha: 'financas',
    ordem: 4,
    salesUrl: 'https://www.udemy.com/course/o-essencial-sobre-o-calculo-do-custo-de-entrega-de-gas/?referralCode=C7E4C36C27FE3E7D3DCF',
    goUrl: '/go/essentrega',
    learningPoints: [
      'Calcular o custo real de cada entrega (veículo + mão de obra + administrativo)',
      'Identificar custos escondidos que ninguém conta',
      'Definir taxa de entrega ou frete que não queima margem',
      'Comparar custo de entrega própria vs terceirizada',
      'Otimizar rotas e reduzir custos operacionais',
      'Ferramenta completa em Excel para gestão de entregas'
    ],
    videos: [
      { 
        titulo: '[TÍTULO VÍDEO 1 - ENTREGA]', // ⚠️ PREENCHER
        thumbnail: 'https://phdonassolo.com/imagens/thumb-curso-entrega-1.jpg', // ⚠️ FAZER UPLOAD
        duracao: '8:00',
        url: 'https://www.youtube.com/watch?v=XXXXX' // ⚠️ PREENCHER
      },
      { 
        titulo: '[TÍTULO VÍDEO 2 - ENTREGA]', // ⚠️ PREENCHER
        thumbnail: 'https://phdonassolo.com/imagens/thumb-curso-entrega-2.jpg', // ⚠️ FAZER UPLOAD
        duracao: '2:00',
        url: 'https://www.youtube.com/watch?v=XXXXX' // ⚠️ PREENCHER
      }
    ]
  }
];

export const MOCK_RESOURCES: Resource[] = [];

export const MOCK_ARTICLES: Article[] = [];

export const MOCK_BOOKS: Book[] = [
  {
    id: 'RGC',
    title: 'Recriar a Gestão Comecial',
    description: 'Um guia completo e diferente sobre gestão de equipes comerciais',
    imageUrl: 'https://phdonassolo.com/imagens/Livro_Recriar.jpg',
    amazonUrl: 'https://www.amazon.com.br/Recriar-Gest%C3%A3o-Comercial-desempenho-resultados-ebook/dp/B0CVF3PN4D?ref_=ast_author_dp&th=1&psc=1',
    buyUrl: 'https://www.amazon.com.br/Recriar-Gest%C3%A3o-Comercial-desempenho-resultados-ebook/dp/B0CVF3PN4D?ref_=ast_author_dp&th=1&psc=1'
  },
  {
    id: 'JBP',
    title: 'Venda COM o Cliente; Não para o Cliente',
    description: 'Aprenda a elaborar e utilizar o JPB para qualificar e aumentar as suas vendas. Livro Prático.',
    imageUrl: 'https://phdonassolo.com/imagens/Livro_VendaCom.jpg',
    amazonUrl: 'https://www.amazon.com.br/Venda-COM-Cliente-PARA-indispens%C3%A1vel-ebook/dp/B0FCS9VVL4',
    buyUrl: 'https://www.amazon.com.br/Venda-COM-Cliente-PARA-indispens%C3%A1vel-ebook/dp/B0FCS9VVL4'
  }
];

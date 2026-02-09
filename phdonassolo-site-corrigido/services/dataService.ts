import { MOCK_ARTICLES, MOCK_COURSES, MOCK_RESOURCES, PILLARS } from '../constants';
import { Article, Course, Resource, Pillar, PillarId, Video } from '../types';

const CACHE_KEY_ARTICLES = 'phd_art_v50';
const CACHE_KEY_VIDEOS = 'phd_vid_v50';

// Detectar posts de vídeo
const isVideoPost = (post: any): boolean => {
  const wpCategories = post._embedded?.['wp:term']?.[0] || [];
  return wpCategories.some((cat: any) => 
    cat.slug === 'video' || 
    cat.slug === 'videos' ||
    cat.name.toLowerCase().includes('video') ||
    cat.name.toLowerCase().includes('vídeo')
  );
};

// Mapeamento de categorias → pilares
const categoryMap: Record<string, PillarId> = {
  'prof-paulo': 'prof-paulo',
  'professor-paulo': 'prof-paulo',
  'consultoria-imobiliaria': 'consultoria-imobiliaria',
  'consultor-imobiliario': 'consultoria-imobiliaria',
  'sou-consultor-imobiliario': 'consultoria-imobiliaria',
  '4050oumais': '4050oumais',
  'academia-do-gas': 'academia-do-gas'
};

// Extrair URL de vídeo do conteúdo
const extractVideoUrl = (content: string): string | null => {
  const youtubeMatch = content.match(/(?:youtube\.com\/watch\?v=|youtu\.be\/)([a-zA-Z0-9_-]+)/);
  if (youtubeMatch) return `https://www.youtube.com/watch?v=${youtubeMatch[1]}`;
  
  const vimeoMatch = content.match(/vimeo\.com\/(\d+)/);
  if (vimeoMatch) return `https://vimeo.com/${vimeoMatch[1]}`;
  
  const udemyMatch = content.match(/(https?:\/\/(?:www\.)?udemy\.com\/course\/[^\/\s"']+)/);
  if (udemyMatch) return udemyMatch[1];
  
  const urlMatch = content.match(/(https?:\/\/[^\s<>"']+)/);
  if (urlMatch) return urlMatch[1];
  
  return null;
};

// Mapear post WordPress → Article
const mapWPPostToArticle = (post: any): Article => {
  const content = post.content?.rendered || '';
  const wpCategories = post._embedded?.['wp:term']?.[0] || [];
  
  // Mapear TODAS as categorias para pilares
  const pillarIds: PillarId[] = [];
  
  for (const cat of wpCategories) {
    const slug = cat.slug;
    if (categoryMap[slug]) {
      const pillarId = categoryMap[slug];
      if (!pillarIds.includes(pillarId)) {
        pillarIds.push(pillarId);
      }
    }
  }
  
  if (pillarIds.length === 0) {
    pillarIds.push('prof-paulo');
  }
  
  return {
    id: post.id.toString(),
    title: post.title?.rendered || 'Sem Título',
    pillarIds: pillarIds,
    category: wpCategories[0]?.name || 'Geral', 
    excerpt: post.excerpt?.rendered?.replace(/<[^>]*>?/gm, '').substring(0, 160) + '...',
    content: content,
    date: post.date,
    imageUrl: post._embedded?.['wp:featuredmedia']?.[0]?.source_url || 
              'https://images.unsplash.com/photo-1501504905252-473c47e087f8?auto=format&fit=crop&q=80&w=1200'
  };
};

// Mapear post WordPress → Video
const mapWPPostToVideo = (post: any): Video => {
  const content = post.content?.rendered || '';
  const wpCategories = post._embedded?.['wp:term']?.[0] || [];
  
  const pillarIds: PillarId[] = [];
  for (const cat of wpCategories) {
    const slug = cat.slug;
    if (categoryMap[slug]) {
      const pillarId = categoryMap[slug];
      if (!pillarIds.includes(pillarId)) {
        pillarIds.push(pillarId);
      }
    }
  }
  if (pillarIds.length === 0) {
    pillarIds.push('prof-paulo');
  }
  
  const videoUrl = extractVideoUrl(content) || post.link;
  
  return {
    id: post.id.toString(),
    title: post.title?.rendered || 'Sem Título',
    excerpt: post.excerpt?.rendered?.replace(/<[^>]*>?/gm, '').substring(0, 100) || '',
    thumb: post._embedded?.['wp:featuredmedia']?.[0]?.source_url || 
           'https://images.unsplash.com/photo-1498050108023-c5249f4df085?auto=format&fit=crop&q=80&w=800',
    url: videoUrl,
    pillarIds: pillarIds
  };
};

// Fetch seguro com timeout
const secureFetch = async (endpoint: string) => {
  const cb = Date.now();
  const url = `/wordpress/wp-json/wp/v2${endpoint}&_embed&cb=${cb}`;
  
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 12000);

  try {
    const res = await fetch(url, { signal: controller.signal });
    clearTimeout(timeoutId);
    if (res.ok) {
      const data = await res.json();
      if (data && !data.code) return data;
    }
  } catch (e) {
    console.warn(`Sincronização com ${endpoint} falhou ou expirou.`);
  }
  return null;
};

// Serviço de dados
export const DataService = {
  async testConnection(): Promise<boolean> {
    const data = await secureFetch('/posts?per_page=1');
    return !!(data && Array.isArray(data));
  },

  async clearCache() {
    localStorage.removeItem(CACHE_KEY_ARTICLES);
    localStorage.removeItem(CACHE_KEY_VIDEOS);
    window.location.reload();
  },

  async getArticles(limit = 12): Promise<Article[]> {
    const cached = localStorage.getItem(CACHE_KEY_ARTICLES);
    if (cached) return JSON.parse(cached).slice(0, limit);
    
    const posts = await secureFetch(`/posts?per_page=100`);
    if (Array.isArray(posts)) {
      const mapped = posts
        .filter(p => !isVideoPost(p))
        .map(mapWPPostToArticle);
      
      localStorage.setItem(CACHE_KEY_ARTICLES, JSON.stringify(mapped));
      return mapped.slice(0, limit);
    }
    return MOCK_ARTICLES;
  },

  async getVideos(limit = 4): Promise<Video[]> {
    const cached = localStorage.getItem(CACHE_KEY_VIDEOS);
    if (cached) return JSON.parse(cached).slice(0, limit);

    const posts = await secureFetch(`/posts?per_page=50`);
    if (Array.isArray(posts)) {
      const videos = posts
        .filter(p => isVideoPost(p))
        .map(mapWPPostToVideo);
      
      localStorage.setItem(CACHE_KEY_VIDEOS, JSON.stringify(videos));
      return videos.slice(0, limit);
    }
    return [];
  },

  async getArticleById(id: string): Promise<Article | undefined> {
    const all = await this.getArticles(200);
    return all.find(a => a.id === id);
  },

  async getArticlesByPillar(pillarId: PillarId, limit = 6): Promise<Article[]> {
    const all = await this.getArticles(200);
    return all.filter(a => a.pillarIds.includes(pillarId)).slice(0, limit);
  },

  async getVideosByPillar(pillarId: PillarId, limit = 4): Promise<Video[]> {
    const all = await this.getVideos(50);
    return all.filter(v => v.pillarIds.includes(pillarId)).slice(0, limit);
  },

  async getAllArticles(): Promise<Article[]> {
    return this.getArticles(1000);
  },

  async getCourses(): Promise<Course[]> { return MOCK_COURSES; },
  async getResources(): Promise<Resource[]> { return MOCK_RESOURCES; },
  async getPillars(): Promise<Pillar[]> { return PILLARS; },
  async getPillarById(id: string): Promise<Pillar | undefined> { 
    return PILLARS.find(p => p.id === id); 
  },
  async getCourseById(id: string): Promise<Course | undefined> { 
    return MOCK_COURSES.find(c => c.id === id); 
  }
};

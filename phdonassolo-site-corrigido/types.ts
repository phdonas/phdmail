// types.ts - Tipos e interfaces do projeto

// ============================================
// PILLAR TYPES
// ============================================

// Type union para IDs válidos de pilares
export type PillarId = 'prof-paulo' | 'consultoria-imobiliaria' | '4050oumais' | 'academia-do-gas';

export interface Pillar {
  id: PillarId;
  name: string;
  title: string;
  description: string;
  longDescription: string;
  icon: string;
  color: string;
  accentColor: string;
  imageUrl: string;
  youtubeChannel?: string;
}

// ============================================
// COURSE TYPES
// ============================================

export interface Course {
  id: string;
  name: string;
  description: string;
  longDescription: string;
  imageUrl: string;
  category: string;
  trilha?: string; // 'financas' | 'negociacao' | 'execucao' | 'todas'
  ordem?: number; // ordem dentro da trilha
  salesUrl: string;
  goUrl?: string; // link /go para tracking
  learningPoints?: string[]; // O que você aprenderá
  videos: { 
    titulo: string; 
    thumbnail: string; 
    duracao: string;
    url: string; // YouTube, Vimeo ou Udemy
  }[];
}

// ============================================
// BOOK TYPES
// ============================================

export interface Book {
  id: string;
  title: string;
  description: string;
  imageUrl: string;
  amazonUrl: string;
  buyUrl: string;
}

// ============================================
// RESOURCE TYPES
// ============================================

export interface Resource {
  id: string;
  name: string;
  category: string;
  type: string;
  size: string;
  url: string;
}

// ============================================
// ARTICLE TYPES
// ============================================

export interface Article {
  id: string;
  title: string;
  pillarIds: PillarId[]; // Array de pilares (artigo pode pertencer a múltiplos)
  category: string;
  excerpt: string;
  content: string;
  date: string;
  imageUrl: string;
}

// ============================================
// VIDEO TYPES
// ============================================

export interface Video {
  id: string;
  title: string;
  excerpt: string;
  thumb: string;
  url: string;
  pillarIds: PillarId[]; // Array de pilares
}

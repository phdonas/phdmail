// canais-config.ts
// Configuração de canais do YouTube por pilar

import { PillarId } from './types';

interface ChannelConfig {
  pillarId: PillarId;
  channelName: string;
  channelUrl: string;
  description: string;
}

export const YOUTUBE_CHANNELS: Record<PillarId, ChannelConfig> = {
  'prof-paulo': {
    pillarId: 'prof-paulo',
    channelName: 'Professor Paulo',
    channelUrl: 'https://www.youtube.com/@prof-paulo-donassolo',
    description: 'Estratégias, táticas e ferramentas para líderes de vendas'
  },
  
  'consultoria-imobiliaria': {
    pillarId: 'consultoria-imobiliaria',
    channelName: 'Sou Consultor Imobiliário',
    channelUrl: 'https://www.youtube.com/@souconsultorimobiliario',
    description: 'Conteúdos para corretores e consultores imobiliários'
  },
  
  '4050oumais': {
    pillarId: '4050oumais',
    channelName: '4050oumais',
    channelUrl: 'https://www.youtube.com/@4050oumais',
    description: 'Conteúdos sobre longevidade profissional'
  },
  
  'academia-do-gas': {
    pillarId: 'academia-do-gas',
    channelName: 'Academia do Gás',
    channelUrl: 'https://www.youtube.com/@Academia-do-Gás',
    description: 'Treinamentos para gestores de revendas de GLP'
  }
};

// Helper para pegar URL do canal por pilar
export const getChannelUrl = (pillarId: PillarId): string => {
  return YOUTUBE_CHANNELS[pillarId]?.channelUrl || '';
};

// Helper para pegar nome do canal por pilar
export const getChannelName = (pillarId: PillarId): string => {
  return YOUTUBE_CHANNELS[pillarId]?.channelName || '';
};


/**
 * Configurações de conexão com o WordPress Headless
 */
export const WP_CONFIG = {
  // Define o domínio base de forma flexível. 
  // O DataService tentará caminhos relativos primeiro.
  BASE_URL: 'https://phdonassolo.com/wordpress',
  
  ENDPOINTS: {
    POSTS: '/posts',
    MEDIA: '/media',
    CATEGORIES: '/categories'
  },
  
  USE_LIVE_DATA: true 
};

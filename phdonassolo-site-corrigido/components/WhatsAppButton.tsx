
import React from 'react';
import { MessageCircle } from 'lucide-react';
import { SITE_CONFIG } from '../config/site-config';

const WhatsAppButton: React.FC = () => {
  const handleClick = () => {
    const url = `https://wa.me/${SITE_CONFIG.whatsapp}?text=${encodeURIComponent(SITE_CONFIG.whatsapp_message)}`;
    window.open(url, '_blank');
  };

  return (
    <button 
      onClick={handleClick}
      className="fixed bottom-6 left-6 z-[100] bg-[#25D366] text-white p-4 rounded-full shadow-2xl hover:scale-110 transition-transform flex items-center gap-3 group"
      aria-label="Falar no WhatsApp"
    >
      <div className="relative">
        <MessageCircle size={28} />
        <span className="absolute -top-1 -right-1 flex h-3 w-3">
          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-white opacity-75"></span>
          <span className="relative inline-flex rounded-full h-3 w-3 bg-white"></span>
        </span>
      </div>
      <span className="max-w-0 overflow-hidden group-hover:max-w-xs transition-all duration-500 font-bold whitespace-nowrap">
        Falar com Paulo
      </span>
    </button>
  );
};

export default WhatsAppButton;

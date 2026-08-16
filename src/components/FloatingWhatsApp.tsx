import React from 'react';
import { WHATSAPP_NUMBER } from '../lib/store';
import { SiteSettings } from '../types';

interface FloatingWhatsAppProps {
  siteSettings?: SiteSettings;
}

export const FloatingWhatsApp: React.FC<FloatingWhatsAppProps> = ({ siteSettings }) => {
  const targetPhone = (siteSettings?.whatsappNumber || WHATSAPP_NUMBER).replace(/[^0-9]/g, '');
  const siteName = siteSettings?.siteName || 'SubX Nepal';
  const whatsappUrl = `https://wa.me/${targetPhone}?text=${encodeURIComponent(
    `Hello ${siteName}! I want to inquire about digital subscriptions.`
  )}`;

  return (
    <a
      href={whatsappUrl}
      target="_blank"
      rel="noopener noreferrer"
      aria-label="Chat on WhatsApp"
      className="fixed bottom-6 right-6 z-50 flex items-center justify-center w-12 h-12 sm:w-14 sm:h-14 bg-[#25D366] hover:bg-[#20ba5a] text-white rounded-full shadow-2xl hover:scale-110 active:scale-95 transition-all duration-300 group"
      title="Chat on WhatsApp"
    >
      {/* Official WhatsApp SVG Logo */}
      <svg
        viewBox="0 0 32 32"
        className="w-7 h-7 sm:w-8 sm:h-8 fill-current drop-shadow-sm"
      >
        <path d="M16 2a13.9 13.9 0 0 0-12 21L2 30l7.2-1.9A13.9 13.9 0 1 0 16 2zm0 25.5a11.5 11.5 0 0 1-5.9-1.6l-.4-.2-4.4 1.1 1.2-4.3-.3-.4a11.6 11.6 0 1 1 9.8 5.4zM22.5 19c-.3-.2-2-1-2.3-1.1s-.5-.2-.7.2-.8 1-.9 1.2-.3.2-.6 0a8.2 8.2 0 0 1-2.5-1.5 9 9 0 0 1-1.7-2.1c-.2-.3 0-.5.1-.6s.3-.4.5-.6l.3-.4c.1-.2 0-.4 0-.5s-.7-1.7-1-2.3c-.3-.6-.6-.5-.8-.5h-.7c-.2 0-.6.1-.9.4A3.8 3.8 0 0 0 10 13.7a6.6 6.6 0 0 0 1.4 3.5 15.2 15.2 0 0 0 6.2 5.5c2.6 1 3.2.8 3.8.8a3.2 3.2 0 0 0 2.2-1.5 2.6 2.6 0 0 0 .2-1.5c-.2-.1-.5-.2-.8-.4z" />
      </svg>

      {/* Subtle pulse ring around floating button */}
      <span className="absolute -inset-1 rounded-full bg-[#25D366]/40 animate-ping -z-10 pointer-events-none" />
    </a>
  );
};

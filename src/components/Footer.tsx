import React from 'react';
import { SiteSettings } from '../types';
import { Mail, Facebook, MapPin, MessageCircle } from 'lucide-react';
import { WHATSAPP_NUMBER } from '../lib/store';

interface FooterProps {
  onScrollToSection?: (id: string) => void;
  siteSettings?: SiteSettings;
}

export const Footer: React.FC<FooterProps> = ({ siteSettings }) => {
  const siteName = siteSettings?.siteName || 'SubX Nepal';
  const waNumber = (siteSettings?.whatsappNumber || WHATSAPP_NUMBER).replace(/[^0-9]/g, '');

  return (
    <footer className="relative bg-slate-100 dark:bg-[#070B14] border-t border-slate-200 dark:border-slate-800/80 pt-6 pb-6 text-slate-500 dark:text-slate-400 font-normal transition-colors duration-150">
      <div className="max-w-4xl mx-auto px-4 sm:px-6">
        
        {/* Links Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-2 gap-6 pb-5 border-b border-slate-200 dark:border-slate-800/80">
          
          {/* SOCIAL MEDIA / LOCATION */}
          <div>
            <h3 className="text-xs font-black text-slate-900 dark:text-white uppercase tracking-widest mb-3">
              SOCIAL MEDIA
            </h3>
            <ul className="space-y-2 text-xs">
              <li>
                <a
                  href="https://www.facebook.com/profile.php?id=61587141402909"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-2 text-slate-600 dark:text-slate-400 hover:text-cyan-600 dark:hover:text-cyan-400 transition-colors group"
                >
                  <Facebook className="w-4 h-4 text-slate-400 dark:text-slate-500 group-hover:text-cyan-600 dark:group-hover:text-cyan-400 transition-colors" />
                  <span>Facebook</span>
                </a>
              </li>
              <li>
                <div className="flex items-center gap-2 text-slate-600 dark:text-slate-400">
                  <MapPin className="w-4 h-4 text-emerald-500 dark:text-emerald-400" />
                  <span>Butwal, Nepal</span>
                </div>
              </li>
            </ul>
          </div>

          {/* SUPPORT */}
          <div>
            <h3 className="text-xs font-black text-slate-900 dark:text-white uppercase tracking-widest mb-3">
              SUPPORT
            </h3>
            <ul className="space-y-2 text-xs">
              <li>
                <a
                  href={`https://wa.me/${waNumber}?text=${encodeURIComponent(`Hello ${siteName}! I have an inquiry.`)}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-2 text-slate-600 dark:text-slate-400 hover:text-emerald-600 dark:hover:text-emerald-400 transition-colors group"
                >
                  <MessageCircle className="w-4 h-4 text-slate-400 dark:text-slate-500 group-hover:text-emerald-600 dark:group-hover:text-emerald-400 transition-colors" />
                  <span>WhatsApp</span>
                </a>
              </li>
              <li>
                <a
                  href="mailto:infosubx.np@gmail.com"
                  className="flex items-center gap-2 text-slate-600 dark:text-slate-400 hover:text-cyan-600 dark:hover:text-cyan-400 transition-colors group"
                >
                  <Mail className="w-4 h-4 text-slate-400 dark:text-slate-500 group-hover:text-cyan-600 dark:group-hover:text-cyan-400 transition-colors" />
                  <span>Email</span>
                </a>
              </li>
            </ul>
          </div>

        </div>

        {/* Copyright Row */}
        <div className="pt-4 text-center text-xs text-slate-500 dark:text-slate-400">
          © 2021-2026 <span className="text-slate-800 dark:text-slate-200 font-bold">{siteName}</span>. All Rights Reserved.
        </div>

      </div>
    </footer>
  );
};

import React from 'react';
import { ShoppingBag, MessageCircle, ArrowRight } from 'lucide-react';
import { WHATSAPP_NUMBER } from '../lib/store';
import { SiteSettings } from '../types';

interface HeroProps {
  onBrowseClick: () => void;
  siteSettings?: SiteSettings;
  theme?: 'dark' | 'light';
}

export const Hero: React.FC<HeroProps> = ({ onBrowseClick, siteSettings, theme = 'dark' }) => {
  const waNum = (siteSettings?.whatsappNumber || WHATSAPP_NUMBER).replace(/[^0-9]/g, '');
  const siteName = siteSettings?.siteName || 'SubX Nepal';
  const isLight = theme === 'light';

  return (
    <section className={`relative overflow-hidden py-8 sm:py-14 border-b transition-colors duration-150 ${
      isLight 
        ? 'border-slate-200/80 bg-gradient-to-b from-white via-slate-50 to-slate-100/70' 
        : 'border-slate-800/60 bg-gradient-to-b from-[#080C16] via-[#060911] to-[#0A0D14]'
    }`}>
      {/* Ambient lighting */}
      <div className={`absolute top-0 left-1/2 -translate-x-1/2 w-[500px] h-[220px] blur-[110px] pointer-events-none rounded-full ${
        isLight
          ? 'bg-gradient-to-r from-cyan-400/10 via-purple-500/10 to-emerald-400/10'
          : 'bg-gradient-to-r from-cyan-500/10 via-purple-600/15 to-emerald-500/10'
      }`} />

      <div className="max-w-4xl mx-auto px-4 sm:px-6 text-center relative z-10">
        
        {/* Guarantee Pill */}
        <div className={`inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full text-xs font-bold shadow-sm mb-4 backdrop-blur-md transition-colors ${
          isLight
            ? 'bg-white border border-slate-200 text-slate-700 shadow-slate-200/50'
            : 'bg-slate-900/90 border border-slate-800 text-slate-300 shadow-black/40'
        }`}>
          <span className="relative flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
            <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500" />
          </span>
          <span className={`font-extrabold uppercase tracking-wider text-[11px] ${
            isLight ? 'text-emerald-600' : 'text-emerald-400'
          }`}>
            Official & Genuine
          </span>
          <span className={isLight ? 'text-slate-300' : 'text-slate-600'}>•</span>
          <span className={`font-medium text-[11px] ${isLight ? 'text-slate-600' : 'text-slate-300'}`}>
            Instant WhatsApp Delivery
          </span>
        </div>

        {/* Hero Headline */}
        <h1 className={`text-2xl sm:text-4xl lg:text-5xl font-black tracking-tight leading-tight transition-colors ${
          isLight ? 'text-slate-900' : 'text-white'
        }`}>
          Premium Subscriptions at{' '}
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-500 via-indigo-500 to-emerald-500">
            Unbeatable Rates
          </span>
        </h1>

        {/* Hero Subtitle */}
        <p className={`mt-3 text-xs sm:text-sm max-w-xl mx-auto leading-relaxed font-normal transition-colors ${
          isLight ? 'text-slate-600' : 'text-slate-300'
        }`}>
          Get verified access to Netflix 4K, ChatGPT Plus, YouTube Premium, CapCut & AI tools with fast 5–15 min WhatsApp activation & full warranty.
        </p>

        {/* Action Buttons */}
        <div className="mt-6 flex flex-row items-center justify-center gap-3 sm:gap-4 max-w-md mx-auto">
          {/* Browse Products Button */}
          <button
            onClick={onBrowseClick}
            className="group flex-1 flex items-center justify-center gap-2 bg-gradient-to-r from-cyan-600 via-blue-600 to-indigo-600 hover:from-cyan-500 hover:via-blue-500 hover:to-indigo-500 text-white font-extrabold text-xs sm:text-sm px-4 sm:px-6 py-2.5 sm:py-3 rounded-xl shadow-lg shadow-cyan-600/20 hover:shadow-cyan-600/30 border border-cyan-400/30 transition-all duration-200 active:scale-95 cursor-pointer"
          >
            <ShoppingBag className="w-4 h-4 text-cyan-100 group-hover:scale-110 transition-transform" />
            <span className="tracking-wide">Browse Products</span>
            <ArrowRight className="w-3.5 h-3.5 text-cyan-100 opacity-70 group-hover:translate-x-0.5 group-hover:opacity-100 transition-all hidden sm:inline" />
          </button>

          {/* Chat WhatsApp Button */}
          <a
            href={`https://wa.me/${waNum}?text=${encodeURIComponent(`Hello ${siteName}! I would like to inquire about digital subscriptions.`)}`}
            target="_blank"
            rel="noopener noreferrer"
            className={`group flex-1 flex items-center justify-center gap-2 font-extrabold text-xs sm:text-sm px-4 sm:px-6 py-2.5 sm:py-3 rounded-xl shadow-md transition-all duration-200 active:scale-95 ${
              isLight
                ? 'bg-emerald-50 hover:bg-emerald-100 text-emerald-700 border border-emerald-300'
                : 'bg-[#0B1512] hover:bg-[#0E201B] text-[#25D366] hover:text-[#32E877] border border-[#25D366]/40 hover:border-[#25D366]/70 shadow-[#25D366]/10'
            }`}
          >
            <div className="w-4 h-4 rounded-full bg-emerald-500/20 flex items-center justify-center">
              <MessageCircle className="w-3 h-3 text-emerald-600 dark:text-[#25D366] fill-current" />
            </div>
            <span className="tracking-wide">Chat WhatsApp</span>
          </a>
        </div>

      </div>
    </section>
  );
};

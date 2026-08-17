import React, { useState } from 'react';
import { 
  X, 
  MessageCircle, 
  ArrowRight,
  Sparkles,
  Zap,
  Gift,
  Rocket
} from 'lucide-react';
import { SiteSettings } from '../types';

interface AnnouncementModalProps {
  siteSettings?: SiteSettings;
}

export const AnnouncementModal: React.FC<AnnouncementModalProps> = ({ siteSettings }) => {
  // Synchronous initialization so it appears smoothly
  const [isOpen, setIsOpen] = useState<boolean>(() => {
    try {
      const todayStr = new Date().toISOString().slice(0, 10);
      const dismissedDate = localStorage.getItem('subx_announcement_dismissed_date');
      return dismissedDate !== todayStr;
    } catch {
      return true;
    }
  });

  const [dontShowToday, setDontShowToday] = useState(false);

  const communityUrl = siteSettings?.whatsapp_community_url || 
                       siteSettings?.whatsappCommunityUrl || 
                       'https://chat.whatsapp.com/CEUIi2YzvuaAaAvO11RmcS';

  const handleClose = () => {
    if (dontShowToday) {
      try {
        const todayStr = new Date().toISOString().slice(0, 10);
        localStorage.setItem('subx_announcement_dismissed_date', todayStr);
      } catch {}
    }
    setIsOpen(false);
  };

  const handleJoin = () => {
    if (dontShowToday) {
      try {
        const todayStr = new Date().toISOString().slice(0, 10);
        localStorage.setItem('subx_announcement_dismissed_date', todayStr);
      } catch {}
    }
    window.open(communityUrl, '_blank', 'noopener,noreferrer');
    setIsOpen(false);
  };

  const isPopupEnabled = siteSettings?.showAnnouncementPopup !== false && 
                         siteSettings?.show_announcement_popup !== false && 
                         String(siteSettings?.showAnnouncementPopup) !== 'false' && 
                         String(siteSettings?.show_announcement_popup) !== 'false';

  const isAdminView = typeof window !== 'undefined' && (
    window.location.pathname.toLowerCase().includes('/admin') ||
    window.location.pathname.toLowerCase().endsWith('admin') ||
    window.location.hash.toLowerCase().includes('admin') ||
    window.location.search.toLowerCase().includes('admin')
  );

  if (isAdminView || !isPopupEnabled || !isOpen) return null;

  return (
    <div 
      id="subx-announcement-modal"
      className="fixed inset-0 z-[999999] flex items-center justify-center p-4 sm:p-6 select-none bg-black/80 backdrop-blur-md animate-in fade-in duration-200"
    >
      {/* Backdrop overlay */}
      <div 
        onClick={handleClose}
        className="absolute inset-0 cursor-pointer"
        aria-label="Close modal overlay"
      />

      {/* Ultra Premium SaaS Glassmorphism Card (Linear / Vercel Aesthetic) */}
      <div 
        role="dialog"
        aria-modal="true"
        className="relative w-full max-w-[420px] bg-[#0A0D14]/95 border border-slate-800/90 rounded-3xl shadow-[0_25px_60px_rgba(0,0,0,0.95)] overflow-hidden p-6 sm:p-7 z-10 animate-in fade-in zoom-in-95 duration-200"
        style={{
          boxShadow: '0 0 50px -15px rgba(56, 189, 248, 0.12), 0 25px 60px -15px rgba(147, 51, 234, 0.18)'
        }}
      >
        {/* Ambient Top Glow */}
        <div className="absolute -top-20 left-1/2 -translate-x-1/2 w-64 h-32 bg-gradient-to-r from-cyan-500/20 via-blue-600/15 to-purple-600/20 rounded-full blur-3xl pointer-events-none" />

        {/* Top Accent Line */}
        <div className="absolute top-0 left-0 right-0 h-[1.5px] bg-gradient-to-r from-transparent via-cyan-400/80 to-purple-500/80" />

        {/* Header: Badge & Close Button */}
        <div className="flex items-center justify-between relative z-10 mb-4">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-cyan-500/10 border border-cyan-500/25 text-cyan-300 text-[10.5px] font-bold tracking-wider uppercase">
            <Sparkles className="w-3 h-3 text-cyan-400" />
            <span>SUBX NEPAL COMMUNITY</span>
          </div>

          <button
            type="button"
            id="close-announcement-x"
            onClick={handleClose}
            aria-label="Close"
            className="w-7 h-7 rounded-full flex items-center justify-center text-slate-400 hover:text-white bg-slate-900/80 hover:bg-slate-800 transition-colors cursor-pointer border border-slate-800"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Heading & Subtitle */}
        <div className="relative z-10 space-y-1.5 text-left mb-5">
          <h3 className="text-xl sm:text-2xl font-black text-white tracking-tight leading-tight">
            Join the SubX Nepal Community
          </h3>
          <p className="text-xs sm:text-sm text-slate-400 leading-relaxed font-normal">
            Stay connected with instant updates, exclusive offers, and priority announcements.
          </p>
        </div>

        {/* 3 Streamlined Benefits */}
        <div className="relative z-10 space-y-2.5 mb-6">
          <div className="flex items-center gap-3 px-3.5 py-2.5 rounded-xl bg-slate-900/50 border border-slate-800/70 hover:border-slate-700/80 transition-colors">
            <div className="w-7 h-7 rounded-lg bg-amber-500/10 border border-amber-500/20 flex items-center justify-center shrink-0">
              <Zap className="w-3.5 h-3.5 text-amber-400" />
            </div>
            <span className="text-xs sm:text-sm font-semibold text-slate-200">
              Instant Stock Updates
            </span>
          </div>

          <div className="flex items-center gap-3 px-3.5 py-2.5 rounded-xl bg-slate-900/50 border border-slate-800/70 hover:border-slate-700/80 transition-colors">
            <div className="w-7 h-7 rounded-lg bg-purple-500/10 border border-purple-500/20 flex items-center justify-center shrink-0">
              <Gift className="w-3.5 h-3.5 text-purple-400" />
            </div>
            <span className="text-xs sm:text-sm font-semibold text-slate-200">
              Exclusive Member Offers
            </span>
          </div>

          <div className="flex items-center gap-3 px-3.5 py-2.5 rounded-xl bg-slate-900/50 border border-slate-800/70 hover:border-slate-700/80 transition-colors">
            <div className="w-7 h-7 rounded-lg bg-cyan-500/10 border border-cyan-500/20 flex items-center justify-center shrink-0">
              <Rocket className="w-3.5 h-3.5 text-cyan-400" />
            </div>
            <span className="text-xs sm:text-sm font-semibold text-slate-200">
              Early Access to New Deals
            </span>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="relative z-10 space-y-2.5">
          {/* Primary CTA */}
          <button
            type="button"
            id="join-community-btn"
            onClick={handleJoin}
            className="w-full py-3.5 px-5 rounded-2xl bg-gradient-to-r from-emerald-500 via-teal-500 to-cyan-500 hover:from-emerald-400 hover:via-teal-400 hover:to-cyan-400 text-white font-extrabold text-sm tracking-wide shadow-lg shadow-emerald-950/40 hover:shadow-cyan-950/50 hover:scale-[1.01] active:scale-[0.99] transition-all cursor-pointer flex items-center justify-center gap-2 border border-emerald-400/30"
          >
            <MessageCircle className="w-4 h-4 fill-white/20" />
            <span>Join WhatsApp Community</span>
            <ArrowRight className="w-4 h-4 ml-0.5 stroke-[2.5]" />
          </button>

          {/* Secondary CTA */}
          <button
            type="button"
            id="close-announcement-btn"
            onClick={handleClose}
            className="w-full py-2.5 text-center text-xs font-semibold text-slate-400 hover:text-slate-200 transition-colors cursor-pointer rounded-xl hover:bg-slate-900/40"
          >
            Maybe Later
          </button>
        </div>

        {/* Checkbox Footer */}
        <div className="mt-3 pt-3 border-t border-slate-800/70 flex items-center justify-center relative z-10">
          <label className="flex items-center gap-2 cursor-pointer select-none py-0.5">
            <input
              type="checkbox"
              id="dont-show-checkbox"
              checked={dontShowToday}
              onChange={(e) => setDontShowToday(e.target.checked)}
              className="w-3.5 h-3.5 rounded bg-slate-900 border-slate-700 text-cyan-500 focus:ring-cyan-400/30 focus:ring-offset-0 cursor-pointer accent-cyan-500"
            />
            <span className="text-[11px] text-slate-400 hover:text-slate-300 font-medium">
              Don't show again today
            </span>
          </label>
        </div>

      </div>
    </div>
  );
};

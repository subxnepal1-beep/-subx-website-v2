import React, { useState } from 'react';
import { ShoppingCart, MessageCircle, Sun, Moon } from 'lucide-react';
import { SubXLogo } from './SubXLogo';
import { DISPLAY_WHATSAPP, WHATSAPP_NUMBER } from '../lib/store';
import { SiteSettings } from '../types';

interface HeaderProps {
  cartItemCount: number;
  onOpenCart: () => void;
  onOpenAdmin: () => void;
  isAdminAuthenticated: boolean;
  onScrollToSection: (id: string) => void;
  siteSettings?: SiteSettings;
  theme?: 'dark' | 'light';
  onToggleTheme?: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  cartItemCount,
  onOpenCart,
  onOpenAdmin,
  isAdminAuthenticated,
  onScrollToSection,
  siteSettings,
  theme = 'dark',
  onToggleTheme
}) => {
  // Secret logo taps count for opening admin
  const [logoClickCount, setLogoClickCount] = useState<number>(0);

  const handleLogoClick = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
    const nextCount = logoClickCount + 1;
    setLogoClickCount(nextCount);
    if (nextCount >= 5) {
      onOpenAdmin();
      setLogoClickCount(0);
    }
  };

  const waNum = siteSettings?.whatsappNumber || WHATSAPP_NUMBER;
  const waDisp = siteSettings?.displayWhatsapp || DISPLAY_WHATSAPP;
  const siteName = siteSettings?.siteName || 'SubX Nepal';

  const isLight = theme === 'light';

  return (
    <header className={`sticky top-0 z-40 w-full backdrop-blur-2xl transition-colors duration-150 ${
      isLight 
        ? 'bg-white/90 border-b border-slate-200 shadow-sm' 
        : 'bg-[#070A12]/90 border-b border-slate-800/70 shadow-lg shadow-black/30'
    }`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between">
        
        {/* Brand Logo & Name */}
        <div 
          onClick={handleLogoClick}
          className="cursor-pointer select-none transition-transform active:scale-95"
          title="SubX Nepal - Digital Subscription Store"
        >
          <SubXLogo variant="full" siteSettings={siteSettings} theme={theme} />
        </div>

        {/* Desktop Navigation Links */}
        <nav className={`hidden md:flex items-center gap-7 text-xs font-bold tracking-wider uppercase ${
          isLight ? 'text-slate-600' : 'text-slate-300'
        }`}>
          <button
            onClick={() => onScrollToSection('products')}
            className={`hover:text-cyan-500 transition-colors py-1 relative group cursor-pointer ${
              isLight ? 'hover:text-cyan-600' : 'hover:text-cyan-400'
            }`}
          >
            <span>Products</span>
            <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-cyan-400 group-hover:w-full transition-all duration-300 rounded-full" />
          </button>
          <button
            onClick={() => onScrollToSection('payments')}
            className={`hover:text-emerald-500 transition-colors py-1 relative group cursor-pointer ${
              isLight ? 'hover:text-emerald-600' : 'hover:text-emerald-400'
            }`}
          >
            <span>Payments</span>
            <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-emerald-400 group-hover:w-full transition-all duration-300 rounded-full" />
          </button>
          <button
            onClick={() => onScrollToSection('why-choose')}
            className={`hover:text-purple-500 transition-colors py-1 relative group cursor-pointer ${
              isLight ? 'hover:text-purple-600' : 'hover:text-purple-400'
            }`}
          >
            <span>Why Us</span>
            <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-purple-400 group-hover:w-full transition-all duration-300 rounded-full" />
          </button>
          <button
            onClick={() => onScrollToSection('faq')}
            className={`hover:text-cyan-500 transition-colors py-1 relative group cursor-pointer ${
              isLight ? 'hover:text-cyan-600' : 'hover:text-cyan-400'
            }`}
          >
            <span>FAQ</span>
            <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-cyan-400 group-hover:w-full transition-all duration-300 rounded-full" />
          </button>
        </nav>

        {/* Right Header Controls */}
        <div className="flex items-center gap-2 sm:gap-3">
          
          {/* Live Support / WhatsApp Pill */}
          <a
            href={`https://wa.me/${waNum}?text=${encodeURIComponent(`Hello ${siteName}! I would like to inquire about digital subscriptions.`)}`}
            target="_blank"
            rel="noopener noreferrer"
            className={`hidden sm:flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-bold transition-all shadow-sm group ${
              isLight
                ? 'bg-emerald-50 text-emerald-700 border border-emerald-300/80 hover:bg-emerald-100'
                : 'bg-emerald-500/10 hover:bg-emerald-500/20 border border-emerald-500/30 text-emerald-400 hover:text-emerald-300'
            }`}
          >
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
              <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500" />
            </span>
            <MessageCircle className="w-3.5 h-3.5 text-emerald-500 fill-emerald-500/20" />
            <span className="hidden lg:inline font-mono text-[11px]">{waDisp}</span>
            <span className="lg:hidden">Support</span>
          </a>

          {/* Instant Babal Light / Dark Mode Toggle Button (Placed right beside Cart) */}
          {onToggleTheme && (
            <button
              onClick={onToggleTheme}
              type="button"
              className={`p-2.5 rounded-xl border flex items-center justify-center cursor-pointer active:scale-90 shadow-sm transition-transform ${
                isLight
                  ? 'bg-slate-100 hover:bg-amber-50 text-amber-500 border-slate-300 hover:border-amber-400 shadow-slate-200'
                  : 'bg-slate-900/90 hover:bg-slate-800 text-cyan-300 hover:text-cyan-200 border-slate-700/80 hover:border-cyan-500/50'
              }`}
              title={isLight ? 'Switch to Dark Mode' : 'Switch to Light Mode'}
              aria-label="Toggle Theme"
            >
              {isLight ? (
                <Sun className="w-4 h-4 sm:w-4.5 sm:h-4.5 text-amber-500" />
              ) : (
                <Moon className="w-4 h-4 sm:w-4.5 sm:h-4.5 text-cyan-300" />
              )}
            </button>
          )}

          {/* Cart Icon & Badge */}
          <button
            onClick={onOpenCart}
            className={`relative flex items-center justify-center p-2.5 sm:px-4 sm:py-2.5 rounded-xl transition-all shadow-md group active:scale-95 cursor-pointer border ${
              isLight
                ? 'bg-slate-100 hover:bg-slate-200 text-slate-800 border-slate-300'
                : 'bg-slate-900/90 hover:bg-slate-800 text-slate-100 border-slate-700/80 hover:border-cyan-500/50'
            }`}
            aria-label="View Shopping Cart"
          >
            <ShoppingCart className={`w-4 h-4 sm:w-4.5 sm:h-4.5 group-hover:scale-110 transition-transform ${
              isLight ? 'text-cyan-600' : 'text-cyan-400'
            }`} />
            <span className={`hidden sm:inline-block ml-2 text-xs font-bold ${
              isLight ? 'text-slate-800' : 'text-slate-200'
            }`}>
              Cart
            </span>
            {cartItemCount > 0 && (
              <span className={`absolute -top-1.5 -right-1.5 bg-gradient-to-r from-purple-500 via-pink-500 to-rose-500 text-white text-[11px] font-black w-5 h-5 rounded-full flex items-center justify-center border-2 ${
                isLight ? 'border-white' : 'border-[#070A12]'
              } shadow-lg animate-bounce`}>
                {cartItemCount}
              </span>
            )}
          </button>

        </div>
      </div>
    </header>
  );
};



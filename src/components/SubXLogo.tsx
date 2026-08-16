import React, { useState, useEffect } from 'react';
import { SiteSettings } from '../types';

export const OFFICIAL_SUBX_LOGO_URL = 'https://pyjfggtupzmxkjrtghfe.supabase.co/storage/v1/object/public/site-assets/file_0000000076a88208a260d5d5e82f756a-removebg-preview-Picsart-AiImageEnhancer.png';
export const LOCAL_SUBX_LOGO_URL = '/logo-official.png';
export const REMOTE_SUBX_LOGO_URL = OFFICIAL_SUBX_LOGO_URL;

interface SubXLogoProps {
  variant?: 'full' | 'icon' | 'banner';
  className?: string;
  onClick?: () => void;
  siteSettings?: SiteSettings;
  logoUrl?: string;
  siteName?: string;
  tagline?: string;
  theme?: 'dark' | 'light';
  size?: 'sm' | 'md' | 'lg';
}

export const SubXLogo: React.FC<SubXLogoProps> = ({
  variant = 'full',
  className = '',
  onClick,
  siteSettings,
  logoUrl: propLogoUrl,
  siteName: propSiteName,
  tagline: propTagline,
  theme = 'dark',
  size = 'md'
}) => {
  const primaryLogoSrc = propLogoUrl || siteSettings?.logoUrl || OFFICIAL_SUBX_LOGO_URL;

  const [currentImgSrc, setCurrentImgSrc] = useState<string>(primaryLogoSrc);
  const [hasError, setHasError] = useState<boolean>(false);

  useEffect(() => {
    setCurrentImgSrc(primaryLogoSrc);
    setHasError(false);
  }, [primaryLogoSrc]);

  const handleImgError = () => {
    if (!hasError) {
      setHasError(true);
      setCurrentImgSrc(LOCAL_SUBX_LOGO_URL);
    }
  };

  const activeSiteName = propSiteName || siteSettings?.siteName || 'SubX Nepal';
  const activeTagline = propTagline || siteSettings?.tagline || 'PREMIUM DIGITAL SUBSCRIPTIONS';
  const isLight = theme === 'light';

  // Crisp High-Definition Size mapping
  const emblemSizeClasses = {
    sm: 'w-9 h-9 sm:w-10 sm:h-10',
    md: 'w-12 h-12 sm:w-14 sm:h-14',
    lg: 'w-16 h-16 sm:w-20 sm:h-20',
  }[size] || 'w-12 h-12 sm:w-14 sm:h-14';

  // Render Image Emblem with pristine detail, uncropped high-DPI scaling
  const renderEmblem = (sizeClass: string) => (
    <div className={`relative ${sizeClass} shrink-0 flex items-center justify-center transition-transform duration-300 group-hover:scale-105 select-none`}>
      {/* Ambient background glow for luxury feel in dark mode */}
      {!isLight && (
        <div className="absolute -inset-1 rounded-full bg-gradient-to-tr from-amber-500/25 via-yellow-400/15 to-cyan-500/20 blur-md opacity-60 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none" />
      )}

      {/* Emblem Graphic */}
      <img
        src={currentImgSrc}
        alt="SubX Nepal Official Brand Logo"
        onError={handleImgError}
        className="w-full h-full object-contain select-none shrink-0 drop-shadow-[0_2px_8px_rgba(0,0,0,0.4)] transition-all duration-300"
        loading="eager"
        decoding="async"
        fetchPriority="high"
        referrerPolicy="no-referrer"
      />
    </div>
  );

  if (variant === 'icon') {
    return renderEmblem(`${emblemSizeClasses} ${className}`);
  }

  // Render clean typography
  const renderSiteNameText = () => {
    const nameUpper = activeSiteName.toUpperCase();
    const textColor = isLight ? 'text-slate-900' : 'text-white';
    const subtextColor = isLight ? 'text-slate-800' : 'text-slate-100';

    if (nameUpper.includes('SUBX') || nameUpper.includes('SUB X')) {
      const parts = activeSiteName.split(/SUBX|SUB X/i);
      const afterText = parts[1] ? parts[1].trim() : '';
      return (
        <div className="flex items-center tracking-tight leading-tight text-xl sm:text-2xl font-black">
          <span className={`${textColor} group-hover:text-amber-400 transition-colors font-extrabold`}>
            Sub
          </span>
          <span className="bg-gradient-to-br from-yellow-300 via-amber-400 to-amber-600 bg-clip-text text-transparent font-black px-0.5 drop-shadow-[0_1px_4px_rgba(245,192,66,0.3)]">
            X
          </span>
          {afterText && (
            <span className={`ml-1.5 font-black tracking-tight ${subtextColor} group-hover:text-amber-400 transition-colors`}>
              {afterText}
            </span>
          )}
        </div>
      );
    }

    return (
      <div className={`flex items-center tracking-tight leading-tight text-xl sm:text-2xl font-black ${textColor} group-hover:text-amber-400 transition-colors`}>
        {activeSiteName}
      </div>
    );
  };

  return (
    <div
      onClick={onClick}
      className={`relative inline-flex items-center gap-2.5 sm:gap-3.5 select-none cursor-pointer group ${className}`}
    >
      {/* Emblem */}
      {renderEmblem(emblemSizeClasses)}

      {/* Dynamic Typography: Site Name & Tagline */}
      <div className="flex flex-col justify-center min-w-0">
        {renderSiteNameText()}
        <div className="flex items-center gap-1.5 mt-0.5">
          <span className="text-amber-400 text-[10px] font-black leading-none select-none">—</span>
          <span className="text-[8.5px] sm:text-[9.5px] font-black bg-gradient-to-r from-amber-400 via-yellow-300 to-amber-500 bg-clip-text text-transparent uppercase tracking-[0.14em] sm:tracking-[0.18em] leading-none whitespace-nowrap">
            {activeTagline}
          </span>
          <span className="text-amber-400 text-[10px] font-black leading-none select-none hidden sm:inline">—</span>
        </div>
      </div>
    </div>
  );
};

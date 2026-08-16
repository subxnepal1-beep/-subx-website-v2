import React from 'react';

interface BannerProps {
  type?: 'gemini' | 'netflix' | 'capcut' | 'youtube' | 'chatgpt' | 'custom' | 'logo' | string;
  badge?: string;
  className?: string;
  image?: string;
  productName?: string;
}

export const ProductBanner: React.FC<BannerProps> = ({ type, className = '', image, productName }) => {
  const [imgError, setImgError] = React.useState(false);
  const [isImgLoaded, setIsImgLoaded] = React.useState(false);

  React.useEffect(() => {
    setImgError(false);
    setIsImgLoaded(false);
  }, [image]);

  const hasCustomSize = className.includes('h-') || className.includes('aspect-');
  const sizeClasses = hasCustomSize ? '' : 'w-full aspect-[16/9] min-h-[165px] sm:min-h-[185px] md:min-h-[205px]';

  let effectiveType = type || 'custom';
  const lowerName = (productName || '').toLowerCase();
  if (effectiveType === 'custom' || !effectiveType) {
    if (lowerName.includes('gemini')) effectiveType = 'gemini';
    else if (lowerName.includes('netflix')) effectiveType = 'netflix';
    else if (lowerName.includes('capcut')) effectiveType = 'capcut';
    else if (lowerName.includes('youtube')) effectiveType = 'youtube';
    else if (lowerName.includes('chatgpt') || lowerName.includes('gpt')) effectiveType = 'chatgpt';
  }

  const isUploadedCustomImage = Boolean(
    image &&
      !imgError &&
      typeof image === 'string' &&
      image.trim().length > 0 &&
      image !== '/images/custom_banner.png'
  );

  // If a valid uploaded custom image, Supabase Storage URL, or Data URL is provided
  if (isUploadedCustomImage) {
    return (
      <div className={`relative w-full ${sizeClasses} bg-[#05070D] rounded-xl overflow-hidden flex items-center justify-center border-b border-slate-800/80 p-0 ${className}`}>
        <img 
          src={image} 
          alt={productName || "Product poster"} 
          onLoad={() => setIsImgLoaded(true)}
          onError={() => setImgError(true)}
          className="w-full h-full object-cover object-center select-none rounded-xl transition-transform duration-200 group-hover:scale-[1.02] drop-shadow-md"
          style={{ WebkitBackfaceVisibility: 'hidden', backfaceVisibility: 'hidden' } as React.CSSProperties}
          loading="lazy"
          decoding="async"
          referrerPolicy="no-referrer"
        />
      </div>
    );
  }

  if (effectiveType === 'logo') {
    return (
      <div className={`relative w-full ${sizeClasses} bg-[#05070E] rounded-xl overflow-hidden border border-cyan-500/30 shadow-xl flex items-center justify-center ${className}`}>
        <svg viewBox="0 0 1000 562.5" className="w-full h-full select-none" preserveAspectRatio="xMidYMid meet">
          <defs>
            <linearGradient id="logoBgGrad" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#0B132B" />
              <stop offset="50%" stopColor="#050811" />
              <stop offset="100%" stopColor="#020305" />
            </linearGradient>
            <linearGradient id="silverMonogram" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#FFFFFF" />
              <stop offset="50%" stopColor="#CBD5E1" />
              <stop offset="100%" stopColor="#64748B" />
            </linearGradient>
            <linearGradient id="cyanMonogram" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#38BDF8" />
              <stop offset="50%" stopColor="#0284C7" />
              <stop offset="100%" stopColor="#1E40AF" />
            </linearGradient>
            <filter id="cyanGlow" x="-20%" y="-20%" width="140%" height="140%">
              <feGaussianBlur stdDeviation="15" result="blur" />
              <feComposite in="SourceGraphic" in2="blur" operator="over" />
            </filter>
          </defs>
          
          <rect width="1000" height="562.5" fill="url(#logoBgGrad)" />
          
          {/* Shield Outline */}
          <path d="M 500 60 L 700 130 L 700 360 C 700 450 500 510 500 510 C 500 510 300 450 300 360 L 300 130 Z" fill="none" stroke="#0284C7" strokeWidth="8" opacity="0.6" filter="url(#cyanGlow)" />
          
          {/* SX Monogram */}
          <g transform="translate(380, 140) scale(2.4)">
            <path d="M 65 18 L 30 18 C 18 18 10 26 10 38 C 10 50 20 56 40 59 C 62 62 72 68 72 80 C 72 92 60 98 42 98 L 12 98 L 12 85 L 42 85 C 52 85 58 81 58 75 C 58 69 48 65 32 62 C 14 58 2 50 2 36 C 2 20 18 8 42 8 L 65 8 Z" fill="url(#silverMonogram)" />
            <path d="M 28 85 L 90 8 L 98 8 L 38 85 Z" fill="url(#cyanMonogram)" />
            <path d="M 32 8 L 88 88 L 74 88 L 20 8 Z" fill="url(#cyanMonogram)" />
          </g>

          <text x="500" y="470" textAnchor="middle" fill="#FFFFFF" fontSize="38" fontWeight="900" letterSpacing="6" fontFamily="sans-serif">SUBX NEPAL</text>
        </svg>
      </div>
    );
  }

  // 1. Google Gemini AI Pro Banner
  if (effectiveType === 'gemini') {
    return (
      <div className={`relative w-full ${sizeClasses} bg-[#05070D] rounded-t-xl overflow-hidden border-b border-purple-500/20 flex items-center justify-center ${className}`}>
        <svg viewBox="0 0 1000 562.5" className="w-full h-full select-none" preserveAspectRatio="xMidYMid meet">
          <defs>
            <linearGradient id="geminiBg" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#0B0F19" />
              <stop offset="50%" stopColor="#05070E" />
              <stop offset="100%" stopColor="#020305" />
            </linearGradient>
            
            {/* Ambient Back Glow */}
            <radialGradient id="geminiGlow" cx="70%" cy="50%" r="50%">
              <stop offset="0%" stopColor="#8B5CF6" stopOpacity="0.4" />
              <stop offset="50%" stopColor="#EC4899" stopOpacity="0.15" />
              <stop offset="100%" stopColor="#000000" stopOpacity="0" />
            </radialGradient>

            {/* Glass Badge Border */}
            <linearGradient id="glassBorderGlow" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#38BDF8" />
              <stop offset="50%" stopColor="#A855F7" />
              <stop offset="100%" stopColor="#EC4899" />
            </linearGradient>

            {/* Gemini Star Gradient */}
            <linearGradient id="starGrad" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#38BDF8" />
              <stop offset="50%" stopColor="#A855F7" />
              <stop offset="100%" stopColor="#F43F5E" />
            </linearGradient>

            {/* Gemini Text Gradient */}
            <linearGradient id="geminiTextGrad" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="#60A5FA" />
              <stop offset="35%" stopColor="#C084FC" />
              <stop offset="70%" stopColor="#F472B6" />
              <stop offset="100%" stopColor="#FB7185" />
            </linearGradient>

            <filter id="softGlow" x="-20%" y="-20%" width="140%" height="140%">
              <feGaussianBlur stdDeviation="8" result="blur" />
              <feComposite in="SourceGraphic" in2="blur" operator="over" />
            </filter>
          </defs>

          {/* Background Canvas */}
          <rect width="1000" height="562.5" fill="url(#geminiBg)" />
          <rect width="1000" height="562.5" fill="url(#geminiGlow)" />
          
          {/* Floor Reflection Line */}
          <line x1="0" y1="395" x2="1000" y2="395" stroke="#1E293B" strokeWidth="1" opacity="0.4" />

          {/* LEFT SIDE: Glossy 60% OFF Glass Badge */}
          <g transform="translate(50, 125)">
            {/* Glow Outline */}
            <rect x="0" y="0" width="380" height="260" rx="28" fill="none" stroke="url(#glassBorderGlow)" strokeWidth="4" filter="url(#softGlow)" />
            {/* Glass Fill */}
            <rect x="0" y="0" width="380" height="260" rx="28" fill="#000000" fillOpacity="0.7" />
            
            {/* 60% OFF Text */}
            <text x="40" y="175" fill="#FFFFFF" fontSize="130" fontWeight="900" fontFamily="sans-serif">60</text>
            <text x="215" y="115" fill="#FFFFFF" fontSize="52" fontWeight="900" fontFamily="sans-serif">%</text>
            <text x="215" y="170" fill="#38BDF8" fontSize="42" fontWeight="900" fontFamily="sans-serif">OFF</text>
          </g>

          {/* RIGHT SIDE: 3D Gemini Logo & Star */}
          {/* 4-Point Star */}
          <path d="M 770 120 C 770 180 800 210 860 210 C 800 210 770 240 770 300 C 770 240 740 210 680 210 C 740 210 770 180 770 120 Z" fill="url(#starGrad)" filter="url(#softGlow)" />
          <circle cx="855" cy="245" r="14" fill="#F472B6" />

          {/* Gemini 3D Text */}
          <text x="460" y="360" fill="url(#geminiTextGrad)" fontSize="135" fontWeight="900" fontFamily="sans-serif" letterSpacing="-2">Gemini</text>
          
          {/* Subtle Floor Reflection */}
          <text x="460" y="445" fill="url(#geminiTextGrad)" fontSize="135" fontWeight="900" fontFamily="sans-serif" letterSpacing="-2" opacity="0.12" transform="scale(1, -1) translate(0, -805)">Gemini</text>
        </svg>
      </div>
    );
  }

  // 2. ChatGPT Plus Banner
  if (effectiveType === 'chatgpt') {
    return (
      <div className={`relative w-full ${sizeClasses} bg-[#05070D] rounded-t-xl overflow-hidden border-b border-purple-500/20 flex items-center justify-center ${className}`}>
        <svg viewBox="0 0 1000 562.5" className="w-full h-full select-none" preserveAspectRatio="xMidYMid meet">
          <defs>
            <linearGradient id="chatgptBg" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#090514" />
              <stop offset="50%" stopColor="#05030A" />
              <stop offset="100%" stopColor="#020104" />
            </linearGradient>

            <radialGradient id="purpleAmbient" cx="75%" cy="50%" r="50%">
              <stop offset="0%" stopColor="#A855F7" stopOpacity="0.4" />
              <stop offset="100%" stopColor="#000000" stopOpacity="0" />
            </radialGradient>

            <linearGradient id="chatgptBorder" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#C084FC" />
              <stop offset="100%" stopColor="#7E22CE" />
            </linearGradient>

            <filter id="purpleGlow" x="-20%" y="-20%" width="140%" height="140%">
              <feGaussianBlur stdDeviation="8" result="blur" />
              <feComposite in="SourceGraphic" in2="blur" operator="over" />
            </filter>
          </defs>

          <rect width="1000" height="562.5" fill="url(#chatgptBg)" />
          <rect width="1000" height="562.5" fill="url(#purpleAmbient)" />
          
          <line x1="0" y1="395" x2="1000" y2="395" stroke="#1E293B" strokeWidth="1" opacity="0.4" />

          {/* LEFT SIDE: 27% OFF Badge */}
          <g transform="translate(60, 125)">
            <rect x="0" y="0" width="370" height="260" rx="28" fill="none" stroke="url(#chatgptBorder)" strokeWidth="4" filter="url(#purpleGlow)" />
            <rect x="0" y="0" width="370" height="260" rx="28" fill="#000000" fillOpacity="0.75" />
            
            <text x="35" y="175" fill="#FFFFFF" fontSize="130" fontWeight="900" fontFamily="sans-serif">27</text>
            <text x="210" y="115" fill="#FFFFFF" fontSize="52" fontWeight="900" fontFamily="sans-serif">%</text>
            <text x="210" y="170" fill="#C084FC" fontSize="42" fontWeight="900" fontFamily="sans-serif">OFF</text>
          </g>

          {/* RIGHT SIDE: 3D OpenAI Knot & ChatGPT Plus Text */}
          <g transform="translate(690, 220)">
            {/* 3D Knot Icon */}
            <path d="M 0 -80 C 45 -80 80 -45 80 0 C 80 45 45 80 0 80 C -45 80 -80 45 -80 0 C -80 -45 -45 -80 0 -80 Z" fill="none" stroke="#C084FC" strokeWidth="24" strokeLinecap="round" filter="url(#purpleGlow)" />
            <path d="M -35 -35 L 35 35 M 35 -35 L -35 35" stroke="#C084FC" strokeWidth="20" strokeLinecap="round" />
          </g>

          {/* Text: ChatGPT */}
          <text x="500" y="370" fill="#FFFFFF" fontSize="68" fontWeight="900" fontFamily="sans-serif">ChatGPT</text>

          {/* Pill Badge: PLUS */}
          <g transform="translate(805, 315)">
            <rect x="0" y="0" width="130" height="60" rx="16" fill="#7E22CE" />
            <text x="65" y="42" fill="#FFFFFF" fontSize="30" fontWeight="900" fontFamily="sans-serif" textAnchor="middle">PLUS</text>
          </g>
        </svg>
      </div>
    );
  }

  // 3. YouTube Premium Banner
  if (effectiveType === 'youtube') {
    return (
      <div className={`relative w-full ${sizeClasses} bg-[#05070D] rounded-t-xl overflow-hidden border-b border-red-500/20 flex items-center justify-center ${className}`}>
        <svg viewBox="0 0 1000 562.5" className="w-full h-full select-none" preserveAspectRatio="xMidYMid meet">
          <defs>
            <linearGradient id="ytBg" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#140505" />
              <stop offset="50%" stopColor="#080202" />
              <stop offset="100%" stopColor="#020101" />
            </linearGradient>

            <radialGradient id="redAmbient" cx="75%" cy="50%" r="50%">
              <stop offset="0%" stopColor="#EF4444" stopOpacity="0.35" />
              <stop offset="100%" stopColor="#000000" stopOpacity="0" />
            </radialGradient>

            <linearGradient id="ytBorder" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#EF4444" />
              <stop offset="100%" stopColor="#991B1B" />
            </linearGradient>

            <filter id="redGlow" x="-20%" y="-20%" width="140%" height="140%">
              <feGaussianBlur stdDeviation="8" result="blur" />
              <feComposite in="SourceGraphic" in2="blur" operator="over" />
            </filter>
          </defs>

          <rect width="1000" height="562.5" fill="url(#ytBg)" />
          <rect width="1000" height="562.5" fill="url(#redAmbient)" />
          
          <line x1="0" y1="395" x2="1000" y2="395" stroke="#1E293B" strokeWidth="1" opacity="0.4" />

          {/* LEFT SIDE: 45% OFF Badge */}
          <g transform="translate(60, 125)">
            <rect x="0" y="0" width="370" height="260" rx="28" fill="none" stroke="url(#ytBorder)" strokeWidth="4" filter="url(#redGlow)" />
            <rect x="0" y="0" width="370" height="260" rx="28" fill="#000000" fillOpacity="0.75" />
            
            <text x="35" y="175" fill="#FFFFFF" fontSize="130" fontWeight="900" fontFamily="sans-serif">45</text>
            <text x="210" y="115" fill="#FFFFFF" fontSize="52" fontWeight="900" fontFamily="sans-serif">%</text>
            <text x="210" y="170" fill="#EF4444" fontSize="42" fontWeight="900" fontFamily="sans-serif">OFF</text>
          </g>

          {/* RIGHT SIDE: 3D YouTube Play Icon & Text */}
          <g transform="translate(680, 200)">
            <rect x="-120" y="-80" width="240" height="160" rx="48" fill="#DC2626" filter="url(#redGlow)" />
            <path d="M -25 -40 L 45 0 L -25 40 Z" fill="#FFFFFF" />
          </g>

          <text x="500" y="370" fill="#FFFFFF" fontSize="68" fontWeight="900" fontFamily="sans-serif" letterSpacing="-1">YouTube</text>

          {/* PREMIUM Pill Badge */}
          <g transform="translate(790, 315)">
            <rect x="0" y="0" width="160" height="60" rx="16" fill="#DC2626" />
            <text x="80" y="42" fill="#FFFFFF" fontSize="26" fontWeight="900" fontFamily="sans-serif" textAnchor="middle">PREMIUM</text>
          </g>
        </svg>
      </div>
    );
  }

  // 4. CapCut Pro Banner
  if (effectiveType === 'capcut') {
    return (
      <div className={`relative w-full ${sizeClasses} bg-[#05070D] rounded-t-xl overflow-hidden border-b border-purple-500/20 flex items-center justify-center ${className}`}>
        <svg viewBox="0 0 1000 562.5" className="w-full h-full select-none" preserveAspectRatio="xMidYMid meet">
          <defs>
            <linearGradient id="capcutBg" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#0B0614" />
              <stop offset="50%" stopColor="#05030A" />
              <stop offset="100%" stopColor="#020104" />
            </linearGradient>

            <radialGradient id="capcutGlow" cx="75%" cy="50%" r="50%">
              <stop offset="0%" stopColor="#A855F7" stopOpacity="0.4" />
              <stop offset="100%" stopColor="#000000" stopOpacity="0" />
            </radialGradient>

            <linearGradient id="capcutBorder" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#C084FC" />
              <stop offset="100%" stopColor="#6B21A8" />
            </linearGradient>

            <filter id="ccGlow" x="-20%" y="-20%" width="140%" height="140%">
              <feGaussianBlur stdDeviation="8" result="blur" />
              <feComposite in="SourceGraphic" in2="blur" operator="over" />
            </filter>
          </defs>

          <rect width="1000" height="562.5" fill="url(#capcutBg)" />
          <rect width="1000" height="562.5" fill="url(#capcutGlow)" />
          
          <line x1="0" y1="395" x2="1000" y2="395" stroke="#1E293B" strokeWidth="1" opacity="0.4" />

          {/* LEFT SIDE: 29% OFF Badge with Limited Time Offer */}
          <g transform="translate(60, 110)">
            <rect x="0" y="0" width="380" height="280" rx="28" fill="none" stroke="url(#capcutBorder)" strokeWidth="4" filter="url(#ccGlow)" />
            <rect x="0" y="0" width="380" height="280" rx="28" fill="#000000" fillOpacity="0.75" />
            
            <text x="35" y="160" fill="#FFFFFF" fontSize="125" fontWeight="900" fontFamily="sans-serif">29</text>
            <text x="210" y="105" fill="#FFFFFF" fontSize="50" fontWeight="900" fontFamily="sans-serif">%</text>
            <text x="210" y="155" fill="#FFFFFF" fontSize="40" fontWeight="900" fontFamily="sans-serif">OFF</text>

            <rect x="30" y="195" width="320" height="52" rx="14" fill="#7E22CE" />
            <text x="190" y="230" fill="#FFFFFF" fontSize="20" fontWeight="900" fontFamily="sans-serif" textAnchor="middle" letterSpacing="1">LIMITED TIME OFFER</text>
          </g>

          {/* RIGHT SIDE: CapCut Scissor Icon */}
          <g transform="translate(730, 210)">
            <path d="M -90 -90 L 90 0 L -90 90 M 90 -90 L -90 0 L 90 90" stroke="#C084FC" strokeWidth="36" strokeLinecap="round" strokeLinejoin="round" fill="none" filter="url(#ccGlow)" />
          </g>

          <text x="500" y="380" fill="#FFFFFF" fontSize="68" fontWeight="900" fontFamily="sans-serif">CapCut</text>

          <g transform="translate(755" y="325">
            <rect x="0" y="0" width="110" height="60" rx="16" fill="#7E22CE" />
            <text x="55" y="42" fill="#FFFFFF" fontSize="28" fontWeight="900" fontFamily="sans-serif" textAnchor="middle">PRO</text>
          </g>
        </svg>
      </div>
    );
  }

  // 5. Netflix Premium Banner
  if (effectiveType === 'netflix') {
    return (
      <div className={`relative w-full ${sizeClasses} bg-[#05070D] rounded-t-xl overflow-hidden border-b border-red-500/20 flex items-center justify-center ${className}`}>
        <svg viewBox="0 0 1000 562.5" className="w-full h-full select-none" preserveAspectRatio="xMidYMid meet">
          <defs>
            <linearGradient id="netflixBg" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#140202" />
              <stop offset="50%" stopColor="#080101" />
              <stop offset="100%" stopColor="#020000" />
            </linearGradient>

            <radialGradient id="nfxAmbient" cx="75%" cy="50%" r="50%">
              <stop offset="0%" stopColor="#DC2626" stopOpacity="0.4" />
              <stop offset="100%" stopColor="#000000" stopOpacity="0" />
            </radialGradient>

            <linearGradient id="nfxBorder" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#EF4444" />
              <stop offset="100%" stopColor="#7F1D1D" />
            </linearGradient>

            <filter id="nfxGlow" x="-20%" y="-20%" width="140%" height="140%">
              <feGaussianBlur stdDeviation="8" result="blur" />
              <feComposite in="SourceGraphic" in2="blur" operator="over" />
            </filter>
          </defs>

          <rect width="1000" height="562.5" fill="url(#netflixBg)" />
          <rect width="1000" height="562.5" fill="url(#nfxAmbient)" />
          
          <line x1="0" y1="395" x2="1000" y2="395" stroke="#1E293B" strokeWidth="1" opacity="0.4" />

          {/* LEFT SIDE: 20% OFF Badge */}
          <g transform="translate(60, 110)">
            <rect x="0" y="0" width="380" height="280" rx="28" fill="none" stroke="url(#nfxBorder)" strokeWidth="4" filter="url(#nfxGlow)" />
            <rect x="0" y="0" width="380" height="280" rx="28" fill="#000000" fillOpacity="0.75" />
            
            <text x="35" y="160" fill="#FFFFFF" fontSize="125" fontWeight="900" fontFamily="sans-serif">20</text>
            <text x="210" y="105" fill="#FFFFFF" fontSize="50" fontWeight="900" fontFamily="sans-serif">%</text>
            <text x="210" y="155" fill="#FFFFFF" fontSize="40" fontWeight="900" fontFamily="sans-serif">OFF</text>

            <rect x="30" y="195" width="320" height="52" rx="14" fill="#B91C1C" />
            <text x="190" y="230" fill="#FFFFFF" fontSize="20" fontWeight="900" fontFamily="sans-serif" textAnchor="middle" letterSpacing="1">LIMITED TIME OFFER</text>
          </g>

          {/* RIGHT SIDE: Giant 3D Netflix N Logo */}
          <g transform="translate(680, 100)">
            <path d="M 0 0 L 45 0 L 45 280 L 0 280 Z" fill="#B91C1C" />
            <path d="M 100 0 L 145 0 L 145 280 L 100 280 Z" fill="#B91C1C" />
            <path d="M 0 0 L 145 280 L 100 280 L 0 0 Z" fill="#E50914" filter="url(#nfxGlow)" />
          </g>

          <text x="500" y="380" fill="#E50914" fontSize="55" fontWeight="900" fontFamily="sans-serif" letterSpacing="2">NETFLIX</text>
          <text x="500" y="420" fill="#CBD5E1" fontSize="22" fontWeight="700" fontFamily="sans-serif" letterSpacing="8">— PREMIUM —</text>
        </svg>
      </div>
    );
  }

  // Fallback Custom Banner for any custom title
  const displayTitle = (productName || 'SubX Premium').toUpperCase();
  return (
    <div className={`relative w-full ${sizeClasses} bg-[#05070E] rounded-t-xl overflow-hidden border-b border-cyan-500/30 flex items-center justify-center ${className}`}>
      <svg viewBox="0 0 1000 562.5" className="w-full h-full select-none" preserveAspectRatio="xMidYMid meet">
        <defs>
          <linearGradient id="customBg" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#0B132B" />
            <stop offset="50%" stopColor="#050811" />
            <stop offset="100%" stopColor="#020305" />
          </linearGradient>
          <linearGradient id="cyanTextGrad" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#38BDF8" />
            <stop offset="50%" stopColor="#818CF8" />
            <stop offset="100%" stopColor="#C084FC" />
          </linearGradient>
          <radialGradient id="customGlow" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor="#0284C7" stopOpacity="0.35" />
            <stop offset="100%" stopColor="#000000" stopOpacity="0" />
          </radialGradient>
          <filter id="customFilterGlow" x="-20%" y="-20%" width="140%" height="140%">
            <feGaussianBlur stdDeviation="12" result="blur" />
            <feComposite in="SourceGraphic" in2="blur" operator="over" />
          </filter>
        </defs>

        <rect width="1000" height="562.5" fill="url(#customBg)" />
        <rect width="1000" height="562.5" fill="url(#customGlow)" />

        {/* Shield Icon */}
        <path d="M 500 80 L 680 140 L 680 340 C 680 430 500 480 500 480 C 500 480 320 430 320 340 L 320 140 Z" fill="none" stroke="#0284C7" strokeWidth="6" opacity="0.35" filter="url(#customFilterGlow)" />

        <text x="500" y="270" textAnchor="middle" fill="url(#cyanTextGrad)" fontSize="52" fontWeight="900" fontFamily="sans-serif" letterSpacing="1">{displayTitle}</text>
        <text x="500" y="340" textAnchor="middle" fill="#94A3B8" fontSize="24" fontWeight="800" fontFamily="sans-serif" letterSpacing="6">— DIGITAL SUBSCRIPTION —</text>
        <text x="500" y="415" textAnchor="middle" fill="#38BDF8" fontSize="22" fontWeight="900" fontFamily="sans-serif" letterSpacing="3">SUBX NEPAL GUARANTEED</text>
      </svg>
    </div>
  );
};



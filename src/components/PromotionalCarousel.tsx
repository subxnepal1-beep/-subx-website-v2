import React, { useState, useEffect, useRef } from 'react';
import { PromotionalPoster, Product, SiteSettings } from '../types';
import { ProductLogoImage } from './ProductCard';
import { ChevronLeft, ChevronRight, Sparkles, Tag, ArrowRight } from 'lucide-react';

interface PromotionalCarouselProps {
  posters: PromotionalPoster[];
  products: Product[];
  siteSettings?: SiteSettings;
  onSelectProduct: (product: Product) => void;
}

export const PromotionalCarousel: React.FC<PromotionalCarouselProps> = ({
  posters,
  products,
  siteSettings,
  onSelectProduct,
}) => {
  // Master Switch Check & Active Poster Filtering
  const isMasterEnabled = siteSettings?.showPromotionalPosters !== false;
  const activePosters = (posters || [])
    .filter((p) => p.active)
    .sort((a, b) => (a.displayOrder || 0) - (b.displayOrder || 0));

  const [currentIndex, setCurrentIndex] = useState(0);
  const [touchStartX, setTouchStartX] = useState<number | null>(null);
  const [touchEndX, setTouchEndX] = useState<number | null>(null);
  const [isHovered, setIsHovered] = useState(false);
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  // If Master switch is OFF or no active posters exist, hide completely with zero space
  if (!isMasterEnabled || activePosters.length === 0) {
    return null;
  }

  // Ensure currentIndex stays in range if posters list changes
  const safeIndex = currentIndex >= activePosters.length ? 0 : currentIndex;
  const currentPoster = activePosters[safeIndex];

  // Linked Product lookup
  const linkedProduct = products.find((p) => p.id === currentPoster.productId) || 
    products.find((p) => p.name.toLowerCase().includes(currentPoster.title.toLowerCase()));

  const handleNext = () => {
    setCurrentIndex((prev) => (prev + 1) % activePosters.length);
  };

  const handlePrev = () => {
    setCurrentIndex((prev) => (prev - 1 + activePosters.length) % activePosters.length);
  };

  // Reset auto-slide timer
  const resetTimer = () => {
    if (timerRef.current) clearInterval(timerRef.current);
    if (!isHovered && activePosters.length > 1) {
      timerRef.current = setInterval(() => {
        setCurrentIndex((prev) => (prev + 1) % activePosters.length);
      }, 4500);
    }
  };

  useEffect(() => {
    resetTimer();
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [currentIndex, isHovered, activePosters.length]);

  // Touch/Swipe Handlers for Mobile
  const handleTouchStart = (e: React.TouchEvent) => {
    setTouchStartX(e.targetTouches[0].clientX);
    setTouchEndX(null);
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    setTouchEndX(e.targetTouches[0].clientX);
  };

  const handleTouchEnd = () => {
    if (!touchStartX || !touchEndX) return;
    const distance = touchStartX - touchEndX;
    const isSwipeLeft = distance > 40;
    const isSwipeRight = distance < -40;

    if (isSwipeLeft) {
      handleNext();
    } else if (isSwipeRight) {
      handlePrev();
    }
    setTouchStartX(null);
    setTouchEndX(null);
  };

  const handleCtaClick = () => {
    if (linkedProduct) {
      onSelectProduct(linkedProduct);
    } else if (products.length > 0) {
      // Fallback to first matching or scroll
      onSelectProduct(products[0]);
    }
  };

  // Determine pricing display for visual badge
  let minPrice: number | null = null;
  if (linkedProduct) {
    if (linkedProduct.plans && linkedProduct.plans.length > 0) {
      minPrice = Math.min(...linkedProduct.plans.map((p) => p.price));
    } else if (linkedProduct.price) {
      minPrice = linkedProduct.price;
    }
  }

  return (
    <section 
      aria-label="Promotional Offers"
      className="w-[calc(100%-32px)] max-w-6xl mx-auto my-4 sm:my-6 select-none"
    >
      <div
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
        className="relative w-full h-[210px] sm:h-[240px] md:h-[270px] lg:h-[290px] rounded-2xl sm:rounded-3xl bg-gradient-to-r from-[#130B24] via-[#0E111C] to-[#0A121A] border border-purple-500/30 hover:border-purple-400/50 transition-all duration-300 overflow-hidden shadow-2xl shadow-purple-950/20 group flex items-center"
      >
        {/* Subtle Background Glow Spheres */}
        <div className="absolute -top-20 -left-20 w-56 h-56 bg-purple-600/20 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -bottom-20 -right-20 w-56 h-56 bg-teal-500/15 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute top-1/2 left-1/3 -translate-y-1/2 w-48 h-48 bg-indigo-500/10 rounded-full blur-2xl pointer-events-none" />

        {/* Diagonal Subtle Grid Pattern */}
        <div 
          className="absolute inset-0 opacity-[0.03] pointer-events-none" 
          style={{ backgroundImage: 'radial-gradient(#ffffff 1px, transparent 1px)', backgroundSize: '16px 16px' }}
        />

        {/* SLIDE CONTENT CONTAINER */}
        <div className="relative z-10 w-full h-full px-7 sm:px-10 lg:px-12 py-4 sm:py-6 flex items-center justify-between gap-3 sm:gap-8">
          
          {/* LEFT SIDE: TEXT & CTA */}
          <div className="flex-1 min-w-0 flex flex-col justify-center max-w-xl">
            
            {/* Category / Badge Pill */}
            <div className="flex items-center gap-2 mb-1 sm:mb-1.5">
              <span className="text-[10px] sm:text-xs font-black uppercase tracking-wider text-[#2DD4BF] bg-[#06201B] border border-[#059669]/40 px-2.5 py-0.5 rounded-full inline-flex items-center shadow-sm">
                <span>{currentPoster.badge || 'SPECIAL DEAL • SUBX NEPAL'}</span>
              </span>
            </div>

            {/* Poster Title */}
            <h3 className="text-base sm:text-2xl lg:text-3xl font-black text-white leading-tight tracking-tight truncate drop-shadow">
              {currentPoster.title}
            </h3>

            {/* Subtitle / Headline */}
            {currentPoster.subtitle && (
              <p className="text-xs sm:text-sm font-extrabold text-purple-300 mt-0.5 sm:mt-1 truncate">
                {currentPoster.subtitle}
              </p>
            )}

            {/* Description */}
            <p className="text-[11px] sm:text-xs text-slate-300 leading-snug line-clamp-2 mt-1 sm:mt-1.5 max-w-md">
              {currentPoster.description || linkedProduct?.description || 'Get instant activation on all your favorite digital subscriptions in Nepal.'}
            </p>

            {/* CTA Button */}
            <div className="mt-2.5 sm:mt-4">
              <button
                type="button"
                onClick={handleCtaClick}
                className="px-4 sm:px-5 py-2 sm:py-2.5 rounded-xl font-extrabold text-xs sm:text-sm bg-[#10B981] hover:bg-[#059669] text-slate-950 shadow-lg shadow-[#10B981]/25 active:scale-95 transition-all inline-flex items-center gap-1.5 cursor-pointer"
              >
                <span>{currentPoster.ctaText || 'Get Now'}</span>
                <ArrowRight className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
              </button>
            </div>
          </div>

          {/* RIGHT SIDE: PRODUCT VISUAL / LOGO & BADGE */}
          <div className="shrink-0 flex flex-col items-center justify-center relative">
            <div className="relative">
              {currentPoster.image ? (
                <div className="w-22 h-22 sm:w-32 sm:h-32 lg:w-36 lg:h-36 rounded-2xl bg-[#090D16] border border-slate-800 p-2 shadow-2xl flex items-center justify-center overflow-hidden">
                  <img
                    src={currentPoster.image}
                    alt={currentPoster.title}
                    className="w-full h-full object-contain drop-shadow-md select-none"
                  />
                </div>
              ) : linkedProduct ? (
                <div className="flex flex-col items-center">
                  <ProductLogoImage 
                    product={linkedProduct} 
                    className="w-20 h-20 sm:w-28 sm:h-28 lg:w-32 lg:h-32 shadow-2xl border-purple-500/30" 
                  />
                  {minPrice !== null && (
                    <span className="mt-1.5 text-[10px] sm:text-xs font-black text-white bg-slate-900/95 border border-purple-500/40 px-2.5 py-0.5 rounded-full shadow-md backdrop-blur-sm whitespace-nowrap">
                      NPR {minPrice.toLocaleString()}
                    </span>
                  )}
                </div>
              ) : (
                <div className="w-20 h-20 sm:w-28 sm:h-28 lg:w-32 lg:h-32 rounded-2xl bg-[#090D16] border border-slate-800 flex items-center justify-center p-3">
                  <Tag className="w-10 h-10 text-purple-400 opacity-80" />
                </div>
              )}

              {/* Additional discount badge cleanly overlaid on top-right of image */}
              {linkedProduct && (linkedProduct.badge || linkedProduct.discountPercent) && (
                <span className="absolute -top-1.5 -right-1.5 z-20 bg-[#052E2B] text-[#2DD4BF] border border-[#0D9488]/70 text-[9px] sm:text-[10px] font-black px-2 py-0.5 rounded-full shadow-xl uppercase tracking-wider whitespace-nowrap">
                  {linkedProduct.badge || `${linkedProduct.discountPercent}% OFF`}
                </span>
              )}
            </div>
          </div>

        </div>

        {/* NAVIGATION CONTROLS (Floating Chevrons) */}
        {activePosters.length > 1 && (
          <>
            <button
              type="button"
              onClick={handlePrev}
              className="absolute left-2 top-1/2 -translate-y-1/2 p-1.5 sm:p-2 rounded-full bg-slate-950/60 hover:bg-slate-900 text-slate-300 hover:text-white border border-slate-800 backdrop-blur-md opacity-70 group-hover:opacity-100 transition-all active:scale-90 z-20"
              title="Previous offer"
            >
              <ChevronLeft className="w-4 h-4 sm:w-5 sm:h-5 text-[#2DD4BF]" />
            </button>

            <button
              type="button"
              onClick={handleNext}
              className="absolute right-2 top-1/2 -translate-y-1/2 p-1.5 sm:p-2 rounded-full bg-slate-950/60 hover:bg-slate-900 text-slate-300 hover:text-white border border-slate-800 backdrop-blur-md opacity-70 group-hover:opacity-100 transition-all active:scale-90 z-20"
              title="Next offer"
            >
              <ChevronRight className="w-4 h-4 sm:w-5 sm:h-5 text-[#2DD4BF]" />
            </button>
          </>
        )}

        {/* ELEGANT PAGINATION DOTS */}
        {activePosters.length > 1 && (
          <div className="absolute bottom-2.5 left-1/2 -translate-x-1/2 z-20 flex items-center gap-1.5 bg-slate-950/70 backdrop-blur-md px-2.5 py-1 rounded-full border border-slate-800/80">
            {activePosters.map((_, idx) => (
              <button
                key={idx}
                type="button"
                onClick={() => setCurrentIndex(idx)}
                className={`transition-all rounded-full ${
                  safeIndex === idx
                    ? 'w-5 h-1.5 bg-[#2DD4BF] shadow-sm'
                    : 'w-1.5 h-1.5 bg-slate-600 hover:bg-slate-400'
                }`}
                title={`Go to slide ${idx + 1}`}
              />
            ))}
          </div>
        )}

      </div>
    </section>
  );
};

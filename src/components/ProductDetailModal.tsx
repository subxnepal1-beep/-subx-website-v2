import React, { useState, useEffect } from 'react';
import { Product, Plan, SiteSettings } from '../types';
import { ProductLogoImage } from './ProductCard';
import { X, Check, ShieldCheck, Zap, Mail, ArrowLeft, MessageCircle, ShoppingBag, AlertTriangle, AlertCircle } from 'lucide-react';

interface ProductDetailModalProps {
  product: Product | null;
  onClose: () => void;
  onAddToCart: (product: Product, selectedPlan: Plan, quantity: number, activationEmail?: string) => void;
  siteSettings?: SiteSettings;
}

export const ProductDetailModal: React.FC<ProductDetailModalProps> = ({
  product,
  onClose,
  onAddToCart,
  siteSettings
}) => {
  const [selectedPlanState, setSelectedPlanState] = useState<Plan | null>(null);
  const [activationEmail, setActivationEmail] = useState<string>('');
  const [addedToast, setAddedToast] = useState<boolean>(false);
  const [emailError, setEmailError] = useState<boolean>(false);

  const plans: Plan[] = (product && Array.isArray(product.plans) && product.plans.length > 0)
    ? product.plans
    : product ? [
        {
          id: 'default-plan',
          name: 'Standard Plan',
          price: product.price || 0,
          billingCycle: 'Month' as const,
          features: product.features || [],
          isPopular: true
        }
      ] : [];

  useEffect(() => {
    if (product) {
      const defaultPlan = plans.find((p) => p.isPopular) || plans[0];
      setSelectedPlanState(defaultPlan || null);
      setActivationEmail('');
      setEmailError(false);
      setAddedToast(false);
    }
  }, [product]);

  // Handle ESC key to close modal
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onClose]);

  if (!product) return null;

  const isOutOfStock = product.stock === 'Out of Stock' || product.stock_status === 'out_of_stock' || (product as any).inStock === false;

  const selectedPlan: Plan = plans.find((p) => p.id === selectedPlanState?.id) || selectedPlanState || plans.find((p) => p.isPopular) || plans[0] || {
    id: 'default-plan',
    name: 'Standard Plan',
    price: product.price || 0,
    billingCycle: 'Month' as const,
    features: product.features || [],
    isPopular: true
  };


  const handleAdd = () => {
    if (isOutOfStock) return;

    const trimmedEmail = activationEmail.trim();
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    if (trimmedEmail && !emailRegex.test(trimmedEmail)) {
      setEmailError(true);
      return;
    }

    setEmailError(false);
    onAddToCart(product, selectedPlan, 1, activationEmail);
    setAddedToast(true);
    setTimeout(() => {
      setAddedToast(false);
      onClose();
    }, 1200);
  };

  const handleWhatsAppClick = () => {
    const num = (siteSettings?.whatsappNumber || '9779765617156').replace(/[^0-9]/g, '');
    let message = '';
    if (isOutOfStock) {
      message = `Hello SubX Nepal! I want to inquire about ${product.name} (${selectedPlan.name}). When will this item be back in stock?`;
    } else {
      message = `Hello SubX Nepal! I want to order ${product.name} (${selectedPlan.name}) for NPR ${selectedPlan.price.toLocaleString()}.`;
      if (activationEmail.trim()) {
        message += `\n• Activation Email: ${activationEmail.trim()}`;
      }
    }
    const waUrl = `https://wa.me/${num}?text=${encodeURIComponent(message)}`;
    window.open(waUrl, '_blank', 'noopener,noreferrer');
  };

  const discount = product.discountPercent || product.discount_percentage || product.discount || 0;
  const originalPrice = discount > 0 ? Math.round(selectedPlan.price / (1 - discount / 100)) : null;

  const ratingVal = (product as any).rating;
  const reviewsCount = (product as any).reviewsCount || (product as any).reviews;

  return (
    <div 
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/80 backdrop-blur-xs overflow-y-auto animate-fade-in"
    >
      <div 
        className="relative w-full max-w-lg bg-white dark:bg-[#0B0F19] border border-slate-200/90 dark:border-slate-800 rounded-3xl overflow-hidden shadow-2xl my-auto flex flex-col max-h-[90vh] transition-colors duration-150"
        style={{ transform: 'translateZ(0)', backfaceVisibility: 'hidden' } as React.CSSProperties}
      >
        
        {/* Sticky Header Bar */}
        <div className="sticky top-0 z-30 bg-white/95 dark:bg-[#0B0F19]/95 backdrop-blur-md border-b border-slate-200/90 dark:border-slate-800/80 px-4 sm:px-5 py-3 flex items-center justify-between shrink-0">
          <button
            onClick={onClose}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-100 hover:bg-slate-200 dark:bg-slate-900 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-200 hover:text-slate-900 dark:hover:text-white rounded-xl text-xs font-bold transition-all border border-slate-200/80 dark:border-slate-800 shadow-xs active:scale-95 cursor-pointer"
          >
            <ArrowLeft className="w-4 h-4 text-cyan-600 dark:text-cyan-400" />
            <span>Back</span>
          </button>

          <span className="text-xs font-black text-slate-900 dark:text-white tracking-wider uppercase truncate max-w-[200px]">
            {product.name}
          </span>

          <button
            onClick={onClose}
            className="p-1.5 bg-slate-100 hover:bg-slate-200 dark:bg-slate-900 dark:hover:bg-slate-800 text-slate-500 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white rounded-full transition-all border border-slate-200/80 dark:border-slate-800 active:scale-95 cursor-pointer"
            title="Close"
          >
            <X className="w-4.5 h-4.5" />
          </button>
        </div>

        {/* Scrollable Modal Content */}
        <div className="overflow-y-auto flex-1 p-5 sm:p-6 space-y-4">
          
          {/* Header Card Block */}
          <div className="flex items-start gap-4">
            <div className="w-16 h-16 sm:w-20 sm:h-20 shrink-0 relative">
              <ProductLogoImage product={product} className={`w-full h-full object-contain rounded-2xl ${isOutOfStock ? 'opacity-60 grayscale-[30%]' : ''}`} />
              {isOutOfStock && (
                <div className="absolute inset-0 bg-slate-950/40 backdrop-blur-[1px] rounded-2xl flex items-center justify-center pointer-events-none">
                  <span className="text-[9px] font-black uppercase text-white bg-red-600 px-1.5 py-0.5 rounded shadow-sm">
                    Out
                  </span>
                </div>
              )}
            </div>
            <div className="flex flex-col min-w-0 flex-1 pt-0.5">
              <div className="flex items-center gap-2 flex-wrap">
                <span className="text-[10px] font-extrabold uppercase tracking-wider text-cyan-700 dark:text-cyan-400 bg-cyan-50 dark:bg-cyan-950/70 border border-cyan-200 dark:border-cyan-500/30 px-2 py-0.5 rounded-md">
                  {product.category}
                </span>
                {isOutOfStock ? (
                  <span className="text-[10px] font-black text-white bg-gradient-to-r from-red-600 to-rose-600 px-2 py-0.5 rounded-md uppercase tracking-wider shadow-xs flex items-center gap-1">
                    <span className="w-1.5 h-1.5 rounded-full bg-white animate-pulse" />
                    <span>OUT OF STOCK</span>
                  </span>
                ) : discount > 0 ? (
                  <span className="text-[10px] font-black text-white bg-gradient-to-r from-red-600 to-rose-600 px-2 py-0.5 rounded-md uppercase tracking-wider shadow-xs">
                    {discount}% OFF
                  </span>
                ) : null}
              </div>
              <h2 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white leading-tight mt-1.5">
                {product.name}
              </h2>
              <div className="flex items-center gap-2 mt-1.5">
                {isOutOfStock ? (
                  <span className="text-red-600 dark:text-red-400 text-[11px] font-extrabold inline-flex items-center gap-1">
                    <span className="w-1.5 h-1.5 rounded-full bg-red-500" />
                    <span>Out of Stock</span>
                  </span>
                ) : (
                  <span className="text-emerald-700 dark:text-emerald-400 text-[11px] font-bold inline-flex items-center gap-1">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                    <span>{product.stock || 'In Stock'}</span>
                  </span>
                )}
                {ratingVal && (
                  <span className="text-amber-600 dark:text-amber-400 font-bold text-[11px] inline-flex items-center gap-1 bg-amber-50 dark:bg-amber-950/40 border border-amber-300 dark:border-amber-500/20 px-2 py-0.2 rounded-md">
                    ★ {ratingVal} {reviewsCount ? `(${reviewsCount})` : ''}
                  </span>
                )}
              </div>
            </div>
          </div>

          {/* Description */}
          {product.description && (
            <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 leading-relaxed font-normal">
              {product.description}
            </p>
          )}

          {/* Out of Stock Notice Banner OR Warranty Banner */}
          {isOutOfStock ? (
            <div className="p-3.5 rounded-2xl bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-500/40 text-xs text-red-800 dark:text-red-200 flex items-start gap-2.5 shadow-xs">
              <AlertCircle className="w-4 h-4 text-red-600 dark:text-red-400 shrink-0 mt-0.5" />
              <div>
                <div className="font-bold">Item Currently Out of Stock</div>
                <div className="text-[11px] text-red-700 dark:text-red-300/80 mt-0.5">
                  This product is temporarily unavailable for direct purchase. You can inquire on WhatsApp for restocking updates.
                </div>
              </div>
            </div>
          ) : (
            <div className="p-3 rounded-2xl bg-emerald-50/70 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-500/30 text-xs text-slate-700 dark:text-slate-300 flex items-center justify-between gap-2 shadow-xs">
              <span className="flex items-center gap-2 font-bold text-emerald-700 dark:text-emerald-400">
                <ShieldCheck className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0" />
                <span>Full Duration Warranty & Instant Replacement</span>
              </span>
              <span className="text-slate-500 dark:text-slate-400 text-[11px] font-semibold flex items-center gap-1 shrink-0">
                <span>⏱ 5-15m WhatsApp</span>
              </span>
            </div>
          )}

          {/* SELECT PLAN / DURATION */}
          {plans.length > 0 && (
            <div className="space-y-2 pt-1">
              <div className="text-[11px] font-black text-slate-500 dark:text-slate-400 uppercase tracking-wider flex items-center justify-between">
                <span>Select Duration / Plan</span>
                <span className="text-[10px] text-cyan-600 dark:text-cyan-400 font-mono font-bold">
                  {isOutOfStock ? 'Pricing Reference' : 'Instant Activation'}
                </span>
              </div>
              <div className="space-y-2">
                {plans.map((plan) => {
                  const isSelected = selectedPlan.id === plan.id;
                  return (
                    <div
                      key={plan.id}
                      onClick={() => setSelectedPlanState(plan)}
                      className={`flex items-center justify-between p-3.5 rounded-2xl border text-xs sm:text-sm transition-all cursor-pointer ${
                        isSelected
                          ? isOutOfStock
                            ? 'bg-red-50/50 dark:bg-red-950/20 border-red-400 text-slate-900 dark:text-white font-bold ring-1 ring-red-500/30'
                            : 'bg-emerald-50/80 dark:bg-emerald-950/40 border-emerald-500 text-slate-900 dark:text-white font-bold shadow-xs ring-1 ring-emerald-500/40'
                          : 'bg-slate-50 dark:bg-slate-900/50 border-slate-200/90 dark:border-slate-800 text-slate-700 dark:text-slate-300 hover:border-slate-300 dark:hover:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-900/80'
                      }`}
                    >
                      <div className="flex items-center gap-2.5 min-w-0 pr-2">
                        <span className={`w-4 h-4 rounded-full flex items-center justify-center shrink-0 text-[10px] font-bold ${
                          isSelected
                            ? isOutOfStock ? 'bg-red-500 text-white' : 'bg-emerald-500 text-white'
                            : 'border border-slate-300 dark:border-slate-600 text-transparent'
                        }`}>
                          {isSelected ? '●' : '○'}
                        </span>
                        <span className="truncate font-semibold">{plan.name}</span>
                      </div>
                      <span className={`font-black shrink-0 font-mono text-sm ${isSelected ? isOutOfStock ? 'text-red-600 dark:text-red-400' : 'text-emerald-700 dark:text-emerald-400' : 'text-slate-900 dark:text-slate-200'}`}>
                        NPR {plan.price.toLocaleString()}
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* INCLUDED FEATURES */}
          <div className="pt-2 border-t border-slate-100 dark:border-slate-800/80">
            <div className="text-[11px] font-black text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-2">
              Included Features
            </div>
            <ul className="space-y-1.5">
              {((selectedPlan?.features && selectedPlan.features.length > 0)
                ? selectedPlan.features
                : (product.features || ['Instant WhatsApp Activation', 'Full Duration Warranty Guarantee'])
              ).map((feat, idx) => (
                <li key={idx} className="flex items-start gap-2 text-xs text-slate-700 dark:text-slate-300">
                  <Check className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400 shrink-0 mt-0.5" />
                  <span className="leading-snug font-medium">{feat}</span>
                </li>
              ))}
            </ul>
          </div>

          {/* Activation Email (if required and in stock) */}
          {product.requiresEmailInput && !isOutOfStock && (
            <div className="pt-2 border-t border-slate-100 dark:border-slate-800/80">
              <label className="block text-[11px] font-bold text-slate-700 dark:text-slate-300 mb-1.5 flex items-center gap-1">
                <Mail className="w-3.5 h-3.5 text-cyan-600 dark:text-cyan-400" />
                <span>Activation Email (Optional):</span>
              </label>
              <input
                type="email"
                value={activationEmail}
                onChange={(e) => {
                  setActivationEmail(e.target.value);
                  setEmailError(false);
                }}
                placeholder="e.g. yourname@gmail.com"
                className={`w-full bg-slate-50 dark:bg-slate-900/90 border ${
                  emailError ? 'border-red-500' : 'border-slate-300 dark:border-slate-800 focus:border-cyan-500'
                } rounded-xl px-3.5 py-2.5 text-xs text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none transition-colors`}
              />
              {emailError && (
                <span className="text-[10px] text-red-500 dark:text-red-400 mt-1 block font-medium">
                  Please enter a valid email address format.
                </span>
              )}
            </div>
          )}

          {/* Action Bar Footer */}
          <div className="pt-3 border-t border-slate-200 dark:border-slate-800/80 flex flex-col gap-3">
            <div className="flex items-center justify-between">
              <div>
                <span className="text-[10px] font-black text-slate-500 dark:text-slate-400 uppercase tracking-wider block">
                  PRICE
                </span>
                <div className="flex items-baseline gap-2 mt-0.5">
                  <span className={`text-xl sm:text-2xl font-black ${isOutOfStock ? 'text-slate-500 line-through' : 'text-cyan-600 dark:text-cyan-400'} tracking-tight font-mono`}>
                    NPR {selectedPlan.price.toLocaleString()}
                  </span>
                  {originalPrice && originalPrice > selectedPlan.price && !isOutOfStock && (
                    <span className="text-xs sm:text-sm font-normal text-slate-400 line-through font-mono">
                      NPR {originalPrice.toLocaleString()}
                    </span>
                  )}
                </div>
              </div>

              <div className="text-[11px] bg-slate-100 dark:bg-slate-900/90 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-800 px-2.5 py-1 rounded-lg font-medium flex items-center gap-1">
                {isOutOfStock ? (
                  <span className="text-red-500 font-bold">Out of Stock</span>
                ) : (
                  <>
                    <Zap className="w-3 h-3 text-cyan-500" />
                    <span>Instant Delivery</span>
                  </>
                )}
              </div>
            </div>

            <div className="grid grid-cols-2 gap-2.5">
              <button
                type="button"
                onClick={handleAdd}
                disabled={isOutOfStock}
                className={`flex items-center justify-center gap-1.5 py-3 px-3 rounded-2xl font-black text-xs sm:text-sm transition-all shadow-md active:scale-95 ${
                  isOutOfStock
                    ? 'bg-slate-200 dark:bg-slate-800/80 text-slate-400 dark:text-slate-500 cursor-not-allowed border border-slate-300 dark:border-slate-700/50 shadow-none'
                    : addedToast
                    ? 'bg-emerald-500 text-white cursor-pointer'
                    : 'bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 text-white shadow-cyan-600/20 cursor-pointer'
                }`}
              >
                {isOutOfStock ? (
                  <span>Out of Stock</span>
                ) : addedToast ? (
                  <>
                    <Check className="w-4 h-4 stroke-[3]" />
                    <span>Added to Cart!</span>
                  </>
                ) : (
                  <>
                    <ShoppingBag className="w-4 h-4" />
                    <span>Add to Cart</span>
                  </>
                )}
              </button>

              <button
                type="button"
                onClick={handleWhatsAppClick}
                className={`flex items-center justify-center gap-1.5 py-3 px-3 rounded-2xl font-black text-xs sm:text-sm ${
                  isOutOfStock
                    ? 'bg-slate-100 dark:bg-slate-900 hover:bg-slate-200 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-300 dark:border-slate-700'
                    : 'bg-emerald-50 dark:bg-emerald-950/40 hover:bg-emerald-100 dark:hover:bg-emerald-900/50 text-emerald-700 dark:text-emerald-300 border border-emerald-300 dark:border-emerald-500/40'
                } active:scale-95 transition-all cursor-pointer`}
              >
                <MessageCircle className="w-4 h-4 fill-emerald-500/20 text-emerald-600 dark:text-emerald-400" />
                <span>{isOutOfStock ? 'Inquire WhatsApp' : 'WhatsApp'}</span>
              </button>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
};

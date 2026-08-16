import React, { useState } from 'react';
import { Product, Plan, SiteSettings } from '../types';
import { Check, Zap, Mail, MessageCircle } from 'lucide-react';
import { ProductBanner } from './ProductBanners';

export const ProductLogoImage: React.FC<{
  product: Partial<Product> & { name?: string; bannerType?: any; image?: string; image_url?: string; logo_url?: string };
  className?: string;
}> = ({ product, className = 'w-14 h-14 sm:w-16 sm:h-16' }) => {
  const rawImage = product.image || product.image_url || product.logo_url || product.logoUrl || product.banner_image_url || product.bannerImageUrl || '';

  return (
    <div className={`relative overflow-hidden rounded-xl flex items-center justify-center ${className}`}>
      <ProductBanner
        type={product.bannerType || 'custom'}
        image={rawImage}
        productName={product.name || 'Product'}
        className="w-full h-full object-cover"
      />
    </div>
  );
};


interface ProductCardProps {
  product: Product;
  onAddToCart?: (product: Product, selectedPlan: Plan, quantity: number, activationEmail?: string) => void;
  onSelectProduct: (product: Product) => void;
  siteSettings?: SiteSettings;
}

export const ProductCard: React.FC<ProductCardProps> = ({
  product,
  onSelectProduct,
}) => {
  const plans = (Array.isArray(product.plans) && product.plans.length > 0)
    ? product.plans
    : [
        {
          id: 'default-plan',
          name: 'Standard Plan',
          price: product.price || 0,
          billingCycle: product.billing_period || 'month',
          features: product.features || [],
          isPopular: true
        }
      ];

  const minPrice = plans.length > 0 ? Math.min(...plans.map((p) => p.price)) : product.price || 0;
  const discount = product.discountPercent || product.discount_percentage || product.discount || 0;
  const isOutOfStock = product.stock === 'Out of Stock' || product.stock_status === 'out_of_stock' || (product as any).inStock === false;

  return (
    <div
      onClick={() => onSelectProduct(product)}
      className={`group relative flex flex-col bg-white dark:bg-[#0B0F19] hover:bg-slate-50 dark:hover:bg-[#0E1524] border ${
        isOutOfStock 
          ? 'border-red-900/30 hover:border-red-500/40 opacity-95' 
          : 'border-slate-200/90 dark:border-slate-800/90 hover:border-cyan-500/50 dark:hover:border-cyan-500/50'
      } rounded-2xl sm:rounded-3xl p-2.5 sm:p-3 transition-[transform,border-color,box-shadow] duration-150 shadow-xs hover:shadow-lg hover:shadow-cyan-950/20 hover:-translate-y-0.5 active:scale-[0.98] cursor-pointer select-none`}
      style={{ transform: 'translateZ(0)', backfaceVisibility: 'hidden' } as React.CSSProperties}
    >
      {/* Top Image Container */}
      <div className="relative w-full aspect-square rounded-xl sm:rounded-2xl bg-slate-100/80 dark:bg-[#060913] border border-slate-200/70 dark:border-slate-800/80 overflow-hidden flex items-center justify-center p-2.5 shadow-inner">
        {/* Background glow on hover */}
        <div className="absolute inset-0 bg-gradient-to-tr from-cyan-500/0 via-cyan-500/0 to-purple-500/0 group-hover:from-cyan-500/10 group-hover:to-purple-500/15 transition-opacity duration-150 pointer-events-none" />

        {/* Product Artwork/Logo */}
        <div className={`w-full h-full flex items-center justify-center ${isOutOfStock ? 'opacity-50 grayscale-[30%]' : ''}`}>
          <ProductLogoImage product={product} className="w-full h-full object-contain rounded-xl" />
        </div>

        {/* Discount Badge - Always on top in front of logo */}
        {discount > 0 ? (
          <span className="absolute top-2 left-2 z-20 bg-gradient-to-r from-red-600 to-rose-600 text-white text-[9px] sm:text-[10px] font-black px-2 py-0.5 rounded-md shadow-md shadow-red-950/40 uppercase tracking-wider select-none pointer-events-none">
            {discount}% OFF
          </span>
        ) : product.badge ? (
          <span className="absolute top-2 left-2 z-20 bg-cyan-600 dark:bg-cyan-950/90 text-white dark:text-cyan-300 border border-cyan-400/40 dark:border-cyan-500/40 text-[9px] sm:text-[10px] font-black px-2 py-0.5 rounded-md shadow-md uppercase tracking-wider select-none pointer-events-none">
            {product.badge}
          </span>
        ) : null}

        {/* Out of Stock Overlay Badge */}
        {isOutOfStock ? (
          <div className="absolute inset-0 z-30 flex items-center justify-center bg-slate-950/65 backdrop-blur-[2px] rounded-xl sm:rounded-2xl transition-all">
            <span className="px-2.5 py-1 bg-gradient-to-r from-red-600 to-rose-600 text-white text-[10px] sm:text-xs font-black uppercase tracking-wider rounded-lg shadow-xl shadow-red-950/80 border border-red-400/50 flex items-center gap-1.5 select-none">
              <span className="w-1.5 h-1.5 rounded-full bg-white animate-pulse" />
              <span>Out of Stock</span>
            </span>
          </div>
        ) : (
          /* Fast Delivery Tag */
          <div className="absolute bottom-1.5 right-1.5 z-20 pointer-events-none">
            <span className="text-[9px] font-bold text-emerald-600 dark:text-emerald-400 bg-white/95 dark:bg-emerald-950/95 border border-emerald-300/80 dark:border-emerald-500/40 px-1.5 py-0.5 rounded-md shadow-sm flex items-center gap-0.5">
              <Zap className="w-2.5 h-2.5" />
              <span className="hidden sm:inline">Instant</span>
            </span>
          </div>
        )}
      </div>

      {/* Info Content */}
      <div className="pt-2.5 px-1 flex flex-col flex-1 justify-between">
        <div>
          {/* Title */}
          <h3
            className="font-bold text-slate-900 dark:text-white text-xs sm:text-sm leading-snug line-clamp-2 min-h-[2rem] sm:min-h-[2.25rem] group-hover:text-cyan-600 dark:group-hover:text-cyan-400 transition-colors"
            title={product.name}
          >
            {product.name}
          </h3>

          {/* Pricing Row */}
          <div className="mt-1.5 flex items-baseline gap-1.5">
            <span className="text-sm sm:text-base font-extrabold text-cyan-600 dark:text-cyan-400">
              Rs. {minPrice.toLocaleString()}
            </span>
            <span className="text-[10px] sm:text-xs text-slate-500 dark:text-slate-400 font-medium">
              / {plans[0]?.billingCycle || 'month'}
            </span>
          </div>
        </div>

        {/* Action Button */}
        <div className="mt-2.5 pt-2 border-t border-slate-100 dark:border-slate-800/80 flex items-center justify-between gap-1">
          <span className="text-[10px] font-bold text-slate-500 dark:text-slate-400">
            {plans.length} {plans.length === 1 ? 'plan' : 'plans'}
          </span>
          <button
            type="button"
            className="px-2.5 py-1 bg-cyan-600 hover:bg-cyan-500 text-white text-[10px] sm:text-xs font-black rounded-lg transition-colors shadow-xs group-hover:shadow-cyan-500/20"
          >
            View Plans
          </button>
        </div>
      </div>
    </div>
  );
};

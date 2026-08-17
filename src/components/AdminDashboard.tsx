import React, { useState, useEffect } from 'react';
import {
  Product,
  Order,
  SiteSettings,
  PromotionalPoster,
  PromoCode,
  CustomerReview
} from '../types';
import {
  Package,
  ShoppingBag,
  Sparkles,
  Tag,
  Globe,
  Database,
  Layers,
  ShieldCheck,
  KeyRound
} from 'lucide-react';
import { supabase, isSupabaseConfigured } from '../lib/supabase';
import { AdminHeader } from './admin/AdminHeader';
import { AdminLogin } from './admin/AdminLogin';
import { AdminProductsTab } from './admin/AdminProductsTab';
import { AdminOrdersTab } from './admin/AdminOrdersTab';
import { AdminPostersTab } from './admin/AdminPostersTab';
import { AdminPromosTab } from './admin/AdminPromosTab';
import { AdminBrandingTab } from './admin/AdminBrandingTab';
import { AdminDatabaseTab } from './admin/AdminDatabaseTab';
import { AdminSecurityTab } from './admin/AdminSecurityTab';

interface AdminDashboardProps {
  isOpen: boolean;
  onClose: () => void;
  isAuthenticated: boolean;
  onLogin: (email: string) => void;
  onLogout: () => void;
  products: Product[];
  orders: Order[];
  siteSettings?: SiteSettings;
  onUpdateSiteSettings: (settings: Partial<SiteSettings>) => Promise<void> | void;
  promotionalPosters?: PromotionalPoster[];
  onAddPoster?: (poster: Omit<PromotionalPoster, 'id'>) => void;
  onUpdatePoster?: (id: string, poster: Partial<PromotionalPoster>) => void;
  onDeletePoster?: (id: string) => void;
  onTogglePosterActive?: (id: string) => void;
  promoCodes?: PromoCode[];
  onAddPromoCode?: (promo: Omit<PromoCode, 'id'>) => Promise<void> | void;
  onUpdatePromoCode?: (id: string, promo: Partial<PromoCode>) => Promise<void> | void;
  onDeletePromoCode?: (id: string) => Promise<void> | void;
  onTogglePromoCodeActive?: (id: string) => Promise<void> | void;
  reviews?: CustomerReview[];
  onAddReview?: (review: Omit<CustomerReview, 'id' | 'created_at'>) => Promise<void> | void;
  onUpdateReview?: (id: string, review: Partial<CustomerReview>) => Promise<void> | void;
  onDeleteReview?: (id: string) => Promise<void> | void;
  onAddProduct: (product: Product) => Promise<void> | void;
  onUpdateProduct: (product: Product) => Promise<void> | void;
  onDeleteProduct: (productId: string) => Promise<void> | void;
  onUpdateOrderStatus: (orderId: string, status: Order['status']) => Promise<void> | void;
  onDeleteOrder: (orderId: string) => Promise<void> | void;
  onResetProducts: () => void;
}

type AdminTab = 'products' | 'orders' | 'posters' | 'promos' | 'branding' | 'database' | 'security';

export const AdminDashboard: React.FC<AdminDashboardProps> = ({
  isOpen,
  onClose,
  isAuthenticated,
  onLogin,
  onLogout,
  products,
  orders,
  siteSettings,
  onUpdateSiteSettings,
  promotionalPosters = [],
  onAddPoster,
  onUpdatePoster,
  onDeletePoster,
  onTogglePosterActive,
  promoCodes = [],
  onAddPromoCode,
  onUpdatePromoCode,
  onDeletePromoCode,
  onTogglePromoCodeActive,
  onAddProduct,
  onUpdateProduct,
  onDeleteProduct,
  onUpdateOrderStatus,
  onDeleteOrder,
  onResetProducts,
}) => {
  const [activeTab, setActiveTab] = useState<AdminTab>('products');
  const [currentUserEmail, setCurrentUserEmail] = useState<string | null>(null);

  // Validate active Supabase Auth session whenever dashboard is opened or tab changes
  useEffect(() => {
    if (!isOpen) return;

    if (isSupabaseConfigured && supabase) {
      supabase.auth.getUser().then(({ data: { user }, error }) => {
        if (error || !user) {
          if (isAuthenticated) {
            handleLogout();
          }
        } else {
          setCurrentUserEmail(user.email || null);
        }
      }).catch(() => {
        if (isAuthenticated) {
          handleLogout();
        }
      });
    }
  }, [isOpen, isAuthenticated, activeTab]);

  if (!isOpen) return null;

  const handleLoginSuccess = (email: string) => {
    setCurrentUserEmail(email);
    onLogin(email);
  };

  const handleLogout = () => {
    setCurrentUserEmail(null);
    onLogout();
  };

  const pendingOrdersCount = orders.filter((o) => o.status === 'Pending').length;
  const outOfStockCount = products.filter((p) => p.stock === 'Out of Stock').length;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 bg-slate-950/85 backdrop-blur-md animate-fade-in">
      <div className="relative w-full max-w-6xl h-[92vh] bg-[#07090E] border border-slate-800 rounded-3xl shadow-2xl overflow-hidden flex flex-col">
        
        {/* Header Bar */}
        <AdminHeader
          isAuthenticated={isAuthenticated}
          currentUserEmail={currentUserEmail}
          onLogout={handleLogout}
          onClose={onClose}
        />

        {/* Body Content */}
        {!isAuthenticated ? (
          <div className="flex-1 overflow-y-auto flex items-center justify-center">
            <AdminLogin 
              onLoginSuccess={handleLoginSuccess}
              siteSettings={siteSettings}
            />
          </div>
        ) : (
          <div className="flex-1 flex flex-col min-h-0 bg-[#07090E]">
            
            {/* Top Navigation Tabs */}
            <div className="px-4 sm:px-6 pt-3 bg-[#0A0D14] border-b border-slate-800 shrink-0 overflow-x-auto scrollbar-none">
              <div className="flex items-center gap-2 min-w-max pb-3">
                
                {/* 1. Products Tab */}
                <button
                  type="button"
                  onClick={() => setActiveTab('products')}
                  className={`px-4 py-2.5 rounded-xl text-xs font-black transition-all flex items-center gap-2 cursor-pointer border ${
                    activeTab === 'products'
                      ? 'bg-purple-600/20 text-purple-300 border-purple-500/60 shadow-lg shadow-purple-950/40'
                      : 'bg-slate-900/60 text-slate-400 border-slate-800 hover:text-white hover:bg-slate-900'
                  }`}
                >
                  <Package className="w-4 h-4" />
                  <span>Products Catalog</span>
                  <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-slate-800 text-slate-300 font-mono">
                    {products.length}
                  </span>
                  {outOfStockCount > 0 && (
                    <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-red-950 text-red-300 border border-red-800 font-mono">
                      {outOfStockCount} Out
                    </span>
                  )}
                </button>

                {/* 2. Orders Tab */}
                <button
                  type="button"
                  onClick={() => setActiveTab('orders')}
                  className={`px-4 py-2.5 rounded-xl text-xs font-black transition-all flex items-center gap-2 cursor-pointer border ${
                    activeTab === 'orders'
                      ? 'bg-purple-600/20 text-purple-300 border-purple-500/60 shadow-lg shadow-purple-950/40'
                      : 'bg-slate-900/60 text-slate-400 border-slate-800 hover:text-white hover:bg-slate-900'
                  }`}
                >
                  <ShoppingBag className="w-4 h-4" />
                  <span>Orders Fulfillment</span>
                  <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-slate-800 text-slate-300 font-mono">
                    {orders.length}
                  </span>
                  {pendingOrdersCount > 0 && (
                    <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-amber-950 text-amber-300 border border-amber-800 font-mono animate-pulse">
                      {pendingOrdersCount} New
                    </span>
                  )}
                </button>

                {/* 3. Posters / Carousel Tab */}
                <button
                  type="button"
                  onClick={() => setActiveTab('posters')}
                  className={`px-4 py-2.5 rounded-xl text-xs font-black transition-all flex items-center gap-2 cursor-pointer border ${
                    activeTab === 'posters'
                      ? 'bg-purple-600/20 text-purple-300 border-purple-500/60 shadow-lg shadow-purple-950/40'
                      : 'bg-slate-900/60 text-slate-400 border-slate-800 hover:text-white hover:bg-slate-900'
                  }`}
                >
                  <Sparkles className="w-4 h-4 text-cyan-400" />
                  <span>Promotional Banners</span>
                  <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-slate-800 text-slate-300 font-mono">
                    {promotionalPosters.length}
                  </span>
                </button>

                {/* 4. Promo Codes Tab */}
                <button
                  type="button"
                  onClick={() => setActiveTab('promos')}
                  className={`px-4 py-2.5 rounded-xl text-xs font-black transition-all flex items-center gap-2 cursor-pointer border ${
                    activeTab === 'promos'
                      ? 'bg-purple-600/20 text-purple-300 border-purple-500/60 shadow-lg shadow-purple-950/40'
                      : 'bg-slate-900/60 text-slate-400 border-slate-800 hover:text-white hover:bg-slate-900'
                  }`}
                >
                  <Tag className="w-4 h-4 text-amber-400" />
                  <span>Promo Codes</span>
                  <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-slate-800 text-slate-300 font-mono">
                    {promoCodes.length}
                  </span>
                </button>

                {/* 5. Branding Tab */}
                <button
                  type="button"
                  onClick={() => setActiveTab('branding')}
                  className={`px-4 py-2.5 rounded-xl text-xs font-black transition-all flex items-center gap-2 cursor-pointer border ${
                    activeTab === 'branding'
                      ? 'bg-purple-600/20 text-purple-300 border-purple-500/60 shadow-lg shadow-purple-950/40'
                      : 'bg-slate-900/60 text-slate-400 border-slate-800 hover:text-white hover:bg-slate-900'
                  }`}
                >
                  <Globe className="w-4 h-4 text-emerald-400" />
                  <span>Branding & WhatsApp</span>
                </button>

                {/* 6. Database Tab */}
                <button
                  type="button"
                  onClick={() => setActiveTab('database')}
                  className={`px-4 py-2.5 rounded-xl text-xs font-black transition-all flex items-center gap-2 cursor-pointer border ${
                    activeTab === 'database'
                      ? 'bg-purple-600/20 text-purple-300 border-purple-500/60 shadow-lg shadow-purple-950/40'
                      : 'bg-slate-900/60 text-slate-400 border-slate-800 hover:text-white hover:bg-slate-900'
                  }`}
                >
                  <Database className="w-4 h-4 text-cyan-400" />
                  <span>Supabase Database</span>
                </button>

                {/* 7. Security & Password Tab */}
                <button
                  type="button"
                  onClick={() => setActiveTab('security')}
                  className={`px-4 py-2.5 rounded-xl text-xs font-black transition-all flex items-center gap-2 cursor-pointer border ${
                    activeTab === 'security'
                      ? 'bg-purple-600/20 text-purple-300 border-purple-500/60 shadow-lg shadow-purple-950/40'
                      : 'bg-slate-900/60 text-slate-400 border-slate-800 hover:text-white hover:bg-slate-900'
                  }`}
                >
                  <ShieldCheck className="w-4 h-4 text-purple-400" />
                  <span>Security & Password</span>
                </button>

              </div>
            </div>

            {/* Tab Body View */}
            <div className="flex-1 overflow-y-auto bg-[#07090E] scrollbar-thin">
              {activeTab === 'products' && (
                <AdminProductsTab
                  products={products}
                  onAddProduct={onAddProduct}
                  onUpdateProduct={onUpdateProduct}
                  onDeleteProduct={onDeleteProduct}
                  onResetProducts={onResetProducts}
                />
              )}

              {activeTab === 'orders' && (
                <AdminOrdersTab
                  orders={orders}
                  onUpdateOrderStatus={onUpdateOrderStatus}
                  onDeleteOrder={onDeleteOrder}
                />
              )}

              {activeTab === 'posters' && (
                <AdminPostersTab
                  promotionalPosters={promotionalPosters}
                  products={products}
                  siteSettings={siteSettings}
                  onUpdateSiteSettings={onUpdateSiteSettings}
                  onAddPoster={onAddPoster}
                  onUpdatePoster={onUpdatePoster}
                  onDeletePoster={onDeletePoster}
                  onTogglePosterActive={onTogglePosterActive}
                />
              )}

              {activeTab === 'promos' && (
                <AdminPromosTab
                  promoCodes={promoCodes}
                  onAddPromoCode={onAddPromoCode}
                  onUpdatePromoCode={onUpdatePromoCode}
                  onDeletePromoCode={onDeletePromoCode}
                  onTogglePromoCodeActive={onTogglePromoCodeActive}
                />
              )}

              {activeTab === 'branding' && (
                <AdminBrandingTab
                  siteSettings={siteSettings}
                  onUpdateSiteSettings={onUpdateSiteSettings}
                />
              )}

              {activeTab === 'database' && (
                <AdminDatabaseTab />
              )}

              {activeTab === 'security' && (
                <AdminSecurityTab 
                  currentUserEmail={currentUserEmail}
                  onLogout={handleLogout}
                  siteSettings={siteSettings}
                  onUpdateSiteSettings={onUpdateSiteSettings}
                />
              )}
            </div>

          </div>
        )}

      </div>
    </div>
  );
};

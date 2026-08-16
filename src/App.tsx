import React, { useState, useEffect, useMemo } from 'react';
import { useSubXStore } from './lib/store';
import { Product, Plan } from './types';
import { Header } from './components/Header';
import { Hero } from './components/Hero';
import { ProductCard } from './components/ProductCard';
import { ProductDetailModal } from './components/ProductDetailModal';
import { CartDrawer } from './components/CartDrawer';
import { PaymentMethodsSection } from './components/PaymentMethodsSection';
import { FAQSection } from './components/FAQSection';
import { WhyChooseSubX } from './components/WhyChooseSubX';
import { Footer } from './components/Footer';
import { AdminDashboard } from './components/AdminDashboard';
import { PromotionalCarousel } from './components/PromotionalCarousel';
import { AIChatbot } from './components/AIChatbot';
import { AnnouncementModal } from './components/AnnouncementModal';
import { Sparkles, Layers, Search, Flame, Filter } from 'lucide-react';

export default function App() {
  const store = useSubXStore();

  // Dark / Light Mode Theme state with localStorage persistence
  const [theme, setTheme] = useState<'dark' | 'light'>(() => {
    try {
      const saved = localStorage.getItem('subx_theme');
      if (saved === 'light' || saved === 'dark') return saved;
    } catch {}
    return 'dark';
  });

  const toggleTheme = () => {
    const next = theme === 'dark' ? 'light' : 'dark';
    const root = document.documentElement;
    if (next === 'light') {
      root.classList.remove('dark');
      root.classList.add('light');
    } else {
      root.classList.remove('light');
      root.classList.add('dark');
    }
    setTheme(next);
    try {
      localStorage.setItem('subx_theme', next);
    } catch {}
  };

  // Selected Category Filter State
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [searchQuery, setSearchQuery] = useState<string>('');

  // Selected Product for Detail Modal
  const [detailProduct, setDetailProduct] = useState<Product | null>(null);

  // Cart Drawer Visibility
  const [isCartOpen, setIsCartOpen] = useState<boolean>(false);

  // Admin Modal Visibility (Direct URL /admin)
  const [isAdminOpen, setIsAdminOpen] = useState<boolean>(() => {
    if (typeof window !== 'undefined') {
      const path = window.location.pathname.toLowerCase();
      const hash = window.location.hash.toLowerCase();
      const search = window.location.search.toLowerCase();
      return path.endsWith('/admin') || path === '/admin' || hash === '#admin' || search.includes('admin');
    }
    return false;
  });

  const openAdmin = () => {
    setIsAdminOpen(true);
    try {
      if (window.history && typeof window.history.pushState === 'function') {
        const currentPath = window.location.pathname.toLowerCase();
        if (!currentPath.endsWith('/admin')) {
          window.history.pushState(null, '', '/admin');
        }
      }
    } catch {}
  };

  const closeAdmin = () => {
    setIsAdminOpen(false);
    try {
      if (window.history && typeof window.history.pushState === 'function') {
        const currentPath = window.location.pathname.toLowerCase();
        if (currentPath.endsWith('/admin')) {
          window.history.pushState(null, '', '/');
        }
      }
    } catch {}
  };

  // URL /admin, #admin listener & sync
  useEffect(() => {
    const handleUrlChange = () => {
      const path = window.location.pathname.toLowerCase();
      const hash = window.location.hash.toLowerCase();
      const search = window.location.search.toLowerCase();
      if (path.endsWith('/admin') || path === '/admin' || hash === '#admin' || search.includes('admin')) {
        setIsAdminOpen(true);
      }
    };

    window.addEventListener('popstate', handleUrlChange);
    window.addEventListener('hashchange', handleUrlChange);

    return () => {
      window.removeEventListener('popstate', handleUrlChange);
      window.removeEventListener('hashchange', handleUrlChange);
    };
  }, []);



  // Unique categories from products (memoized)
  const allCategories = useMemo(() => {
    return ['All', ...Array.from(new Set(store.products.map((p) => p.category || 'Other')))];
  }, [store.products]);

  // Filter products by selected category and search query (memoized)
  const filteredProducts = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    return store.products.filter((p) => {
      const matchesCategory = selectedCategory === 'All' || p.category === selectedCategory;
      if (!matchesCategory) return false;
      if (!q) return true;
      return (
        p.name.toLowerCase().includes(q) ||
        (p.category && p.category.toLowerCase().includes(q)) ||
        (p.description && p.description.toLowerCase().includes(q))
      );
    });
  }, [store.products, selectedCategory, searchQuery]);

  const scrollToSection = (id: string) => {
    const el = document.getElementById(id);
    if (el) {
      el.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  return (
    <div className={`min-h-screen ${theme === 'light' ? 'bg-[#F8FAFC] text-slate-900' : 'bg-[#0A0D14] text-slate-100'} flex flex-col font-sans selection:bg-cyan-500/30`}>
      
      {/* Navigation Header */}
      <Header
        cartItemCount={store.cartItemCount}
        onOpenCart={() => setIsCartOpen(true)}
        isAdminAuthenticated={store.isAdminAuthenticated}
        onScrollToSection={scrollToSection}
        siteSettings={store.siteSettings}
        theme={theme}
        onToggleTheme={toggleTheme}
      />

      {/* Hero Section */}
      <Hero
        onBrowseClick={() => scrollToSection('products')}
        siteSettings={store.siteSettings}
        theme={theme}
      />

      {/* Promotional Poster Banner Carousel */}
      <PromotionalCarousel
        posters={store.promotionalPosters}
        products={store.products}
        siteSettings={store.siteSettings}
        onSelectProduct={(prod) => setDetailProduct(prod)}
      />

      {/* Main Content Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-10 sm:py-16">
        
        {/* PRODUCTS SECTION */}
        <section id="products" className="scroll-mt-24">
          
          {/* Products Header & Category Filters & Search */}
          <div className="flex flex-col gap-4 pb-6 border-b border-slate-200 dark:border-slate-800/80">
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
              <div>
                <h2 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white tracking-tight">
                  Subscriptions & Deals
                </h2>
                <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1">
                  Select your product for instant WhatsApp activation & full warranty.
                </p>
              </div>

              {/* Quick Search Input */}
              <div className="relative w-full md:w-72">
                <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 dark:text-slate-500 pointer-events-none" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search subscriptions..."
                  className="w-full bg-white dark:bg-[#080C14] border border-slate-300 dark:border-slate-800 focus:border-cyan-500 rounded-xl pl-10 pr-4 py-2.5 text-xs text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none transition-all shadow-xs"
                />
                {searchQuery && (
                  <button
                    type="button"
                    onClick={() => setSearchQuery('')}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-700 dark:hover:text-white text-xs cursor-pointer"
                  >
                    ✕
                  </button>
                )}
              </div>
            </div>

            {/* Category Filter Pills */}
            <div className="flex items-center gap-2 overflow-x-auto pb-1 md:pb-0 scrollbar-none p-1 bg-slate-100/90 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800/80 rounded-2xl">
              {allCategories.map((cat) => {
                const isSelected = selectedCategory === cat;
                const count = cat === 'All' 
                  ? store.products.length 
                  : store.products.filter((p) => (p.category || 'Other') === cat).length;

                return (
                  <button
                    key={cat}
                    onClick={() => {
                      setSelectedCategory(cat);
                    }}
                    className={`px-3 sm:px-4 py-1.5 rounded-xl text-xs font-extrabold transition-all duration-200 whitespace-nowrap flex items-center gap-1.5 cursor-pointer ${
                      isSelected
                        ? 'bg-gradient-to-r from-cyan-500 via-indigo-500 to-purple-600 text-white shadow-md shadow-cyan-950/20 scale-[1.02]'
                        : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200 hover:bg-white dark:hover:bg-slate-800/70 shadow-xs dark:shadow-none'
                    }`}
                  >
                    <span>{cat}</span>
                    <span className={`text-[10px] px-1.5 py-0.2 rounded-full font-mono font-bold ${
                      isSelected 
                        ? 'bg-black/30 text-white' 
                        : 'bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-400'
                    }`}>
                      {count}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* UNIFIED PROFESSIONAL PRODUCT GRID */}
          <div className="mt-6">
            <div className="flex items-center justify-between gap-4 mb-5">
              <div className="flex items-center gap-2">
                <span className="p-1 rounded-lg bg-cyan-50 dark:bg-cyan-500/10 text-cyan-600 dark:text-cyan-400 border border-cyan-200 dark:border-cyan-500/20">
                  <Flame className="w-4 h-4 fill-current" />
                </span>
                <h3 className="text-base sm:text-lg font-black text-slate-900 dark:text-white tracking-tight">
                  {searchQuery 
                    ? `Results for "${searchQuery}"` 
                    : selectedCategory === 'All' 
                      ? 'Popular Subscriptions' 
                      : selectedCategory
                  }
                </h3>
              </div>
              <div className="flex-1 h-px bg-slate-200 dark:bg-slate-800/80 mx-2" />
              <span className="text-xs font-mono text-slate-700 dark:text-slate-400 shrink-0 font-bold bg-white dark:bg-slate-900 px-2.5 py-1 rounded-lg border border-slate-200 dark:border-slate-800 shadow-xs">
                {filteredProducts.length} items
              </span>
            </div>

            {filteredProducts.length === 0 ? (
              <div className="py-16 text-center bg-white dark:bg-[#070A12] border border-slate-200 dark:border-slate-800/80 rounded-3xl p-8 shadow-sm">
                <div className="w-12 h-12 rounded-2xl bg-slate-100 dark:bg-slate-900 text-slate-400 dark:text-slate-500 flex items-center justify-center mx-auto mb-3">
                  <Search className="w-6 h-6" />
                </div>
                <p className="text-sm font-bold text-slate-800 dark:text-slate-300">No subscriptions found</p>
                <p className="text-xs text-slate-500 mt-1">Try searching with another keyword or select All.</p>
                <button
                  type="button"
                  onClick={() => { setSelectedCategory('All'); setSearchQuery(''); }}
                  className="mt-4 px-4 py-2 bg-cyan-50 dark:bg-cyan-500/20 text-cyan-700 dark:text-cyan-400 border border-cyan-300 dark:border-cyan-500/40 rounded-xl text-xs font-bold hover:bg-cyan-100 dark:hover:bg-cyan-500/30 transition-all cursor-pointer"
                >
                  Clear Filter
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3 sm:gap-4">
                {filteredProducts.map((product) => (
                  <ProductCard
                    key={product.id}
                    product={product}
                    onSelectProduct={(prod) => setDetailProduct(prod)}
                    siteSettings={store.siteSettings}
                  />
                ))}
              </div>
            )}
          </div>

        </section>

        {/* Accepted Payment Methods Section */}
        <PaymentMethodsSection />

        {/* FAQ Section */}
        <FAQSection />

        {/* Why Choose SubX Nepal Section */}
        <WhyChooseSubX siteSettings={store.siteSettings} />

      </main>

      {/* Footer */}
      <Footer
        onScrollToSection={scrollToSection}
        siteSettings={store.siteSettings}
      />

      {/* Product Details Modal */}
      <ProductDetailModal
        product={detailProduct}
        onClose={() => setDetailProduct(null)}
        onAddToCart={(prod, plan, qty, email) => store.addToCart(prod, plan, qty, email)}
        siteSettings={store.siteSettings}
      />

      {/* Cart Drawer */}
      <CartDrawer
        isOpen={isCartOpen}
        onClose={() => setIsCartOpen(false)}
        cart={store.cart}
        cartTotal={store.cartTotal}
        orders={store.myOrders}
        siteSettings={store.siteSettings}
        promoCodes={store.promoCodes}
        onUpdateQuantity={store.updateCartQuantity}
        onRemoveItem={store.removeFromCart}
        onClearCart={store.clearCart}
        onValidatePromoCode={store.validatePromoCode}
        onCreateOrder={store.createOrder}
      />

      {/* Admin Dashboard Modal */}
      <AdminDashboard
        isOpen={isAdminOpen}
        onClose={closeAdmin}
        isAuthenticated={store.isAdminAuthenticated}
        onLogin={store.loginAdmin}
        onLogout={store.logoutAdmin}
        products={store.products}
        orders={store.orders}
        siteSettings={store.siteSettings}
        onUpdateSiteSettings={store.updateSiteSettings}
        promotionalPosters={store.promotionalPosters}
        onAddPoster={store.addPromotionalPoster}
        onUpdatePoster={store.updatePromotionalPoster}
        onDeletePoster={store.deletePromotionalPoster}
        onTogglePosterActive={store.togglePromotionalPosterActive}
        promoCodes={store.promoCodes}
        onAddPromoCode={store.addPromoCode}
        onUpdatePromoCode={store.updatePromoCode}
        onDeletePromoCode={store.deletePromoCode}
        onTogglePromoCodeActive={store.togglePromoCodeActive}
        reviews={store.reviews}
        onAddReview={store.addReview}
        onUpdateReview={store.updateReview}
        onDeleteReview={store.deleteReview}
        onAddProduct={store.addProduct}
        onUpdateProduct={store.updateProduct}
        onDeleteProduct={store.deleteProduct}
        onUpdateOrderStatus={store.updateOrderStatus}
        onDeleteOrder={store.deleteOrder}
        onResetProducts={store.resetProductsToDefault}
      />

      {/* Floating AI Assistant Chatbot on Right */}
      <AIChatbot
        products={store.products}
        siteSettings={store.siteSettings}
        promoCodes={store.promoCodes}
        onSelectProduct={(prod) => setDetailProduct(prod)}
        onOpenCart={() => setIsCartOpen(true)}
      />

      {/* Website Opening Announcement Popup (WhatsApp Community) */}
      <AnnouncementModal siteSettings={store.siteSettings} />

    </div>
  );
}

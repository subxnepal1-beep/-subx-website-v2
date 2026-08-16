import React, { useState } from 'react';
import { CartItem, Order, SiteSettings, PromoCode } from '../types';
import { ProductBanner } from './ProductBanners';
import { ProductLogoImage } from './ProductCard';
import { X, Trash2, Plus, Minus, MessageCircle, ShoppingBag, ShieldCheck, Mail, User, CheckCircle2, Clock, Search, PackageCheck, AlertCircle, Tag } from 'lucide-react';
import { DISPLAY_WHATSAPP, WHATSAPP_NUMBER } from '../lib/store';

interface CartDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  cart: CartItem[];
  cartTotal: number;
  orders?: Order[];
  siteSettings?: SiteSettings;
  promoCodes?: PromoCode[];
  onUpdateQuantity: (cartItemId: string, newQty: number) => void;
  onRemoveItem: (cartItemId: string) => void;
  onClearCart: () => void;
  onValidatePromoCode?: (code: string, currentAmount: number) => { isValid: boolean; message: string; discountAmount: number };
  onCreateOrder: (
    customerName: string,
    customerPhone?: string,
    items?: CartItem[],
    appliedPromoCode?: string,
    discountAmountVal?: number
  ) => Promise<{ orderId: string; whatsappUrl: string }>;
}

export const CartDrawer: React.FC<CartDrawerProps> = ({
  isOpen,
  onClose,
  cart,
  cartTotal,
  orders = [],
  siteSettings,
  promoCodes = [],
  onUpdateQuantity,
  onRemoveItem,
  onClearCart,
  onValidatePromoCode,
  onCreateOrder
}) => {
  const [activeTab, setActiveTab] = useState<'cart' | 'orders'>('cart');
  const [customerName, setCustomerName] = useState<string>('');
  const [customerPhone, setCustomerPhone] = useState<string>('');
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [orderCompleted, setOrderCompleted] = useState<{ id: string; url: string } | null>(null);
  const [orderSearchQuery, setOrderSearchQuery] = useState<string>('');
  const [promoInput, setPromoInput] = useState<string>('');
  const [promoResult, setPromoResult] = useState<{ isValid: boolean; message: string; discountAmount: number; code?: string } | null>(null);

  const handleApplyPromo = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!onValidatePromoCode) return;
    const res = onValidatePromoCode(promoInput, cartTotal);
    setPromoResult({
      ...res,
      code: promoInput.trim().toUpperCase()
    });
  };

  // Dynamically re-validate promo code when cartTotal changes
  React.useEffect(() => {
    if (promoResult?.isValid && promoInput.trim() && onValidatePromoCode) {
      const revalidated = onValidatePromoCode(promoInput, cartTotal);
      setPromoResult({
        ...revalidated,
        code: promoInput.trim().toUpperCase()
      });
    }
  }, [cartTotal]);

  const discountVal = promoResult?.isValid ? promoResult.discountAmount : 0;
  const finalCartTotal = Math.max(0, cartTotal - discountVal);

  const handleCheckout = async (e: React.FormEvent) => {
    e.preventDefault();
    if (cart.length === 0) return;

    let activePromoCode: string | undefined = undefined;
    let activeDiscountVal = 0;

    // Check if user entered a promo code in the input box
    if (promoInput.trim() && onValidatePromoCode) {
      const res = onValidatePromoCode(promoInput, cartTotal);
      if (res.isValid) {
        activePromoCode = promoInput.trim().toUpperCase();
        activeDiscountVal = res.discountAmount;
        setPromoResult({ ...res, code: activePromoCode });
      } else {
        setPromoResult({ ...res, code: promoInput.trim().toUpperCase() });
        return; // Don't proceed if user entered an invalid promo code
      }
    } else if (promoResult?.isValid) {
      activePromoCode = promoResult.code;
      activeDiscountVal = promoResult.discountAmount;
    }

    setIsSubmitting(true);
    try {
      const result = await onCreateOrder(
        customerName,
        customerPhone,
        cart,
        activePromoCode,
        activeDiscountVal
      );
      setOrderCompleted({ id: result.orderId, url: result.whatsappUrl });
      
      // Auto open WhatsApp tab
      window.open(result.whatsappUrl, '_blank');
    } catch (err) {
      console.error('Checkout error:', err);
    } finally {
      setIsSubmitting(false);
    }
  };

  const filteredOrders = orders.filter((o) => {
    if (!orderSearchQuery.trim()) return true;
    const q = orderSearchQuery.toLowerCase();
    return (
      o.id.toLowerCase().includes(q) ||
      (o.customerName && o.customerName.toLowerCase().includes(q)) ||
      (o.items && Array.isArray(o.items) && o.items.some((i) => i.productName?.toLowerCase().includes(q)))
    );
  });

  const getStatusBadge = (status: Order['status']) => {
    switch (status) {
      case 'Activated':
        return (
          <span className="inline-flex items-center gap-1 bg-emerald-100 dark:bg-emerald-950/80 text-emerald-800 dark:text-emerald-300 border border-emerald-300 dark:border-emerald-500/40 px-2.5 py-0.5 rounded-full text-[10px] font-bold">
            <CheckCircle2 className="w-3 h-3 text-emerald-600 dark:text-emerald-400" />
            <span>Activated</span>
          </span>
        );
      case 'Pending':
        return (
          <span className="inline-flex items-center gap-1 bg-amber-100 dark:bg-amber-950/80 text-amber-800 dark:text-amber-300 border border-amber-300 dark:border-amber-500/40 px-2.5 py-0.5 rounded-full text-[10px] font-bold">
            <Clock className="w-3 h-3 text-amber-600 dark:text-amber-400" />
            <span>Pending Activation</span>
          </span>
        );
      case 'Contacted':
        return (
          <span className="inline-flex items-center gap-1 bg-cyan-100 dark:bg-cyan-950/80 text-cyan-800 dark:text-cyan-300 border border-cyan-300 dark:border-cyan-500/40 px-2.5 py-0.5 rounded-full text-[10px] font-bold">
            <MessageCircle className="w-3 h-3 text-cyan-600 dark:text-cyan-400" />
            <span>In Process</span>
          </span>
        );
      case 'Cancelled':
        return (
          <span className="inline-flex items-center gap-1 bg-red-100 dark:bg-red-950/80 text-red-800 dark:text-red-300 border border-red-300 dark:border-red-500/40 px-2.5 py-0.5 rounded-full text-[10px] font-bold">
            <AlertCircle className="w-3 h-3 text-red-600 dark:text-red-400" />
            <span>Cancelled</span>
          </span>
        );
      default:
        return null;
    }
  };

  const getWhatsAppInquiryUrl = (order: Order) => {
    const targetPhone = (siteSettings?.whatsappNumber || WHATSAPP_NUMBER).replace(/[^0-9]/g, '');
    const siteName = siteSettings?.siteName || 'SubX Nepal';
    const text = `Hello ${siteName}, I am checking the status of my order ID: ${order.id} (${order.items.map(i => i.productName).join(', ')}).`;
    return `https://wa.me/${targetPhone}?text=${encodeURIComponent(text)}`;
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex justify-end bg-black/75 backdrop-blur-xs animate-fade-in">
      <div 
        className="relative w-full max-w-md bg-white dark:bg-[#0A0D14] border-l border-slate-200 dark:border-slate-800 h-full flex flex-col shadow-2xl overflow-hidden transition-colors duration-150"
        style={{ transform: 'translateZ(0)', backfaceVisibility: 'hidden' } as React.CSSProperties}
      >
        
        {/* Drawer Header with Navigation Tabs */}
        <div className="p-4 sm:p-5 border-b border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950/90 space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <ShoppingBag className="w-5 h-5 text-purple-600 dark:text-purple-400" />
              <h2 className="text-base sm:text-lg font-black text-slate-900 dark:text-white">SubX Checkout & Orders</h2>
            </div>
            <button
              onClick={onClose}
              className="p-1.5 text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-200 dark:hover:bg-slate-800 rounded-xl transition-all cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Navigation Tab Bar */}
          <div className="grid grid-cols-2 bg-slate-200/80 dark:bg-slate-900 p-1 rounded-xl border border-slate-300 dark:border-slate-800">
            <button
              onClick={() => setActiveTab('cart')}
              className={`flex items-center justify-center gap-2 py-2 px-3.5 rounded-xl text-xs font-black transition-all cursor-pointer ${
                activeTab === 'cart'
                  ? 'bg-gradient-to-r from-cyan-500 via-indigo-500 to-purple-600 text-white shadow-md'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
              }`}
            >
              <ShoppingBag className="w-3.5 h-3.5" />
              <span>Cart ({cart.reduce((sum, i) => sum + i.quantity, 0)})</span>
            </button>

            <button
              onClick={() => setActiveTab('orders')}
              className={`flex items-center justify-center gap-2 py-2 px-3.5 rounded-xl text-xs font-black transition-all cursor-pointer ${
                activeTab === 'orders'
                  ? 'bg-gradient-to-r from-cyan-500 via-indigo-500 to-purple-600 text-white shadow-md'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
              }`}
            >
              <PackageCheck className="w-3.5 h-3.5" />
              <span>My Orders ({orders.length})</span>
            </button>
          </div>
        </div>

        {/* TAB 1: CART CONTENT */}
        {activeTab === 'cart' && (
          <>
            {orderCompleted ? (
              <div className="flex-1 p-6 flex flex-col items-center justify-center text-center">
                <div className="w-16 h-16 bg-emerald-100 dark:bg-emerald-950/80 border border-emerald-500 rounded-full flex items-center justify-center text-emerald-600 dark:text-emerald-400 mb-4">
                  <CheckCircle2 className="w-8 h-8" />
                </div>
                <h3 className="text-xl font-black text-slate-900 dark:text-white">Order Created!</h3>
                <p className="text-sm text-slate-700 dark:text-slate-300 mt-2">
                  Order ID: <span className="font-mono text-cyan-600 dark:text-cyan-400 font-bold">{orderCompleted.id}</span>
                </p>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-2 max-w-xs">
                  Click the button below if WhatsApp didn't automatically open to finalize your order.
                </p>

                <a
                  href={orderCompleted.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="mt-6 flex items-center justify-center gap-2 bg-emerald-500 hover:bg-emerald-600 text-white font-bold px-6 py-3 rounded-xl w-full shadow-lg transition-all"
                >
                  <MessageCircle className="w-5 h-5" />
                  <span>Open WhatsApp Now</span>
                </a>

                <button
                  onClick={() => {
                    setOrderCompleted(null);
                    setActiveTab('orders');
                  }}
                  className="mt-4 text-xs text-purple-600 dark:text-purple-400 hover:text-purple-500 font-semibold underline cursor-pointer"
                >
                  View My Orders
                </button>
              </div>
            ) : cart.length === 0 ? (
              <div className="flex-1 p-6 flex flex-col items-center justify-center text-center">
                <div className="w-16 h-16 bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-full flex items-center justify-center text-slate-400 dark:text-slate-500 mb-4">
                  <ShoppingBag className="w-8 h-8" />
                </div>
                <h3 className="text-lg font-bold text-slate-900 dark:text-white">Your cart is empty</h3>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">Browse our products and add subscriptions to get started.</p>
                <button
                  onClick={onClose}
                  className="mt-6 bg-purple-600 hover:bg-purple-500 text-white text-xs font-bold px-5 py-2.5 rounded-xl shadow-md transition-all cursor-pointer"
                >
                  Browse Products
                </button>
              </div>
            ) : (
              <div className="flex-1 overflow-y-auto p-4 sm:p-5 space-y-4 divide-y divide-slate-200 dark:divide-slate-800/60">
                {cart.map((item) => (
                  <div key={item.id} className="pt-4 first:pt-0 flex gap-3.5">
                    <div className="w-14 h-14 bg-slate-100 dark:bg-slate-900 rounded-xl overflow-hidden border border-slate-200 dark:border-slate-800 shrink-0 p-1 flex items-center justify-center">
                      <ProductLogoImage
                        product={{ name: item.productName, bannerType: item.bannerType, image: item.productImage }}
                        className="w-full h-full object-contain rounded-lg"
                      />
                    </div>

                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-1">
                        <h4 className="text-xs font-bold text-slate-900 dark:text-white truncate">{item.productName}</h4>
                        <button
                          onClick={() => onRemoveItem(item.id)}
                          className="text-slate-400 hover:text-red-500 transition-colors p-0.5 cursor-pointer"
                          title="Remove item"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>

                      <div className="text-[11px] text-cyan-600 dark:text-cyan-400 font-semibold mt-0.5">
                        Plan: {item.selectedPlan.name}
                      </div>

                      {item.activationEmail && (
                        <div className="text-[10px] text-slate-500 dark:text-slate-400 truncate flex items-center gap-1 mt-0.5">
                          <Mail className="w-3 h-3 text-cyan-600 dark:text-cyan-400 shrink-0" />
                          <span>{item.activationEmail}</span>
                        </div>
                      )}

                      <div className="flex items-center justify-between mt-2">
                        <div className="text-sm font-black text-cyan-600 dark:text-cyan-400 font-mono">
                          NPR {(item.selectedPlan.price * item.quantity).toLocaleString()}
                        </div>

                        <div className="flex items-center bg-slate-100 dark:bg-slate-900 border border-slate-300 dark:border-slate-800 rounded-lg p-0.5">
                          <button
                            onClick={() => onUpdateQuantity(item.id, item.quantity - 1)}
                            className="p-1 hover:bg-slate-200 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-300 rounded cursor-pointer"
                          >
                            <Minus className="w-3 h-3" />
                          </button>
                          <span className="px-2 text-xs font-bold text-slate-900 dark:text-white min-w-[20px] text-center">
                            {item.quantity}
                          </span>
                          <button
                            onClick={() => onUpdateQuantity(item.id, item.quantity + 1)}
                            className="p-1 hover:bg-slate-200 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-300 rounded cursor-pointer"
                          >
                            <Plus className="w-3 h-3" />
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}

                <div className="pt-2 text-right">
                  <button
                    onClick={onClearCart}
                    className="text-[11px] text-slate-500 hover:text-red-500 transition-colors cursor-pointer"
                  >
                    Clear Cart
                  </button>
                </div>
              </div>
            )}

            {/* Footer Checkout Form */}
            {!orderCompleted && cart.length > 0 && (
              <div className="p-4 sm:p-5 border-t border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950/90 space-y-3">
                <form onSubmit={handleCheckout} className="space-y-3">
                  <div>
                    <label className="block text-[11px] font-bold text-slate-700 dark:text-slate-300 mb-1 flex items-center gap-1">
                      <User className="w-3 h-3 text-cyan-600 dark:text-cyan-400" />
                      <span>Your Name (Optional):</span>
                    </label>
                    <input
                      type="text"
                      value={customerName}
                      onChange={(e) => setCustomerName(e.target.value)}
                      placeholder="Enter your name"
                      className="w-full bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-800 focus:border-cyan-500 rounded-xl px-3 py-1.5 text-xs text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none"
                    />
                  </div>

                  {/* Promo Code Section */}
                  <div className="pt-2 border-t border-slate-200 dark:border-slate-800/80 space-y-1.5">
                    <label className="block text-[11px] font-bold text-slate-700 dark:text-slate-300 flex items-center justify-between">
                      <span className="flex items-center gap-1">
                        <Tag className="w-3.5 h-3.5 text-cyan-600 dark:text-cyan-400" />
                        <span>Promo Code:</span>
                      </span>
                      {promoResult?.isValid && (
                        <span className="text-[10px] text-emerald-600 dark:text-emerald-400 font-bold flex items-center gap-1">
                          <CheckCircle2 className="w-3 h-3" />
                          <span>Applied ({promoResult.code})</span>
                        </span>
                      )}
                    </label>
                    <div className="flex gap-2">
                      <input
                        type="text"
                        value={promoInput}
                        onChange={(e) => {
                          setPromoInput(e.target.value.toUpperCase());
                          setPromoResult(null);
                        }}
                        onKeyDown={(e) => {
                          if (e.key === 'Enter') {
                            e.preventDefault();
                            handleApplyPromo();
                          }
                        }}
                        placeholder="Enter promo code"
                        className="flex-1 bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-800 focus:border-cyan-500 rounded-xl px-3 py-2 text-xs text-slate-900 dark:text-white uppercase tracking-wider placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none font-mono"
                      />
                      <button
                        type="button"
                        onClick={handleApplyPromo}
                        disabled={!promoInput.trim()}
                        className="px-4 py-2 bg-gradient-to-r from-cyan-600 to-indigo-600 hover:from-cyan-500 hover:to-indigo-500 disabled:opacity-50 text-white font-black rounded-xl text-xs transition-all border border-cyan-500/30 cursor-pointer active:scale-95"
                      >
                        Apply
                      </button>
                    </div>

                    {promoResult && (
                      <div className={`text-[11px] font-bold flex items-center gap-1 ${
                        promoResult.isValid ? 'text-emerald-600 dark:text-emerald-400' : 'text-red-500 dark:text-red-400'
                      }`}>
                        {promoResult.isValid ? (
                          <CheckCircle2 className="w-3.5 h-3.5 shrink-0" />
                        ) : (
                          <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                        )}
                        <span>{promoResult.message}</span>
                      </div>
                    )}
                  </div>

                  {/* Price Calculation Breakdown */}
                  <div className="pt-2 border-t border-slate-200 dark:border-slate-800/80 space-y-1">
                    {promoResult?.isValid && discountVal > 0 && (
                      <>
                        <div className="flex items-center justify-between text-xs text-slate-500 dark:text-slate-400">
                          <span>Subtotal:</span>
                          <span className="line-through font-mono">NPR {cartTotal.toLocaleString()}</span>
                        </div>
                        <div className="flex items-center justify-between text-xs text-emerald-600 dark:text-emerald-400 font-semibold">
                          <span>Discount ({promoResult.code}):</span>
                          <span className="font-mono">-NPR {discountVal.toLocaleString()}</span>
                        </div>
                      </>
                    )}
                    <div className="flex items-center justify-between pt-1">
                      <span className="text-xs text-slate-700 dark:text-slate-300 font-bold">Total Amount (NPR):</span>
                      <span className="text-2xl font-black text-cyan-600 dark:text-cyan-400 font-mono">
                        NPR {finalCartTotal.toLocaleString()}
                      </span>
                    </div>
                  </div>

                  {/* Non-refundable Notice */}
                  <div className="p-2.5 bg-amber-50 dark:bg-amber-950/40 border border-amber-300 dark:border-amber-500/30 rounded-xl text-[11px] text-amber-800 dark:text-amber-200/90 flex items-center gap-2">
                    <ShieldCheck className="w-4 h-4 text-amber-600 dark:text-amber-400 shrink-0" />
                    <span><strong>Notice:</strong> All products are non-refundable.</span>
                  </div>

                  {/* Order via WhatsApp Button */}
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="w-full flex items-center justify-center gap-2 bg-gradient-to-r from-emerald-500 via-teal-500 to-emerald-500 hover:from-emerald-400 hover:to-teal-400 text-white font-black py-3.5 px-4 rounded-2xl shadow-lg shadow-emerald-500/20 transition-all active:scale-95 text-xs sm:text-sm cursor-pointer"
                  >
                    <MessageCircle className="w-4 h-4" />
                    <span>Order via WhatsApp</span>
                  </button>
                </form>
              </div>
            )}
          </>
        )}

        {/* TAB 2: MY ORDERS CONTENT */}
        {activeTab === 'orders' && (
          <div className="flex-1 flex flex-col min-h-0">
            {/* Search filter for orders */}
            <div className="p-4 border-b border-slate-200 dark:border-slate-800/80 bg-slate-50 dark:bg-slate-950/60">
              <div className="relative">
                <Search className="w-4 h-4 text-slate-400 dark:text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  value={orderSearchQuery}
                  onChange={(e) => setOrderSearchQuery(e.target.value)}
                  placeholder="Search by Order ID or Product Name..."
                  className="w-full pl-9 pr-3 py-1.5 bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-800 focus:border-purple-500 rounded-xl text-xs text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none"
                />
              </div>
            </div>

            {/* Orders List */}
            <div className="flex-1 overflow-y-auto p-4 space-y-3">
              {filteredOrders.length === 0 ? (
                <div className="text-center py-12 px-4">
                  <div className="w-12 h-12 bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-full flex items-center justify-center text-slate-400 dark:text-slate-500 mx-auto mb-3">
                    <PackageCheck className="w-6 h-6" />
                  </div>
                  <h4 className="text-sm font-bold text-slate-900 dark:text-white">No Orders Found</h4>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 max-w-xs mx-auto">
                    {orderSearchQuery ? 'No order matches your search filter.' : 'Your previous WhatsApp orders will appear here.'}
                  </p>
                </div>
              ) : (
                filteredOrders.map((order) => (
                  <div
                    key={order.id}
                    className="bg-white dark:bg-slate-900/80 border border-slate-200 dark:border-slate-800 rounded-xl p-3.5 space-y-2.5 transition-all hover:border-slate-300 dark:hover:border-slate-700 shadow-xs"
                  >
                    {/* Header: Order ID & Status */}
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className="font-mono text-xs font-black text-cyan-700 dark:text-cyan-300 bg-cyan-50 dark:bg-cyan-950/60 px-2 py-0.5 rounded border border-cyan-200 dark:border-cyan-800/40">
                          {order.id}
                        </span>
                        <span className="text-[11px] text-slate-500 dark:text-slate-400">
                          {new Date(order.createdAt).toLocaleDateString()}
                        </span>
                      </div>
                      {getStatusBadge(order.status)}
                    </div>

                    {/* Customer Info */}
                    {order.customerName && (
                      <div className="text-xs text-slate-700 dark:text-slate-300 font-medium">
                        Customer: <span className="text-slate-900 dark:text-white font-bold">{order.customerName}</span>
                      </div>
                    )}

                    {/* Items List */}
                    <div className="space-y-1.5 pt-1 border-t border-slate-100 dark:border-slate-800/60">
                      {order.items.map((item, idx) => (
                        <div key={idx} className="flex items-center justify-between text-xs">
                          <div className="min-w-0 pr-2">
                            <span className="text-slate-900 dark:text-white font-semibold block truncate">{item.productName}</span>
                            <span className="text-[10px] text-cyan-600 dark:text-cyan-400 font-medium">{item.planName} (x{item.quantity})</span>
                            {item.activationEmail && (
                              <span className="text-[10px] text-slate-500 dark:text-slate-400 block truncate">Email: {item.activationEmail}</span>
                            )}
                          </div>
                          <span className="font-bold text-cyan-600 dark:text-cyan-400 shrink-0 font-mono">NPR {(item.price * item.quantity).toLocaleString()}</span>
                        </div>
                      ))}
                    </div>

                    {/* Footer: Total & Track Button */}
                    <div className="pt-2 border-t border-slate-100 dark:border-slate-800/60 flex items-center justify-between">
                      <div>
                        <span className="text-[10px] text-slate-500 dark:text-slate-400 block">Total Price:</span>
                        <span className="text-sm font-black text-slate-900 dark:text-white font-mono">NPR {order.total.toLocaleString()}</span>
                      </div>

                      <a
                        href={getWhatsAppInquiryUrl(order)}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1.5 bg-[#25D366]/10 dark:bg-[#25D366]/20 hover:bg-[#25D366]/20 text-[#128C7E] dark:text-[#25D366] border border-[#25D366]/30 dark:border-[#25D366]/40 text-xs font-bold px-3 py-1.5 rounded-xl transition-all"
                      >
                        <MessageCircle className="w-3.5 h-3.5 fill-current" />
                        <span>WhatsApp Inquiry</span>
                      </a>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        )}

      </div>
    </div>
  );
};

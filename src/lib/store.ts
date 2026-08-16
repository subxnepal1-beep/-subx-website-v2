import { useState, useEffect } from 'react';
import { Product, CartItem, Order, Plan, OrderItem, SiteSettings, PromotionalPoster, PromoCode, CustomerReview } from '../types';
import { INITIAL_PRODUCTS } from '../data/initialProducts';
import { supabase, isSupabaseConfigured, deleteStorageFileFromSupabase } from './supabase';

const PRODUCTS_STORAGE_KEY = 'subx_products_v1';
const CART_STORAGE_KEY = 'subx_cart_v1';
const ORDERS_STORAGE_KEY = 'subx_orders_v2';
const MY_ORDER_IDS_KEY = 'subx_my_order_ids_v2';
const SETTINGS_STORAGE_KEY = 'subx_settings_v1';
const POSTERS_STORAGE_KEY = 'subx_posters_v1';
const PROMO_CODES_STORAGE_KEY = 'subx_promo_codes_v1';
const REVIEWS_STORAGE_KEY = 'subx_reviews_v1';

// Cleanup any old credentials or fake login caches on startup
try {
  localStorage.removeItem('subx_admin_authed_v1');
  localStorage.removeItem('subx_admin_email_v1');
  localStorage.removeItem('subx_admin_password');
  localStorage.removeItem('subx_admin_pin');
} catch {}

export const WHATSAPP_NUMBER = '9779765617156';
export const DISPLAY_WHATSAPP = '+977 9765617156';

export const DEFAULT_REVIEWS: CustomerReview[] = [
  {
    id: 'rev-1',
    customerName: 'Aayush Sharma',
    productName: 'Netflix Ultra HD 4K (Private Profile)',
    rating: 4.8,
    comment: 'Got my account credentials within 8 minutes on WhatsApp! Ultra HD 4K streaming working smoothly.',
    verifiedBuyer: true,
    created_at: new Date(Date.now() - 86400000 * 1).toISOString()
  },
  {
    id: 'rev-2',
    customerName: 'Prashant Shrestha',
    productName: 'Google Gemini AI Pro 1 Year',
    rating: 5,
    comment: 'Instant email invite for Gemini AI Pro! Paid seamlessly via eSewa. 1M token context active on my email.',
    verifiedBuyer: true,
    created_at: new Date(Date.now() - 86400000 * 3).toISOString()
  },
  {
    id: 'rev-3',
    customerName: 'Suman Pokhrel',
    productName: 'CapCut Pro Desktop & Mobile',
    rating: 4.5,
    comment: 'Unlocked all CapCut Pro text effects and cloud templates for my video editing. Paid using Khalti. Very prompt service!',
    verifiedBuyer: true,
    created_at: new Date(Date.now() - 86400000 * 5).toISOString()
  },
  {
    id: 'rev-4',
    customerName: 'Rohan Gurung',
    productName: 'YouTube Premium Personal',
    rating: 4.9,
    comment: 'No ads on Smart TV or Mobile anymore! Background audio play works flawlessly. Recommended team at SubX Nepal.',
    verifiedBuyer: true,
    created_at: new Date(Date.now() - 86400000 * 8).toISOString()
  },
  {
    id: 'rev-5',
    customerName: 'Ankit Adhikari',
    productName: 'ChatGPT Plus (GPT-4o)',
    rating: 4.6,
    comment: 'Smooth activation and super prompt customer care on WhatsApp. Used SUBX10 promo code for discount!',
    verifiedBuyer: true,
    created_at: new Date(Date.now() - 86400000 * 11).toISOString()
  },
  {
    id: 'rev-6',
    customerName: 'Kriti Maharjan',
    productName: 'Canva Pro Brand Kit & AI',
    rating: 5,
    comment: 'Got joined into Canva Pro Educational/Brand team directly on my email. Unlimited AI credits unlocked!',
    verifiedBuyer: true,
    created_at: new Date(Date.now() - 86400000 * 14).toISOString()
  },
  {
    id: 'rev-7',
    customerName: 'Bikram Thapa',
    productName: 'Spotify Premium 1 Year',
    rating: 4.7,
    comment: 'Offline music download and ad-free listening active on my original Spotify account. Quick bank transfer via Mobile Banking.',
    verifiedBuyer: true,
    created_at: new Date(Date.now() - 86400000 * 18).toISOString()
  }
];

export const DEFAULT_PROMO_CODES: PromoCode[] = [
  {
    id: 'promo-subx10',
    code: 'SUBX10',
    discountType: 'percentage',
    discountValue: 10,
    active: true,
    created_at: new Date().toISOString()
  },
  {
    id: 'promo-nepal50',
    code: 'NEPAL50',
    discountType: 'fixed',
    discountValue: 50,
    active: true,
    created_at: new Date().toISOString()
  }
];

export function safeLocalStorageSet(key: string, value: any): void {
  try {
    const serialized = typeof value === 'string' ? value : JSON.stringify(value);
    localStorage.setItem(key, serialized);
  } catch (err: any) {
    console.warn(`[LocalStorage] Failed to set ${key}, handling quota protection:`, err);
    try {
      // If products or posters exceeded quota due to large data urls, try storing a cleaned version
      if (Array.isArray(value) && (key === PRODUCTS_STORAGE_KEY || key === POSTERS_STORAGE_KEY)) {
        const trimmed = value.map((item) => {
          if (item && typeof item === 'object') {
            const copy = { ...item };
            if (copy.image && copy.image.startsWith('data:') && copy.image.length > 50000) {
              copy.image = '';
            }
            if (copy.image_url && copy.image_url.startsWith('data:') && copy.image_url.length > 50000) {
              copy.image_url = '';
            }
            return copy;
          }
          return item;
        });
        localStorage.setItem(key, JSON.stringify(trimmed));
      }
    } catch {}
  }
}

export const OFFICIAL_SUBX_LOGO_URL = 'https://pyjfggtupzmxkjrtghfe.supabase.co/storage/v1/object/public/site-assets/file_0000000076a88208a260d5d5e82f756a-removebg-preview-Picsart-AiImageEnhancer.png';
export const REMOTE_SUBX_LOGO_URL = 'https://pyjfggtupzmxkjrtghfe.supabase.co/storage/v1/object/public/site-assets/file_0000000076a88208a260d5d5e82f756a-removebg-preview-Picsart-AiImageEnhancer.png';

export const DEFAULT_SITE_SETTINGS: SiteSettings = {
  id: 'default',
  siteName: 'SubX Nepal',
  tagline: 'PREMIUM DIGITAL SUBSCRIPTIONS',
  logoUrl: OFFICIAL_SUBX_LOGO_URL,
  whatsappNumber: WHATSAPP_NUMBER,
  displayWhatsapp: DISPLAY_WHATSAPP,
  whatsappCommunityUrl: 'https://chat.whatsapp.com/CEUIi2YzvuaAaAvO11RmcS',
  whatsapp_community_url: 'https://chat.whatsapp.com/CEUIi2YzvuaAaAvO11RmcS',
  showPromotionalPosters: true,
  showAnnouncementPopup: true,
  show_announcement_popup: true
};

export const DEFAULT_PROMOTIONAL_POSTERS: PromotionalPoster[] = [
  {
    id: 'poster-gemini',
    title: 'Google Gemini AI Pro',
    subtitle: '1 Year Premium Access',
    description: 'Boost productivity with 1M token context, Advanced AI models & 2TB Cloud Storage.',
    badge: 'SPECIAL DEAL • SUBX NEPAL',
    image: '',
    productId: 'prod-gemini-pro',
    ctaText: 'Get Now →',
    active: true,
    displayOrder: 1,
  },
  {
    id: 'poster-netflix',
    title: 'Netflix Premium 4K UHD',
    subtitle: 'Ultra HD Single Profile',
    description: 'Stream thousands of movies, TV shows & exclusives on TV, mobile or laptop.',
    badge: 'BEST SELLER • ENTERTAINMENT',
    image: '',
    productId: 'prod-netflix-premium',
    ctaText: 'Get Now →',
    active: true,
    displayOrder: 2,
  },
  {
    id: 'poster-capcut',
    title: 'CapCut Pro Yearly',
    subtitle: 'Professional Video Editor',
    description: 'Unlock 4K 60fps exports, AI background removal, auto-captions & pro templates.',
    badge: 'CREATOR CHOICE • POPULAR',
    image: '',
    productId: 'prod-capcut-pro',
    ctaText: 'Get Now →',
    active: true,
    displayOrder: 3,
  }
];

export function useSubXStore() {
  // Site settings state
  const [siteSettings, setSiteSettings] = useState<SiteSettings>(() => {
    try {
      const saved = localStorage.getItem(SETTINGS_STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (parsed) {
          const logo = parsed.logoUrl;
          const isCurrentOfficial = logo && (logo.includes('file_0000000076a88208a260d5d5e82f756a') || logo === OFFICIAL_SUBX_LOGO_URL);
          const finalLogo = isCurrentOfficial ? OFFICIAL_SUBX_LOGO_URL : OFFICIAL_SUBX_LOGO_URL;
          const finalTagline = (!parsed.tagline || parsed.tagline.includes("Nepal's #1") || parsed.tagline.includes("MADE SIMPLE")) 
            ? 'PREMIUM DIGITAL SUBSCRIPTIONS' 
            : parsed.tagline;
          return { ...parsed, logoUrl: finalLogo, tagline: finalTagline, siteName: parsed.siteName || 'SubX Nepal' };
        }
      }
    } catch (e) {
      console.error('Failed to parse site settings', e);
    }
    return DEFAULT_SITE_SETTINGS;
  });

  // Products state
  const [products, setProducts] = useState<Product[]>(() => {
    try {
      const saved = localStorage.getItem(PRODUCTS_STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) {
          return parsed.map((p: Product) => {
            const rawImg = p.image || p.image_url || p.logo_url || p.banner_image_url || '';
            const isValid = rawImg && (rawImg.startsWith('http') || rawImg.startsWith('data:') || rawImg.startsWith('blob:'));
            return {
              ...p,
              image: isValid ? rawImg : '',
              image_url: isValid ? rawImg : '',
              logo_url: isValid ? rawImg : '',
              banner_image_url: isValid ? rawImg : ''
            };
          });
        }
      }
    } catch (e) {
      console.error('Failed to parse saved products', e);
    }
    return INITIAL_PRODUCTS;
  });

  // Cart state
  const [cart, setCart] = useState<CartItem[]>(() => {
    try {
      const saved = localStorage.getItem(CART_STORAGE_KEY);
      if (saved) return JSON.parse(saved);
    } catch (e) {
      console.error('Failed to parse cart', e);
    }
    return [];
  });

  // Orders state
  const [orders, setOrders] = useState<Order[]>(() => {
    try {
      const saved = localStorage.getItem(ORDERS_STORAGE_KEY) || localStorage.getItem('subx_orders_v1');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed)) {
          return parsed.filter(
            (o: any) =>
              o &&
              o.id !== 'SUBX-1001' &&
              o.id !== 'SUBX-1002' &&
              o.customerName !== 'Samir Thapa' &&
              o.customerName !== 'Aayush Shrestha'
          );
        }
      }
    } catch (e) {
      console.error('Failed to parse orders', e);
    }
    return [];
  });

  // Customer's own device orders state
  const [myOrderIds, setMyOrderIds] = useState<string[]>(() => {
    try {
      const saved = localStorage.getItem(MY_ORDER_IDS_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed)) {
          return parsed.filter((id: string) => id !== 'SUBX-1001' && id !== 'SUBX-1002');
        }
      }
    } catch (e) {
      console.error('Failed to parse my order IDs', e);
    }
    return [];
  });

  // Promotional Posters State
  const [promotionalPosters, setPromotionalPosters] = useState<PromotionalPoster[]>(() => {
    try {
      const saved = localStorage.getItem(POSTERS_STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) {
          return parsed;
        }
      }
    } catch (e) {
      console.error('Failed to parse promotional posters', e);
    }
    return DEFAULT_PROMOTIONAL_POSTERS;
  });

  // Promo Codes State
  const [promoCodes, setPromoCodes] = useState<PromoCode[]>(() => {
    try {
      const saved = localStorage.getItem(PROMO_CODES_STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) {
          return parsed;
        }
      }
    } catch (e) {
      console.error('Failed to parse promo codes', e);
    }
    return DEFAULT_PROMO_CODES;
  });

  // Customer Reviews State
  const [reviews, setReviews] = useState<CustomerReview[]>(() => {
    try {
      const saved = localStorage.getItem(REVIEWS_STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed)) {
          return parsed;
        }
      }
    } catch (e) {
      console.error('Failed to parse customer reviews', e);
    }
    return DEFAULT_REVIEWS;
  });

  // Admin authentication state (strictly validated by Supabase Auth session)
  const [isAdminAuthenticated, setIsAdminAuthenticated] = useState<boolean>(false);

  // Verify real Supabase Auth Session on mount and listen to Auth state changes
  useEffect(() => {
    if (isSupabaseConfigured && supabase) {
      // 1. Check current active Supabase Auth session
      supabase.auth.getSession().then(({ data: { session }, error }) => {
        if (!error && session?.user) {
          setIsAdminAuthenticated(true);
        } else {
          setIsAdminAuthenticated(false);
        }
      }).catch(() => {
        setIsAdminAuthenticated(false);
      });

      // 2. Subscribe to auth state changes (login, logout, password change, token refresh)
      const { data: authListener } = supabase.auth.onAuthStateChange((_event, session) => {
        if (session?.user) {
          setIsAdminAuthenticated(true);
        } else {
          setIsAdminAuthenticated(false);
        }
      });

      return () => {
        authListener?.subscription?.unsubscribe();
      };
    }
  }, []);

  // Sync site settings to local storage
  useEffect(() => {
    safeLocalStorageSet(SETTINGS_STORAGE_KEY, siteSettings);
  }, [siteSettings]);

  // Sync products to local storage
  useEffect(() => {
    safeLocalStorageSet(PRODUCTS_STORAGE_KEY, products);
  }, [products]);

  // Sync reviews to local storage
  useEffect(() => {
    safeLocalStorageSet(REVIEWS_STORAGE_KEY, reviews);
  }, [reviews]);

  // Sync cart to local storage
  useEffect(() => {
    safeLocalStorageSet(CART_STORAGE_KEY, cart);
  }, [cart]);

  // Sync orders to local storage
  useEffect(() => {
    safeLocalStorageSet(ORDERS_STORAGE_KEY, orders);
  }, [orders]);

  // Sync my order ids to local storage
  useEffect(() => {
    safeLocalStorageSet(MY_ORDER_IDS_KEY, myOrderIds);
  }, [myOrderIds]);

  // Sync promotional posters to local storage
  useEffect(() => {
    safeLocalStorageSet(POSTERS_STORAGE_KEY, promotionalPosters);
  }, [promotionalPosters]);

  // Sync promo codes to local storage
  useEffect(() => {
    safeLocalStorageSet(PROMO_CODES_STORAGE_KEY, promoCodes);
  }, [promoCodes]);

  // Fetch from Supabase if configured & setup Realtime listener
  useEffect(() => {
    if (isSupabaseConfigured && supabase) {
      const fetchSettings = async () => {
        try {
          let { data, error } = await supabase
            .from('website_settings')
            .select('*')
            .order('updated_at', { ascending: false })
            .limit(1);

          if (error || !data || data.length === 0) {
            const res = await supabase
              .from('settings')
              .select('*')
              .order('updated_at', { ascending: false })
              .limit(1);
            data = res.data;
            error = res.error;
          }

          if (error || !data || data.length === 0) {
            const res2 = await supabase
              .from('site_settings')
              .select('*')
              .order('updated_at', { ascending: false })
              .limit(1);
            data = res2.data;
            error = res2.error;
          }

          if (!error && data && data.length > 0) {
            const row = data[0];
            const fetchedLogo = row.logo_url || row.logoUrl || '';
            const isCurrentOfficial = fetchedLogo && (fetchedLogo.includes('file_0000000076a88208a260d5d5e82f756a') || fetchedLogo === OFFICIAL_SUBX_LOGO_URL);
            const finalLogo = isCurrentOfficial ? OFFICIAL_SUBX_LOGO_URL : OFFICIAL_SUBX_LOGO_URL;
            const showPostersVal = row.show_promotional_posters !== undefined
              ? (row.show_promotional_posters !== false && String(row.show_promotional_posters) !== 'false')
              : (row.showPromotionalPosters !== undefined ? row.showPromotionalPosters : true);

            const showPopupVal = row.show_announcement_popup !== undefined
              ? (row.show_announcement_popup !== false && String(row.show_announcement_popup) !== 'false')
              : (row.showAnnouncementPopup !== undefined ? row.showAnnouncementPopup : true);

            setSiteSettings({
              id: row.id || 'default',
              siteName: row.site_name || row.siteName || 'SubX Nepal',
              tagline: row.tagline || 'PREMIUM DIGITAL SUBSCRIPTIONS',
              logoUrl: finalLogo,
              whatsappNumber: row.whatsapp_number || row.whatsappNumber || WHATSAPP_NUMBER,
              displayWhatsapp: row.display_whatsapp || row.displayWhatsapp || DISPLAY_WHATSAPP,
              whatsappCommunityUrl: row.whatsapp_community_url || row.whatsappCommunityUrl || 'https://chat.whatsapp.com/CEUIi2YzvuaAaAvO11RmcS',
              whatsapp_community_url: row.whatsapp_community_url || row.whatsappCommunityUrl || 'https://chat.whatsapp.com/CEUIi2YzvuaAaAvO11RmcS',
              showPromotionalPosters: showPostersVal,
              showAnnouncementPopup: showPopupVal,
              show_announcement_popup: showPopupVal
            });
          }
        } catch (err) {
          console.warn('fetchSettings error:', err);
        }
      };

      const fetchProducts = async () => {
        try {
          const { data, error } = await supabase.from('products').select('*');
          if (!error && data && data.length > 0) {
            const mapped: Product[] = data.map((item) => {
              const rawPlans = (Array.isArray(item.plans) && item.plans.length > 0)
                ? item.plans
                : (Array.isArray(item.options) && item.options.length > 0 ? item.options : []);
              
              const rawImageVal = item.image_url || item.logo_url || item.image || item.banner_image_url || item.bannerImageUrl || item.logoUrl || '';
              const imageVal = (rawImageVal && typeof rawImageVal === 'string' && (rawImageVal.startsWith('http') || rawImageVal.startsWith('data:') || rawImageVal.startsWith('blob:') || rawImageVal.startsWith('/'))) ? rawImageVal : (rawImageVal || '');
              const discountVal = item.discount ?? item.discount_percentage ?? item.discount_percent ?? item.discountPercent ?? 0;
              const stockVal = item.stock || item.stock_status || (item.inStock === false ? 'Out of Stock' : 'In Stock');
              
              const effectivePrice = item.price !== undefined && item.price !== null && Number(item.price) > 0
                ? Number(item.price)
                : (rawPlans[0]?.price !== undefined ? Number(rawPlans[0].price) : 0);

              const plans = rawPlans.map((p: any, idx: number) => {
                if (idx === 0 && (p.price === undefined || p.price === null || Number(p.price) === 0)) {
                  return { ...p, price: effectivePrice };
                }
                return p;
              });

              return {
                id: item.id,
                name: item.name,
                category: item.category,
                description: item.description,
                badge: item.badge,
                discount: discountVal,
                discountPercent: discountVal,
                discount_percentage: discountVal,
                image: imageVal,
                image_url: imageVal,
                logo_url: imageVal,
                logoUrl: imageVal,
                banner_image_url: imageVal,
                bannerImageUrl: imageVal,
                price: effectivePrice,
                billing_period: item.billing_period || 'month',
                features: item.features || plans?.[0]?.features || [],
                bannerType: item.banner_type || 'custom',
                plans: plans,
                options: plans,
                stock: stockVal,
                stock_status: stockVal,
                requiresEmailInput: item.requires_email_input || false,
                created_at: item.created_at,
                updated_at: item.updated_at
              };
            });
            setProducts(mapped);
          } else if (!error && (!data || data.length === 0)) {
            // Seed initial products into Supabase so database contains all default products
            const seedPayloads = INITIAL_PRODUCTS.map((prod) => {
              const imageVal = prod.image_url || prod.logo_url || prod.image || '';
              const plansVal = prod.options || prod.plans || [];
              const discountVal = prod.discount ?? prod.discountPercent ?? prod.discount_percentage ?? 0;
              return {
                id: prod.id,
                name: prod.name,
                category: prod.category,
                description: prod.description,
                badge: prod.badge,
                discount: discountVal,
                image_url: imageVal,
                logo_url: imageVal,
                banner_image_url: imageVal,
                price: prod.price || plansVal?.[0]?.price || 0,
                billing_period: prod.billing_period || prod.billingPeriod || 'month',
                features: prod.features || plansVal?.[0]?.features || [],
                banner_type: prod.bannerType || 'custom',
                options: plansVal,
                plans: plansVal,
                stock: prod.stock || prod.stock_status || 'In Stock',
                stock_status: prod.stock_status || prod.stock || 'In Stock',
                requires_email_input: prod.requiresEmailInput || false,
                updated_at: new Date().toISOString()
              };
            });
            await supabase.from('products').upsert(seedPayloads, { onConflict: 'id' });
          }
        } catch (err) {
          console.warn('fetchProducts error:', err);
        }
      };

      const fetchOrders = async () => {
        try {
          const { data, error } = await supabase
            .from('orders')
            .select('*')
            .order('created_at', { ascending: false });
          if (!error && data && data.length > 0) {
            const mapped: Order[] = data.map((item) => ({
              id: item.id,
              customerName: item.customer_name,
              customerPhone: item.customer_phone,
              items: item.items,
              total: Number(item.total),
              status: item.status,
              createdAt: item.created_at
            }));
            setOrders(mapped);
          }
        } catch (err) {
          console.warn('fetchOrders error:', err);
        }
      };

      const fetchPromoCodes = async () => {
        try {
          const { data, error } = await supabase
            .from('promo_codes')
            .select('*')
            .order('created_at', { ascending: false });
          if (!error && data && data.length > 0) {
            const mapped: PromoCode[] = data.map((item) => ({
              id: String(item.id),
              code: String(item.code || '').trim().toUpperCase(),
              discountType: (item.discount_type || item.discountType || 'percentage') as 'percentage' | 'fixed',
              discountValue: Number(item.discount_value ?? item.discountValue ?? 0),
              minOrderAmount: Number(item.min_order_amount ?? item.minOrderAmount ?? 0),
              active: item.active !== false && String(item.active) !== 'false' && String(item.active) !== '0',
              created_at: item.created_at || new Date().toISOString()
            }));

            setPromoCodes((prev) => {
              const codeMap = new Map<string, PromoCode>();
              DEFAULT_PROMO_CODES.forEach((p) => codeMap.set(p.code.toUpperCase(), p));
              prev.forEach((p) => {
                if (p && p.code) codeMap.set(p.code.trim().toUpperCase(), p);
              });
              mapped.forEach((p) => {
                if (p && p.code) codeMap.set(p.code.trim().toUpperCase(), p);
              });
              return Array.from(codeMap.values());
            });
          } else if (!error && (!data || data.length === 0)) {
            // Seed initial default promo codes to Supabase so live visitors have access
            const seedPayloads = DEFAULT_PROMO_CODES.map((promo) => ({
              id: promo.id,
              code: promo.code.trim().toUpperCase(),
              discount_type: promo.discountType,
              discountType: promo.discountType,
              discount_value: promo.discountValue,
              discountValue: promo.discountValue,
              min_order_amount: promo.minOrderAmount || 0,
              minOrderAmount: promo.minOrderAmount || 0,
              active: promo.active,
              created_at: promo.created_at
            }));
            await supabase.from('promo_codes').upsert(seedPayloads, { onConflict: 'id' });
          }
        } catch (err) {
          console.warn('fetchPromoCodes error:', err);
        }
      };

      const fetchPosters = async () => {
        try {
          let { data, error } = await supabase
            .from('promotional_posters')
            .select('*')
            .order('display_order', { ascending: true });

          if (error || !data || data.length === 0) {
            const res = await supabase.from('posters').select('*').order('display_order', { ascending: true });
            data = res.data;
            error = res.error;
          }

          if (!error && data && data.length > 0) {
            const mapped: PromotionalPoster[] = data.map((item) => ({
              id: String(item.id),
              title: item.title || '',
              subtitle: item.subtitle || '',
              description: item.description || '',
              badge: item.badge || 'SPECIAL DEAL • SUBX NEPAL',
              image: item.image || item.image_url || '',
              productId: item.product_id || item.productId || '',
              ctaText: item.cta_text || item.ctaText || 'Get Now →',
              active: item.active !== false && String(item.active) !== 'false' && String(item.active) !== '0',
              displayOrder: Number(item.display_order ?? item.displayOrder ?? 1),
              created_at: item.created_at || new Date().toISOString()
            }));
            setPromotionalPosters(mapped);
          } else if (!error && (!data || data.length === 0)) {
            // Seed default posters
            const seedPosters = DEFAULT_PROMOTIONAL_POSTERS.map((poster) => ({
              id: poster.id,
              title: poster.title,
              subtitle: poster.subtitle,
              description: poster.description,
              badge: poster.badge,
              image: poster.image,
              product_id: poster.productId,
              cta_text: poster.ctaText,
              active: poster.active,
              display_order: poster.displayOrder,
              created_at: poster.created_at
            }));
            try {
              await supabase.from('promotional_posters').upsert(seedPosters, { onConflict: 'id' });
            } catch (seedErr) {
              console.warn('seedPosters warning:', seedErr);
            }
          }
        } catch (err) {
          console.warn('fetchPosters error:', err);
        }
      };

      const fetchReviews = async () => {
        try {
          let { data, error } = await supabase
            .from('customer_reviews')
            .select('*')
            .order('created_at', { ascending: false });

          if (error || !data || data.length === 0) {
            const res = await supabase.from('reviews').select('*').order('created_at', { ascending: false });
            data = res.data;
            error = res.error;
          }

          if (!error && data && data.length > 0) {
            const mapped: CustomerReview[] = data.map((item) => ({
              id: item.id,
              customerName: item.customer_name || item.customerName || 'Customer',
              productName: item.product_name || item.productName || 'SubX Service',
              rating: Number(item.rating || 5),
              comment: item.comment || '',
              verifiedBuyer: item.verified_buyer !== false,
              created_at: item.created_at || new Date().toISOString()
            }));
            setReviews(mapped);
          }
        } catch (err) {
          console.warn('fetchReviews error:', err);
        }
      };

      Promise.allSettled([
        fetchSettings(),
        fetchProducts(),
        fetchOrders(),
        fetchPromoCodes(),
        fetchPosters(),
        fetchReviews()
      ]);

      // Check current Supabase Auth session if active
      supabase.auth.getSession().then(({ data }) => {
        if (data?.session?.user) {
          setIsAdminAuthenticated(true);
        } else {
          setIsAdminAuthenticated(false);
        }
      }).catch((err) => {
        console.warn('Supabase getSession error:', err);
        setIsAdminAuthenticated(false);
      });

      // Listen for Supabase Auth state changes
      const { data: authData } = supabase.auth.onAuthStateChange((event, session) => {
        if (session?.user) {
          setIsAdminAuthenticated(true);
        } else {
          setIsAdminAuthenticated(false);
        }
      });

      // Realtime subscriptions for 100% automatic real-time sync across all devices
      const wsChannel = supabase
        .channel('public:website_settings')
        .on('postgres_changes', { event: '*', schema: 'public', table: 'website_settings' }, () => {
          fetchSettings();
        })
        .subscribe();

      const settingsChannel = supabase
        .channel('public:settings')
        .on('postgres_changes', { event: '*', schema: 'public', table: 'settings' }, () => {
          fetchSettings();
        })
        .subscribe();

      const siteSettingsChannel = supabase
        .channel('public:site_settings')
        .on('postgres_changes', { event: '*', schema: 'public', table: 'site_settings' }, () => {
          fetchSettings();
        })
        .subscribe();

      const productChannel = supabase
        .channel('public:products')
        .on('postgres_changes', { event: '*', schema: 'public', table: 'products' }, () => {
          fetchProducts();
        })
        .subscribe();

      const orderChannel = supabase
        .channel('public:orders')
        .on('postgres_changes', { event: '*', schema: 'public', table: 'orders' }, () => {
          fetchOrders();
        })
        .subscribe();

      const promoChannel = supabase
        .channel('public:promo_codes')
        .on('postgres_changes', { event: '*', schema: 'public', table: 'promo_codes' }, () => {
          fetchPromoCodes();
        })
        .subscribe();

      const posterChannel = supabase
        .channel('public:promotional_posters')
        .on('postgres_changes', { event: '*', schema: 'public', table: 'promotional_posters' }, () => {
          fetchPosters();
        })
        .subscribe();

      const fallbackPosterChannel = supabase
        .channel('public:posters')
        .on('postgres_changes', { event: '*', schema: 'public', table: 'posters' }, () => {
          fetchPosters();
        })
        .subscribe();

      const reviewChannel = supabase
        .channel('public:customer_reviews')
        .on('postgres_changes', { event: '*', schema: 'public', table: 'customer_reviews' }, () => {
          fetchReviews();
        })
        .subscribe();

      const fallbackReviewChannel = supabase
        .channel('public:reviews')
        .on('postgres_changes', { event: '*', schema: 'public', table: 'reviews' }, () => {
          fetchReviews();
        })
        .subscribe();

      return () => {
        authData?.subscription?.unsubscribe?.();
        supabase.removeChannel(wsChannel);
        supabase.removeChannel(settingsChannel);
        supabase.removeChannel(siteSettingsChannel);
        supabase.removeChannel(productChannel);
        supabase.removeChannel(orderChannel);
        supabase.removeChannel(promoChannel);
        supabase.removeChannel(posterChannel);
        supabase.removeChannel(fallbackPosterChannel);
        supabase.removeChannel(reviewChannel);
        supabase.removeChannel(fallbackReviewChannel);
      };
    }
  }, []);

  // Cart actions
  const addToCart = (
    product: Product,
    selectedPlan: Plan,
    quantity = 1,
    activationEmail?: string
  ) => {
    setCart((prev) => {
      // Find matching item by productId and plan id
      const existingIndex = prev.findIndex(
        (item) => item.productId === product.id && item.selectedPlan.id === selectedPlan.id
      );

      if (existingIndex > -1) {
        const updated = [...prev];
        updated[existingIndex].quantity += quantity;
        if (activationEmail) {
          updated[existingIndex].activationEmail = activationEmail;
        }
        return updated;
      }

      const newItem: CartItem = {
        id: `cart-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
        productId: product.id,
        productName: product.name,
        productImage: product.image,
        bannerType: product.bannerType,
        selectedPlan,
        quantity,
        activationEmail
      };
      return [...prev, newItem];
    });
  };

  const updateCartQuantity = (cartItemId: string, newQuantity: number) => {
    if (newQuantity <= 0) {
      removeFromCart(cartItemId);
      return;
    }
    setCart((prev) =>
      prev.map((item) => (item.id === cartItemId ? { ...item, quantity: newQuantity } : item))
    );
  };

  const removeFromCart = (cartItemId: string) => {
    setCart((prev) => prev.filter((item) => item.id !== cartItemId));
  };

  const clearCart = () => {
    setCart([]);
  };

  const cartTotal = cart.reduce(
    (sum, item) => sum + item.selectedPlan.price * item.quantity,
    0
  );

  const cartItemCount = cart.reduce((sum, item) => sum + item.quantity, 0);

  // Admin Product Actions
  const addProduct = async (newProduct: Product) => {
    const imageVal = newProduct.image_url || newProduct.logo_url || newProduct.image || '';
    const rawPlans = (Array.isArray(newProduct.plans) && newProduct.plans.length > 0)
      ? newProduct.plans
      : (Array.isArray(newProduct.options) && newProduct.options.length > 0 ? newProduct.options : []);

    const discountVal = newProduct.discount ?? newProduct.discountPercent ?? newProduct.discount_percentage ?? 0;
    const effectivePrice = rawPlans[0]?.price !== undefined && rawPlans[0]?.price !== null && Number(rawPlans[0].price) > 0
      ? Number(rawPlans[0].price)
      : (Number(newProduct.price) || 0);

    const plansVal: Plan[] = rawPlans.length > 0 ? rawPlans.map((p, idx) => ({
      ...p,
      price: idx === 0 && (p.price === undefined || p.price === null || Number(p.price) === 0) ? effectivePrice : Number(p.price || 0),
      billingCycle: (p.billingCycle || 'Month') as Plan['billingCycle']
    })) : [
      {
        id: `plan-${Date.now()}-1`,
        name: 'Standard Plan',
        price: effectivePrice,
        billingCycle: 'Month',
        features: newProduct.features || ['Instant Access', 'Full Support']
      }
    ];

    const normalizedProduct: Product = {
      ...newProduct,
      price: effectivePrice,
      discount: discountVal,
      discountPercent: discountVal,
      discount_percentage: discountVal,
      plans: plansVal,
      options: plansVal,
      image: imageVal,
      image_url: imageVal,
      logo_url: imageVal,
      logoUrl: imageVal,
      banner_image_url: imageVal,
      bannerImageUrl: imageVal
    };

    setProducts((prev) => [normalizedProduct, ...prev]);

    if (isSupabaseConfigured && supabase) {
      try {
        const payload = {
          id: normalizedProduct.id,
          name: normalizedProduct.name,
          category: normalizedProduct.category,
          description: normalizedProduct.description,
          badge: normalizedProduct.badge,
          discount: discountVal,
          image_url: imageVal,
          logo_url: imageVal,
          banner_image_url: imageVal,
          price: effectivePrice,
          billing_period: normalizedProduct.billing_period || normalizedProduct.billingPeriod || 'month',
          features: normalizedProduct.features || plansVal?.[0]?.features || [],
          banner_type: normalizedProduct.bannerType || 'custom',
          options: plansVal,
          plans: plansVal,
          stock: normalizedProduct.stock || normalizedProduct.stock_status || 'In Stock',
          stock_status: normalizedProduct.stock_status || normalizedProduct.stock || 'In Stock',
          requires_email_input: normalizedProduct.requiresEmailInput || false,
          updated_at: new Date().toISOString()
        };

        const { error } = await supabase.from('products').upsert(payload, { onConflict: 'id' });
        if (error) {
          console.warn('Supabase product insert notice:', error.message);
        }
      } catch (err: any) {
        console.warn('Supabase product insert warning (persisted locally):', err?.message || err);
      }
    }
  };

  const updateProduct = async (updatedProduct: Product) => {
    const existingProd = products.find((p) => p.id === updatedProduct.id);
    const oldImage = existingProd?.image_url || existingProd?.image || existingProd?.logo_url;
    const imageVal = updatedProduct.image_url || updatedProduct.logo_url || updatedProduct.image || '';

    const rawPlans = (Array.isArray(updatedProduct.plans) && updatedProduct.plans.length > 0)
      ? updatedProduct.plans
      : (Array.isArray(updatedProduct.options) && updatedProduct.options.length > 0 ? updatedProduct.options : []);

    const discountVal = updatedProduct.discount ?? updatedProduct.discountPercent ?? updatedProduct.discount_percentage ?? 0;
    const effectivePrice = rawPlans[0]?.price !== undefined && rawPlans[0]?.price !== null && Number(rawPlans[0].price) > 0
      ? Number(rawPlans[0].price)
      : (Number(updatedProduct.price) || 0);

    const plansVal: Plan[] = rawPlans.length > 0 ? rawPlans.map((p, idx) => ({
      ...p,
      price: idx === 0 && (p.price === undefined || p.price === null || Number(p.price) === 0) ? effectivePrice : Number(p.price || 0),
      billingCycle: (p.billingCycle || 'Month') as Plan['billingCycle']
    })) : [
      {
        id: `plan-${Date.now()}-1`,
        name: 'Standard Plan',
        price: effectivePrice,
        billingCycle: 'Month',
        features: updatedProduct.features || ['Instant Access', 'Full Support']
      }
    ];

    const normalizedProduct: Product = {
      ...updatedProduct,
      price: effectivePrice,
      discount: discountVal,
      discountPercent: discountVal,
      discount_percentage: discountVal,
      plans: plansVal,
      options: plansVal,
      image: imageVal,
      image_url: imageVal,
      logo_url: imageVal,
      logoUrl: imageVal,
      banner_image_url: imageVal,
      bannerImageUrl: imageVal
    };

    setProducts((prev) =>
      prev.map((p) => (p.id === updatedProduct.id ? normalizedProduct : p))
    );

    if (isSupabaseConfigured && supabase) {
      try {
        if (oldImage && oldImage !== imageVal && oldImage.includes('/storage/v1/object/public/')) {
          deleteStorageFileFromSupabase(oldImage).catch(() => {});
        }

        const payload = {
          id: normalizedProduct.id,
          name: normalizedProduct.name,
          category: normalizedProduct.category,
          description: normalizedProduct.description,
          badge: normalizedProduct.badge,
          discount: discountVal,
          image_url: imageVal,
          logo_url: imageVal,
          banner_image_url: imageVal,
          price: effectivePrice,
          billing_period: normalizedProduct.billing_period || normalizedProduct.billingPeriod || 'month',
          features: normalizedProduct.features || plansVal?.[0]?.features || [],
          banner_type: normalizedProduct.bannerType || 'custom',
          options: plansVal,
          plans: plansVal,
          stock: normalizedProduct.stock || normalizedProduct.stock_status || 'In Stock',
          stock_status: normalizedProduct.stock_status || normalizedProduct.stock || 'In Stock',
          requires_email_input: normalizedProduct.requiresEmailInput || false,
          updated_at: new Date().toISOString()
        };

        const { error } = await supabase.from('products').upsert(payload, { onConflict: 'id' });
        if (error) {
          console.warn('Supabase product update notice:', error.message);
        }
      } catch (err: any) {
        console.warn('Supabase product update warning (persisted locally):', err?.message || err);
      }
    }
  };

  const deleteProduct = async (productId: string) => {
    const prodToDelete = products.find((p) => p.id === productId);
    const imageUrl = prodToDelete?.image_url || prodToDelete?.image || prodToDelete?.logo_url;

    setProducts((prev) => prev.filter((p) => p.id !== productId));

    if (isSupabaseConfigured && supabase) {
      try {
        if (imageUrl && imageUrl.includes('/storage/v1/object/public/')) {
          deleteStorageFileFromSupabase(imageUrl).catch(() => {});
        }
        const { error } = await supabase.from('products').delete().eq('id', productId);
        if (error) {
          console.warn('Supabase product delete notice:', error.message);
        }
      } catch (err: any) {
        console.warn('Supabase product delete warning (persisted locally):', err?.message || err);
      }
    }
  };

  const resetProductsToDefault = () => {
    setProducts(INITIAL_PRODUCTS);
    localStorage.removeItem(PRODUCTS_STORAGE_KEY);
  };

  // Promo Code Validation & Actions
  const validatePromoCode = (
    codeStr: string,
    currentAmount: number
  ): { isValid: boolean; message: string; discountAmount: number; promoCode?: PromoCode } => {
    const rawInput = (codeStr || '').trim();
    if (!rawInput) {
      return { isValid: false, message: 'Please enter a promo code.', discountAmount: 0 };
    }

    // Normalized comparison ignoring spaces, dashes, and underscores
    const cleanCode = rawInput.toUpperCase().replace(/[\s-_]/g, '');

    const match = promoCodes.find((p) => {
      if (!p || !p.code) return false;
      const target = p.code.toString().trim().toUpperCase().replace(/[\s-_]/g, '');
      return target === cleanCode;
    });

    if (!match) {
      return { isValid: false, message: 'Invalid promo code. Please check the code and try again.', discountAmount: 0 };
    }

    const isActive = match.active !== false && String(match.active) !== 'false' && String(match.active) !== '0';
    if (!isActive) {
      return { isValid: false, message: 'This promo code is inactive or expired.', discountAmount: 0 };
    }

    const minOrder = Number(match.minOrderAmount || 0);
    if (minOrder > 0 && currentAmount < minOrder) {
      return {
        isValid: false,
        message: `Minimum order amount of Rs.${minOrder} required for this promo code.`,
        discountAmount: 0
      };
    }

    let discountAmount = 0;
    const discVal = Number(match.discountValue || 0);
    if (match.discountType === 'percentage') {
      discountAmount = Math.round((currentAmount * discVal) / 100);
    } else {
      discountAmount = discVal;
    }

    if (discountAmount > currentAmount) {
      discountAmount = currentAmount;
    }

    return {
      isValid: true,
      message: `Promo Code "${match.code}" applied! Saved Rs.${discountAmount}.`,
      discountAmount,
      promoCode: match
    };
  };

  const addPromoCode = async (promoData: Omit<PromoCode, 'id'>) => {
    const cleanCode = promoData.code.trim().toUpperCase();
    const newPromo: PromoCode = {
      ...promoData,
      id: 'promo-' + Date.now(),
      code: cleanCode,
      created_at: new Date().toISOString()
    };
    const updated = [newPromo, ...promoCodes.filter((p) => p.code.trim().toUpperCase() !== cleanCode)];
    setPromoCodes(updated);

    if (isSupabaseConfigured && supabase) {
      try {
        await supabase.from('promo_codes').upsert([
          {
            id: newPromo.id,
            code: newPromo.code,
            discount_type: newPromo.discountType,
            discountType: newPromo.discountType,
            discount_value: newPromo.discountValue,
            discountValue: newPromo.discountValue,
            min_order_amount: newPromo.minOrderAmount || 0,
            minOrderAmount: newPromo.minOrderAmount || 0,
            active: newPromo.active,
            created_at: newPromo.created_at
          }
        ], { onConflict: 'id' });
      } catch (err) {
        console.warn('Supabase addPromoCode error:', err);
      }
    }
  };

  const updatePromoCode = async (id: string, updates: Partial<PromoCode>) => {
    const updated = promoCodes.map((p) => (p.id === id ? { ...p, ...updates } : p));
    setPromoCodes(updated);

    if (isSupabaseConfigured && supabase) {
      try {
        const match = updated.find((p) => p.id === id);
        if (match) {
          await supabase.from('promo_codes').upsert([
            {
              id: match.id,
              code: match.code.trim().toUpperCase(),
              discount_type: match.discountType,
              discountType: match.discountType,
              discount_value: match.discountValue,
              discountValue: match.discountValue,
              min_order_amount: match.minOrderAmount || 0,
              minOrderAmount: match.minOrderAmount || 0,
              active: match.active
            }
          ], { onConflict: 'id' });
        }
      } catch (err) {
        console.warn('Supabase updatePromoCode error:', err);
      }
    }
  };

  const deletePromoCode = async (id: string) => {
    const updated = promoCodes.filter((p) => p.id !== id);
    setPromoCodes(updated);

    if (isSupabaseConfigured && supabase) {
      try {
        await supabase.from('promo_codes').delete().eq('id', id);
      } catch (err) {
        console.warn('Supabase deletePromoCode error:', err);
      }
    }
  };

  const togglePromoCodeActive = async (id: string) => {
    const match = promoCodes.find((p) => p.id === id);
    if (match) {
      await updatePromoCode(id, { active: !match.active });
    }
  };

  // Checkout and Order Actions
  const createOrder = async (
    customerName: string,
    customerPhone?: string,
    customCartItems?: CartItem[],
    appliedPromoCode?: string,
    discountAmountVal: number = 0
  ): Promise<{ orderId: string; whatsappUrl: string }> => {
    const itemsToOrder = customCartItems || cart;
    const totalAmount = itemsToOrder.reduce(
      (sum, item) => sum + item.selectedPlan.price * item.quantity,
      0
    );

    const finalTotal = Math.max(0, totalAmount - discountAmountVal);
    const orderId = `SUBX-${Math.floor(1000 + Math.random() * 9000)}`;

    const orderItems: OrderItem[] = itemsToOrder.map((item) => ({
      productId: item.productId,
      productName: item.productName,
      planName: item.selectedPlan.name,
      price: item.selectedPlan.price,
      quantity: item.quantity,
      activationEmail: item.activationEmail
    }));

    const newOrder: Order = {
      id: orderId,
      customerName: customerName.trim() || 'Valued Customer',
      customerPhone: customerPhone?.trim() || '',
      items: orderItems,
      total: finalTotal,
      originalTotal: totalAmount,
      promoCode: appliedPromoCode,
      discountAmount: discountAmountVal,
      status: 'Pending',
      createdAt: new Date().toISOString()
    };

    // Save locally
    setOrders((prev) => [newOrder, ...prev.filter(o => o.id !== newOrder.id)]);
    setMyOrderIds((prev) => [newOrder.id, ...prev.filter(id => id !== newOrder.id)]);

    // Save to Supabase if configured
    if (isSupabaseConfigured && supabase) {
      try {
        await supabase.from('orders').insert([
          {
            id: newOrder.id,
            customer_name: newOrder.customerName,
            customer_phone: newOrder.customerPhone,
            items: newOrder.items,
            total: newOrder.total,
            status: newOrder.status,
            created_at: newOrder.createdAt
          }
        ]);
      } catch (e) {
        console.warn('Order insert warning:', e);
      }
    }

    // Clear cart after checkout
    if (!customCartItems) {
      clearCart();
    }

    // Format WhatsApp Message
    let messageText = `🚀 *NEW ORDER - SUBX NEPAL*\n\n`;
    messageText += `*Order ID:* ${orderId}\n`;
    messageText += `*Customer:* ${newOrder.customerName}\n`;
    if (newOrder.customerPhone) {
      messageText += `*Phone:* ${newOrder.customerPhone}\n`;
    }
    messageText += `\n*🛒 ITEMS ORDERED:*\n`;

    orderItems.forEach((item, index) => {
      messageText += `${index + 1}. *${item.productName}*\n`;
      messageText += `   • Plan: ${item.planName}\n`;
      messageText += `   • Price: Rs.${item.price} x ${item.quantity}\n`;
      if (item.activationEmail) {
        messageText += `   • Activation Email: ${item.activationEmail}\n`;
      }
    });

    if (appliedPromoCode && discountAmountVal > 0) {
      messageText += `\n🏷️ *Promo Code Applied:* ${appliedPromoCode} (Saved Rs.${discountAmountVal})\n`;
      messageText += `💰 *Original Price:* Rs.${totalAmount}\n`;
      messageText += `🔥 *Discounted Total:* Rs.${finalTotal}\n`;
    } else {
      messageText += `\n💰 *Total Amount:* Rs.${totalAmount}\n`;
    }

    messageText += `\nPlease confirm my order & provide payment details for instant activation. Thank you!`;

    const encodedMessage = encodeURIComponent(messageText);
    const targetPhone = (siteSettings?.whatsappNumber || WHATSAPP_NUMBER).replace(/[^0-9]/g, '');
    const whatsappUrl = `https://wa.me/${targetPhone}?text=${encodedMessage}`;

    return { orderId, whatsappUrl };
  };

  const updateOrderStatus = async (orderId: string, status: Order['status']) => {
    setOrders((prev) =>
      prev.map((o) => (o.id === orderId ? { ...o, status } : o))
    );

    if (isSupabaseConfigured && supabase) {
      await supabase.from('orders').update({ status }).eq('id', orderId);
    }
  };

  const deleteOrder = async (orderId: string) => {
    setOrders((prev) => prev.filter((o) => o.id !== orderId));

    if (isSupabaseConfigured && supabase) {
      await supabase.from('orders').delete().eq('id', orderId);
    }
  };

  // Admin Auth Actions
  const loginAdmin = (): boolean => {
    setIsAdminAuthenticated(true);
    return true;
  };

  const logoutAdmin = async () => {
    if (isSupabaseConfigured && supabase) {
      await supabase.auth.signOut();
    }
    setIsAdminAuthenticated(false);
  };

  const updateSiteSettings = async (newSettings: Partial<SiteSettings>) => {
    const oldLogoUrl = siteSettings.logoUrl;
    const updated: SiteSettings = {
      ...siteSettings,
      ...newSettings
    };
    setSiteSettings(updated);

    if (isSupabaseConfigured && supabase) {
      if (oldLogoUrl && newSettings.logoUrl !== undefined && oldLogoUrl !== newSettings.logoUrl && oldLogoUrl.includes('/storage/v1/object/public/')) {
        deleteStorageFileFromSupabase(oldLogoUrl);
      }

      const showPostersVal = updated.showPromotionalPosters !== undefined ? updated.showPromotionalPosters : true;
      const showPopupVal = updated.showAnnouncementPopup !== undefined ? updated.showAnnouncementPopup : (updated.show_announcement_popup !== undefined ? updated.show_announcement_popup : true);
      const communityUrlVal = updated.whatsappCommunityUrl || updated.whatsapp_community_url || 'https://chat.whatsapp.com/CEUIi2YzvuaAaAvO11RmcS';

      const wsPayload = {
        id: updated.id || 'default',
        site_name: updated.siteName,
        tagline: updated.tagline,
        logo_url: updated.logoUrl,
        whatsapp_number: updated.whatsappNumber || WHATSAPP_NUMBER,
        display_whatsapp: updated.displayWhatsapp || DISPLAY_WHATSAPP,
        whatsapp_community_url: communityUrlVal,
        whatsappCommunityUrl: communityUrlVal,
        show_promotional_posters: showPostersVal,
        showPromotionalPosters: showPostersVal,
        show_announcement_popup: showPopupVal,
        showAnnouncementPopup: showPopupVal,
        updated_at: new Date().toISOString()
      };

      const settingsPayload = {
        id: updated.id || 'default',
        site_name: updated.siteName,
        tagline: updated.tagline,
        logo_url: updated.logoUrl,
        whatsapp_number: updated.whatsappNumber || WHATSAPP_NUMBER,
        display_whatsapp: updated.displayWhatsapp || DISPLAY_WHATSAPP,
        whatsapp_community_url: communityUrlVal,
        whatsappCommunityUrl: communityUrlVal,
        show_promotional_posters: showPostersVal,
        showPromotionalPosters: showPostersVal,
        show_announcement_popup: showPopupVal,
        showAnnouncementPopup: showPopupVal,
        updated_at: new Date().toISOString()
      };

      const siteSettingsPayload = {
        id: updated.id || 'default',
        site_name: updated.siteName,
        tagline: updated.tagline,
        logo_url: updated.logoUrl,
        whatsapp_number: updated.whatsappNumber || WHATSAPP_NUMBER,
        display_whatsapp: updated.displayWhatsapp || DISPLAY_WHATSAPP,
        whatsapp_community_url: communityUrlVal,
        whatsappCommunityUrl: communityUrlVal,
        show_promotional_posters: showPostersVal,
        showPromotionalPosters: showPostersVal,
        show_announcement_popup: showPopupVal,
        showAnnouncementPopup: showPopupVal,
        updated_at: new Date().toISOString()
      };

      try {
        await supabase.from('website_settings').upsert([wsPayload]);
        await supabase.from('settings').upsert([settingsPayload]);
        await supabase.from('site_settings').upsert([siteSettingsPayload]);
      } catch (err: any) {
        console.warn('Supabase settings upsert warning:', err?.message || err);
      }
    }
  };

  // Promotional Poster Management
  const addPromotionalPoster = async (posterData: Omit<PromotionalPoster, 'id'>) => {
    const newPoster: PromotionalPoster = {
      ...posterData,
      id: 'poster-' + Date.now(),
      created_at: new Date().toISOString()
    };
    const updated = [...promotionalPosters, newPoster].sort((a, b) => a.displayOrder - b.displayOrder);
    setPromotionalPosters(updated);

    if (isSupabaseConfigured && supabase) {
      try {
        const payload = {
          id: newPoster.id,
          title: newPoster.title,
          subtitle: newPoster.subtitle,
          description: newPoster.description,
          badge: newPoster.badge,
          image: newPoster.image,
          image_url: newPoster.image,
          product_id: newPoster.productId,
          productId: newPoster.productId,
          cta_text: newPoster.ctaText,
          ctaText: newPoster.ctaText,
          active: newPoster.active,
          display_order: newPoster.displayOrder,
          displayOrder: newPoster.displayOrder,
          created_at: newPoster.created_at
        };
        await supabase.from('promotional_posters').upsert([payload], { onConflict: 'id' });
        await supabase.from('posters').upsert([payload], { onConflict: 'id' });
      } catch (err) {
        console.warn('Supabase addPromotionalPoster error:', err);
      }
    }
  };

  const updatePromotionalPoster = async (id: string, posterData: Partial<PromotionalPoster>) => {
    const updated = promotionalPosters
      .map((p) => (p.id === id ? { ...p, ...posterData } : p))
      .sort((a, b) => a.displayOrder - b.displayOrder);
    setPromotionalPosters(updated);

    if (isSupabaseConfigured && supabase) {
      try {
        const target = updated.find((p) => p.id === id);
        if (target) {
          const payload = {
            id: target.id,
            title: target.title,
            subtitle: target.subtitle,
            description: target.description,
            badge: target.badge,
            image: target.image,
            image_url: target.image,
            product_id: target.productId,
            productId: target.productId,
            cta_text: target.ctaText,
            ctaText: target.ctaText,
            active: target.active,
            display_order: target.displayOrder,
            displayOrder: target.displayOrder
          };
          await supabase.from('promotional_posters').upsert([payload], { onConflict: 'id' });
          await supabase.from('posters').upsert([payload], { onConflict: 'id' });
        }
      } catch (err) {
        console.warn('Supabase updatePromotionalPoster error:', err);
      }
    }
  };

  const deletePromotionalPoster = async (id: string) => {
    const updated = promotionalPosters.filter((p) => p.id !== id);
    setPromotionalPosters(updated);

    if (isSupabaseConfigured && supabase) {
      try {
        await supabase.from('promotional_posters').delete().eq('id', id);
        await supabase.from('posters').delete().eq('id', id);
      } catch (err) {
        console.warn('Supabase deletePromotionalPoster error:', err);
      }
    }
  };

  const togglePromotionalPosterActive = async (id: string) => {
    const match = promotionalPosters.find((p) => p.id === id);
    if (match) {
      await updatePromotionalPoster(id, { active: !match.active });
    }
  };

  // Reviews Management
  const addReview = async (reviewData: Omit<CustomerReview, 'id' | 'created_at'>) => {
    const newReview: CustomerReview = {
      ...reviewData,
      id: 'rev-' + Date.now(),
      created_at: new Date().toISOString()
    };
    const updated = [newReview, ...reviews];
    setReviews(updated);

    if (isSupabaseConfigured && supabase) {
      try {
        await supabase.from('customer_reviews').insert([
          {
            id: newReview.id,
            customer_name: newReview.customerName,
            product_name: newReview.productName,
            rating: newReview.rating,
            comment: newReview.comment,
            verified_buyer: newReview.verifiedBuyer !== false,
            created_at: newReview.created_at
          }
        ]);
      } catch (err) {
        console.warn('Supabase addReview warning:', err);
      }
    }
  };

  const updateReview = async (id: string, updatedData: Partial<CustomerReview>) => {
    const updated = reviews.map((r) => (r.id === id ? { ...r, ...updatedData } : r));
    setReviews(updated);

    if (isSupabaseConfigured && supabase) {
      try {
        const payload: Record<string, any> = {};
        if (updatedData.customerName !== undefined) payload.customer_name = updatedData.customerName;
        if (updatedData.productName !== undefined) payload.product_name = updatedData.productName;
        if (updatedData.rating !== undefined) payload.rating = updatedData.rating;
        if (updatedData.comment !== undefined) payload.comment = updatedData.comment;
        if (updatedData.verifiedBuyer !== undefined) payload.verified_buyer = updatedData.verifiedBuyer;

        await supabase.from('customer_reviews').update(payload).eq('id', id);
      } catch (err) {
        console.warn('Supabase updateReview warning:', err);
      }
    }
  };

  const deleteReview = async (id: string) => {
    const updated = reviews.filter((r) => r.id !== id);
    setReviews(updated);

    if (isSupabaseConfigured && supabase) {
      try {
        await supabase.from('customer_reviews').delete().eq('id', id);
      } catch (err) {
        console.warn('Supabase deleteReview warning:', err);
      }
    }
  };

  const myOrders = orders.filter((order) => myOrderIds.includes(order.id));

  return {
    siteSettings,
    updateSiteSettings,
    promotionalPosters,
    addPromotionalPoster,
    updatePromotionalPoster,
    deletePromotionalPoster,
    togglePromotionalPosterActive,
    reviews,
    addReview,
    updateReview,
    deleteReview,
    promoCodes,
    validatePromoCode,
    addPromoCode,
    updatePromoCode,
    deletePromoCode,
    togglePromoCodeActive,
    products,
    cart,
    orders,
    myOrders,
    cartTotal,
    cartItemCount,
    isAdminAuthenticated,
    addToCart,
    updateCartQuantity,
    removeFromCart,
    clearCart,
    addProduct,
    updateProduct,
    deleteProduct,
    resetProductsToDefault,
    createOrder,
    updateOrderStatus,
    deleteOrder,
    loginAdmin,
    logoutAdmin
  };
}

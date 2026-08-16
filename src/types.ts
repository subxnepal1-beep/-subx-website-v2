export interface Plan {
  id: string;
  name: string;
  price: number; // in NPR (Rs.)
  billingCycle: 'Month' | 'Year' | 'One-Time';
  features: string[];
  isPopular?: boolean;
}

export interface Product {
  id: string;
  name: string;
  category: 'AI Tools' | 'Entertainment' | 'Video Editing' | 'Productivity';
  description: string;
  badge?: string; // e.g. "60% OFF", "BEST SELLER"
  discountPercent?: number;
  discount_percentage?: number;
  image: string; // Key or URL for product banner/logo
  image_url?: string;
  logo_url?: string;
  logoUrl?: string;
  banner_image_url?: string;
  bannerImageUrl?: string;
  price?: number;
  discount?: number;
  billing_period?: string;
  billingPeriod?: string;
  features?: string[];
  bannerType: 'gemini' | 'netflix' | 'capcut' | 'youtube' | 'chatgpt' | 'custom';
  plans: Plan[];
  options?: Plan[];
  stock: 'In Stock' | 'Limited Stock' | 'Out of Stock';
  stock_status?: string;
  requiresEmailInput?: boolean; // e.g. Gemini, YouTube Premium
  instructions?: string;
  created_at?: string;
  updated_at?: string;
}

export interface CartItem {
  id: string; // unique cart item id
  productId: string;
  productName: string;
  productImage: string;
  bannerType: 'gemini' | 'netflix' | 'capcut' | 'youtube' | 'chatgpt' | 'custom';
  selectedPlan: Plan;
  quantity: number;
  activationEmail?: string;
}

export interface OrderItem {
  productId: string;
  productName: string;
  planName: string;
  price: number;
  quantity: number;
  activationEmail?: string;
}

export interface Order {
  id: string;
  customerName?: string;
  customerPhone?: string;
  items: OrderItem[];
  total: number;
  originalTotal?: number;
  promoCode?: string;
  discountAmount?: number;
  status: 'Pending' | 'Contacted' | 'Activated' | 'Cancelled';
  createdAt: string;
  notes?: string;
}

export interface PromoCode {
  id: string;
  code: string;
  discountType: 'percentage' | 'fixed';
  discountValue: number;
  minOrderAmount?: number;
  active: boolean;
  usageCount?: number;
  created_at?: string;
}

export interface AdminUser {
  id: string;
  email: string;
  role: 'owner' | 'admin';
  isAuthenticated: boolean;
}

export interface PromotionalPoster {
  id: string;
  title: string;
  subtitle?: string;
  description?: string;
  badge?: string;
  image?: string;
  productId?: string;
  ctaText?: string;
  active: boolean;
  displayOrder: number;
  created_at?: string;
}

export interface CustomerReview {
  id: string;
  customerName: string;
  productName: string;
  rating: number; // 1 to 5
  comment: string;
  verifiedBuyer?: boolean;
  created_at: string;
}

export interface SiteSettings {
  id?: string;
  siteName: string;
  tagline: string;
  logoUrl: string;
  whatsappNumber?: string;
  displayWhatsapp?: string;
  whatsappCommunityUrl?: string;
  whatsapp_community_url?: string;
  showPromotionalPosters?: boolean;
  showAnnouncementPopup?: boolean;
  show_announcement_popup?: boolean;
  updatedAt?: string;
}


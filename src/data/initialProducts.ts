import { Product } from '../types';

export const INITIAL_PRODUCTS: Product[] = [
  {
    id: 'prod-gemini-pro',
    name: 'Google Gemini AI Pro Yearly',
    category: 'AI Tools',
    badge: '60% OFF',
    discountPercent: 60,
    description: 'Unlock Google\'s top-tier Gemini Advanced model with 1M+ token context, multimodal analysis, coding assistants, and full AI workspace suite.',
    image: '',
    bannerType: 'gemini',
    stock: 'In Stock',
    requiresEmailInput: true,
    instructions: 'Enter your email address during checkout for direct individual account activation.',
    plans: [
      {
        id: 'plan-gemini-basic',
        name: 'Basic Plan',
        price: 1299,
        billingCycle: 'Year',
        isPopular: false,
        features: [
          'Gemini Advanced Access',
          'Premium AI features',
          'AI tools access',
          'Secure activation'
        ]
      },
      {
        id: 'plan-gemini-standard',
        name: 'Standard Plan',
        price: 2699,
        billingCycle: 'Year',
        isPopular: true,
        features: [
          'Individual email activation',
          'Premium AI access',
          'Personal usage',
          'Priority support & updates'
        ]
      }
    ]
  },
  {
    id: 'prod-netflix-premium',
    name: 'Netflix Premium',
    category: 'Entertainment',
    badge: '20% OFF',
    discountPercent: 20,
    description: 'Stream unlimited movies, web series, and anime in Ultra HD 4K with Spatial Audio and multi-device support.',
    image: '',
    bannerType: 'netflix',
    stock: 'In Stock',
    requiresEmailInput: false,
    plans: [
      {
        id: 'plan-netflix-mobile',
        name: 'Mobile Plan',
        price: 349,
        billingCycle: 'Month',
        isPopular: false,
        features: [
          'Premium entertainment access',
          'High quality streaming',
          'Mobile & Tablet playback',
          'Ad-free experience'
        ]
      },
      {
        id: 'plan-netflix-tv',
        name: 'TV/Laptop Plan',
        price: 399,
        billingCycle: 'Month',
        isPopular: true,
        features: [
          'Premium entertainment access',
          'High quality 4K UHD streaming',
          'TV / PC / Laptop support',
          'Multi-profile support'
        ]
      }
    ]
  },
  {
    id: 'prod-capcut-pro',
    name: 'CapCut Pro',
    category: 'Video Editing',
    badge: '29% OFF',
    discountPercent: 29,
    description: 'Professional video creation with exclusive AI portrait cutout, auto-captions, premium transitions, and 4K 60FPS export.',
    image: '',
    bannerType: 'capcut',
    stock: 'In Stock',
    requiresEmailInput: false,
    plans: [
      {
        id: 'plan-capcut-monthly',
        name: 'Pro Monthly Plan',
        price: 444,
        billingCycle: 'Month',
        isPopular: true,
        features: [
          'Premium effects & filters',
          'AI editing tools & cutout',
          'Exclusive templates library',
          'High quality 4K export'
        ]
      }
    ]
  },
  {
    id: 'prod-youtube-premium',
    name: 'YouTube Premium',
    category: 'Entertainment',
    badge: '45% OFF',
    discountPercent: 45,
    description: 'Ad-free YouTube experience with seamless background audio playback, offline video downloads, and YouTube Music Premium access.',
    image: '',
    bannerType: 'youtube',
    stock: 'In Stock',
    requiresEmailInput: true,
    instructions: 'Requires your Google account email for family group or personal activation link.',
    plans: [
      {
        id: 'plan-youtube-monthly',
        name: 'Premium Monthly',
        price: 399,
        billingCycle: 'Month',
        isPopular: true,
        features: [
          'Ad free video watching',
          'Background play enabled',
          'High quality streaming',
          'YouTube Music Premium included'
        ]
      }
    ]
  },
  {
    id: 'prod-chatgpt-plus',
    name: 'ChatGPT Plus',
    category: 'AI Tools',
    badge: '27% OFF',
    discountPercent: 27,
    description: 'Accelerate productivity with GPT-4o, OpenAI o1 reasoning models, Deep Research mode, DALL-E 3 image generation, and canvas tool.',
    image: '',
    bannerType: 'chatgpt',
    stock: 'In Stock',
    requiresEmailInput: false,
    plans: [
      {
        id: 'plan-chatgpt-monthly',
        name: 'Plus Monthly Plan',
        price: 1799,
        billingCycle: 'Month',
        isPopular: true,
        features: [
          'Higher message limits',
          'Priority peak time access',
          'Deep Research & o1 reasoning',
          'DALL-E 3 & Custom GPTs'
        ]
      }
    ]
  }
];

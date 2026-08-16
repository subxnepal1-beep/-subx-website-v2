import React, { useState, useRef, useEffect } from 'react';
import { Product, SiteSettings, PromoCode } from '../types';
import { WHATSAPP_NUMBER } from '../lib/store';
import {
  X,
  Send,
  Sparkles,
  User,
  RefreshCw,
  ExternalLink,
  ShoppingBag,
  HelpCircle,
  ShieldCheck,
  CreditCard,
  Zap,
  Tag,
  PhoneCall,
  CheckCircle2,
  Copy,
  ChevronRight,
  Check,
  ArrowRight
} from 'lucide-react';

interface AIChatbotProps {
  products: Product[];
  siteSettings?: SiteSettings;
  promoCodes?: PromoCode[];
  onSelectProduct?: (product: Product) => void;
  onOpenCart?: () => void;
}

interface ChatMessage {
  id: string;
  sender: 'bot' | 'user';
  text: string;
  timestamp: string;
  actionButton?: {
    label: string;
    url?: string;
    productId?: string;
    actionType?: 'product' | 'whatsapp' | 'cart';
  };
  followUps?: string[];
}

export const SubXBotAvatar: React.FC<{ size?: 'sm' | 'md' | 'lg' | 'xl'; className?: string }> = ({
  size = 'md',
  className = ''
}) => {
  const dimensionMap = {
    sm: 'w-6 h-6',
    md: 'w-8 h-8',
    lg: 'w-10 h-10',
    xl: 'w-12 h-12'
  };

  return (
    <div
      className={`relative rounded-full flex items-center justify-center overflow-hidden shrink-0 select-none ${dimensionMap[size]} ${className}`}
      style={{
        background: 'radial-gradient(circle at 50% 50%, #0A1128 0%, #03060F 100%)',
        boxShadow: '0 0 12px rgba(0, 216, 255, 0.35), inset 0 0 8px rgba(0, 216, 255, 0.2)'
      }}
    >
      {/* Outer Cyan Ring */}
      <div className="absolute inset-0 rounded-full border-2 border-cyan-400/80 shadow-[0_0_10px_#00d8ff]" />

      {/* Robot Graphic SVG */}
      <svg viewBox="0 0 100 100" className="w-[88%] h-[88%] relative z-10" fill="none" xmlns="http://www.w3.org/2000/svg">
        {/* Antenna */}
        <line x1="50" y1="22" x2="50" y2="10" stroke="#00D8FF" strokeWidth="4" strokeLinecap="round" />
        <circle cx="50" cy="8" r="5" fill="#00D8FF" className="animate-pulse" />
        <circle cx="50" cy="8" r="8" fill="#00D8FF" opacity="0.3" />

        {/* Outer Head Frame / Ears */}
        <rect x="18" y="32" width="8" height="18" rx="4" fill="#00D8FF" />
        <rect x="74" y="32" width="8" height="18" rx="4" fill="#00D8FF" />

        {/* Main Robot Helmet / White Shell */}
        <rect x="22" y="22" width="56" height="42" rx="20" fill="url(#whiteShell)" stroke="#00D8FF" strokeWidth="2.5" />

        {/* Black Face Screen */}
        <rect x="28" y="27" width="44" height="32" rx="14" fill="#060A14" stroke="#00D8FF" strokeWidth="1.5" />

        {/* Glowing Cyan Happy Smiling Eyes */}
        <path d="M36 39 C38 34, 42 34, 44 39" stroke="#00D8FF" strokeWidth="3.5" strokeLinecap="round" fill="none" />
        <path d="M56 39 C58 34, 62 34, 64 39" stroke="#00D8FF" strokeWidth="3.5" strokeLinecap="round" fill="none" />

        {/* Small Smiling Mouth */}
        <path d="M44 48 Q50 53 56 48" stroke="#00D8FF" strokeWidth="2.5" strokeLinecap="round" fill="none" />

        {/* Robot Body */}
        <path d="M30 66 C30 62, 70 62, 70 66 L74 88 C74 92, 26 92, 26 88 Z" fill="url(#whiteShell)" stroke="#00D8FF" strokeWidth="2" />

        {/* Chest Badge (SX) */}
        <circle cx="50" cy="76" r="9" fill="#060A14" stroke="#00D8FF" strokeWidth="1.5" />
        <text x="50" y="79" fill="#00D8FF" fontSize="8" fontWeight="900" fontFamily="sans-serif" textAnchor="middle">SX</text>

        {/* Gradients */}
        <defs>
          <linearGradient id="whiteShell" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#FFFFFF" />
            <stop offset="70%" stopColor="#E2E8F0" />
            <stop offset="100%" stopColor="#CBD5E1" />
          </linearGradient>
        </defs>
      </svg>
    </div>
  );
};

/**
 * Clean & Professional Message Renderer without raw asterisks
 * Transforms text into structured UI with badges, high-contrast bold titles, and clean bullet lists.
 */
const FormattedMessage: React.FC<{ text: string; isBot: boolean }> = ({ text, isBot }) => {
  if (!isBot) {
    return <span className="font-normal text-white">{text}</span>;
  }

  // Parse lines
  const lines = text.split('\n');

  // Helper to parse bold segments inside a line (e.g., **text** -> <strong>) and strip any remaining asterisks
  const renderInlineContent = (lineStr: string) => {
    // Regex matches **bold text**
    const parts = lineStr.split(/(\*\*[^*]+\*\*)/g);
    return parts.map((part, idx) => {
      if (part.startsWith('**') && part.endsWith('**')) {
        const cleanBold = part.slice(2, -2).replace(/\*/g, '');
        return (
          <span key={idx} className="font-bold text-cyan-300">
            {cleanBold}
          </span>
        );
      }
      // Remove any standalone asterisks that might slip through
      const cleanPart = part.replace(/\*/g, '');
      return <React.Fragment key={idx}>{cleanPart}</React.Fragment>;
    });
  };

  return (
    <div className="space-y-1.5 text-xs text-slate-200 leading-relaxed font-normal">
      {lines.map((line, lIdx) => {
        const trimmed = line.trim();

        // Empty line -> small spacing
        if (!trimmed) {
          return <div key={lIdx} className="h-1" />;
        }

        // Header / Main Title line (starts with emoji or bold title like 🍿, ⚡, 🤖, 💳, 🛡️, 💰)
        if (
          (trimmed.startsWith('🍿') ||
            trimmed.startsWith('🤖') ||
            trimmed.startsWith('✨') ||
            trimmed.startsWith('🎬') ||
            trimmed.startsWith('🎵') ||
            trimmed.startsWith('🎨') ||
            trimmed.startsWith('🎧') ||
            trimmed.startsWith('📺') ||
            trimmed.startsWith('🛡️') ||
            trimmed.startsWith('💳') ||
            trimmed.startsWith('⚡') ||
            trimmed.startsWith('💰') ||
            trimmed.startsWith('🎁') ||
            trimmed.startsWith('🛠️') ||
            trimmed.startsWith('📱') ||
            trimmed.startsWith('📁')) &&
          lIdx === 0
        ) {
          return (
            <div
              key={lIdx}
              className="pb-1.5 mb-1.5 border-b border-cyan-500/20 text-white font-bold text-[13px] flex items-center gap-1.5 text-cyan-200"
            >
              {renderInlineContent(trimmed)}
            </div>
          );
        }

        // Section header like 'मूल्य सूची (Pricing Plans):' or 'विशेषताहरू:'
        if (trimmed.endsWith(':') && (trimmed.includes('सूची') || trimmed.includes('विशेषता') || trimmed.includes('Status') || trimmed.includes('चरण') || trimmed.includes('प्रक्रिया') || trimmed.includes('माध्यम'))) {
          return (
            <div key={lIdx} className="pt-1 font-semibold text-cyan-400 text-[11px] uppercase tracking-wider">
              {renderInlineContent(trimmed)}
            </div>
          );
        }

        // Numbered Steps (e.g. 1️⃣, 2️⃣, 3️⃣, 4️⃣)
        if (/^[1-9]️⃣/.test(trimmed)) {
          return (
            <div key={lIdx} className="flex items-start gap-2 bg-slate-950/60 p-2 rounded-lg border border-slate-800/80 my-1">
              <div className="shrink-0 text-sm mt-0.5">{trimmed.slice(0, 3)}</div>
              <div className="flex-1 text-slate-200 text-[11.5px] leading-snug">
                {renderInlineContent(trimmed.slice(3).trim())}
              </div>
            </div>
          );
        }

        // Bullet point lines with • or ✓
        if (trimmed.startsWith('•') || trimmed.startsWith('✓') || trimmed.startsWith('-')) {
          const bullet = trimmed.startsWith('✓') ? '✓' : '•';
          const rest = trimmed.replace(/^[•✓\-]\s*/, '');
          return (
            <div key={lIdx} className="flex items-start gap-1.5 pl-1 my-0.5">
              <span className={bullet === '✓' ? 'text-emerald-400 font-bold shrink-0' : 'text-cyan-400 font-bold shrink-0'}>
                {bullet}
              </span>
              <span className="flex-1 text-slate-200">{renderInlineContent(rest)}</span>
            </div>
          );
        }

        // Standard line
        return (
          <div key={lIdx} className="text-slate-200">
            {renderInlineContent(trimmed)}
          </div>
        );
      })}
    </div>
  );
};

export const AIChatbot: React.FC<AIChatbotProps> = ({
  products,
  siteSettings,
  promoCodes = [],
  onSelectProduct,
  onOpenCart
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [inputMessage, setInputMessage] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const targetPhone = (siteSettings?.whatsappNumber || WHATSAPP_NUMBER).replace(/[^0-9]/g, '');
  const rawWhatsAppUrl = `https://wa.me/${targetPhone}`;

  const initialGreeting: ChatMessage = {
    id: 'welcome-1',
    sender: 'bot',
    text: `नमस्ते हजुर! 🙏 SubX Nepal को आधिकारिक AI सहायक (Subxnp bot) मा स्वागत छ।\n\nम हजुरलाई उत्कृष्ट डिजिटल सब्सक्रिप्शनहरू, आधिकारिक मूल्य, डेलिभरी प्रक्रिया र भुक्तानीमा मद्दत गर्न सधैं तयार छु।\n\nआज हजुरलाई कुन प्रिमियम सर्भिस (Netflix, ChatGPT, YouTube, CapCut वा अन्य) को बारेमा जानकारी चाहिन्छ?`,
    timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    followUps: ['💰 Price List', '🍿 Netflix Plan', '🤖 ChatGPT Plus', '⚡ कसरी अर्डर गर्ने?']
  };

  const [messages, setMessages] = useState<ChatMessage[]>([initialGreeting]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    if (isOpen) {
      scrollToBottom();
    }
  }, [messages, isOpen, isTyping]);

  // Copy text helper
  const handleCopyText = (id: string, text: string) => {
    // Strip raw asterisks for clean clipboard copy
    const cleanText = text.replace(/\*\*/g, '').replace(/\*/g, '');
    navigator.clipboard.writeText(cleanText);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  // Ultra-Smart Knowledge & NLP Matching Engine (100% Free - zero API token bills)
  const generateResponse = (query: string): { text: string; actionButton?: ChatMessage['actionButton']; followUps?: string[] } => {
    const q = query.toLowerCase().trim();

    // Helper to find matching product in dynamic catalog
    const findProduct = (keywords: string[]): Product | undefined => {
      return products.find(p => {
        const name = p.name.toLowerCase();
        const desc = p.description.toLowerCase();
        return keywords.some(k => name.includes(k) || desc.includes(k));
      });
    };

    // Helper to format product details nicely without raw asterisks
    const formatProductResponse = (product: Product, customIntro?: string) => {
      const plansFormatted = product.plans && product.plans.length > 0
        ? product.plans.map(p => `• **${p.name}**: Rs. ${p.price.toLocaleString()} / ${p.billingCycle}${p.isPopular ? ' 🔥 (सबैभन्दा धेरै रुचाइएको)' : ''}`).join('\n')
        : `• Price: Rs. ${product.price || 0}`;

      const stockBadge = product.stock === 'In Stock'
        ? '🟢 In Stock (उपलब्ध छ)'
        : product.stock === 'Limited Stock'
          ? '🟡 Limited Stock (सिमित मात्र)'
          : '🔴 Out of Stock (चाँडै आउँदैछ)';

      const emailNote = product.requiresEmailInput
        ? '\n📧 **Activation**: Direct हजुरको आफ्नै Email मा Activate हुन्छ।'
        : '\n🔒 **Delivery**: Private Profile / PIN Protected Login Access प्रदान गरिन्छ।';

      const featuresList = product.plans?.[0]?.features && product.plans[0].features.length > 0
        ? `\n✨ **मुख्य विशेषताहरू:**\n${product.plans[0].features.slice(0, 4).map(f => `  ✓ ${f}`).join('\n')}`
        : '';

      return {
        text: `${customIntro || `✨ **${product.name} Official Subscription**`}\n\n📊 **Stock Status:** ${stockBadge}\n\n💵 **मूल्य सूची (Pricing Plans):**\n${plansFormatted}${featuresList}${emailNote}\n\n🛡️ **Warranty:** १००% Replacement ग्यारेन्टी र २४/७ Customer Support!\n⚡ **डेलिभरी समय:** भुक्तानीपछि ५-१५ मिनेट भित्र WhatsApp मा।`,
        actionButton: {
          label: `👉 ${product.name} को Plan हेर्नुहोस्`,
          productId: product.id,
          actionType: 'product' as const
        },
        followUps: ['⚡ कसरी अर्डर गर्ने?', '💳 Payment Methods', '💰 All Price List', '📱 WhatsApp मा सोध्नुहोस्']
      };
    };

    // 1. Specific Product Match: NETFLIX
    if (q.includes('netflix') || q.includes('netflx') || q.includes('netfflix') || q.includes('movie') || q.includes('filim') || q.includes('सिनेमा') || q.includes('नेटफ्लिक्स')) {
      const netflix = findProduct(['netflix']);
      if (netflix) {
        return formatProductResponse(netflix, '🍿 **Netflix Premium 4K UHD (Official Ultra HD Plan)**');
      }
      return {
        text: `🍿 **Netflix Premium 4K Ultra HD:**\n\n• **Mobile Plan**: Rs. 349 / Month (Mobile & Tablet 4K streaming)\n• **TV & Laptop Plan**: Rs. 399 / Month (Smart TV, Laptop, PC & Mobile)\n\n✨ **विशेषताहरू:**\n✓ Private Profile with Custom 4-digit PIN\n✓ 4K Ultra HD + Dolby Atmos Audio\n✓ 100% Non-Drop & Full Replacement Warranty\n\n⚡ **डेलिभरी:** ५-१५ मिनेट भित्र WhatsApp मा PIN सहित प्राप्त हुन्छ।`,
        actionButton: {
          label: '📱 WhatsApp मा अर्डर गर्नुहोस्',
          url: `${rawWhatsAppUrl}?text=${encodeURIComponent('Hello SubX Nepal, I want to buy Netflix Premium subscription.')}`,
          actionType: 'whatsapp'
        },
        followUps: ['💳 Payment Kasari Garne?', '⚡ Delivery Time?', '🤖 ChatGPT Plus Rate']
      };
    }

    // 2. Specific Product Match: CHATGPT PLUS
    if (q.includes('chatgpt') || q.includes('chat gpt') || q.includes('gpt') || q.includes('gpt4') || q.includes('o1') || q.includes('openai') || q.includes('च्याटजिपिटी')) {
      const gpt = findProduct(['chatgpt', 'gpt']);
      if (gpt) {
        return formatProductResponse(gpt, '🤖 **ChatGPT Plus (GPT-4o, o1, Canvas & Voice Mode)**');
      }
    }

    // 3. Specific Product Match: GOOGLE GEMINI ADVANCED
    if (q.includes('gemini') || q.includes('gemni') || q.includes('google ai') || q.includes('जेमिनी')) {
      const gemini = findProduct(['gemini']);
      if (gemini) {
        return formatProductResponse(gemini, '✨ **Google Gemini Advanced AI (1M+ Token Context + Workspace)**');
      }
    }

    // 4. Specific Product Match: CAPCUT PRO
    if (q.includes('capcut') || q.includes('cap cut') || q.includes('editing') || q.includes('video edit') || q.includes('क्यापकट')) {
      const capcut = findProduct(['capcut']);
      if (capcut) {
        return formatProductResponse(capcut, '🎬 **CapCut Pro Premium (PC, Mac, iPhone & Android)**');
      }
    }

    // 5. Specific Product Match: YOUTUBE PREMIUM
    if (q.includes('youtube') || q.includes('yt') || q.includes('yt music') || q.includes('music') || q.includes('गीत') || q.includes('युट्युब')) {
      const yt = findProduct(['youtube', 'yt']);
      if (yt) {
        return formatProductResponse(yt, '🎵 **YouTube Premium + YouTube Music (Ad-Free Background Play)**');
      }
    }

    // 6. Specific Product Match: CANVA PRO
    if (q.includes('canva') || q.includes('design') || q.includes('क्यानभा')) {
      const canva = findProduct(['canva']);
      if (canva) {
        return formatProductResponse(canva, '🎨 **Canva Pro Education / Brand Kit Subscription**');
      }
    }

    // 7. Specific Product Match: SPOTIFY
    if (q.includes('spotify') || q.includes('spotfy') || q.includes('स्पोटिफाइ')) {
      const spotify = findProduct(['spotify']);
      if (spotify) {
        return formatProductResponse(spotify, '🎧 **Spotify Premium Individual / Duo Plan**');
      }
    }

    // 8. Specific Product Match: NORDVPN / EXPRESSVPN / VPN
    if (q.includes('vpn') || q.includes('nord') || q.includes('expressvpn') || q.includes('भिपीएन')) {
      const vpn = findProduct(['vpn', 'nord']);
      if (vpn) {
        return formatProductResponse(vpn, '🛡️ **Premium VPN (Fast, Secure & Dedicated Servers)**');
      }
    }

    // 9. Specific Product Match: PRIME VIDEO / AMAZON
    if (q.includes('prime') || q.includes('amazon') || q.includes('अमेजन')) {
      const prime = findProduct(['prime', 'amazon']);
      if (prime) {
        return formatProductResponse(prime, '📺 **Amazon Prime Video HD / 4K Streaming**');
      }
    }

    // 10. Specific Product Match: CRUNCHYROLL
    if (q.includes('crunchyroll') || q.includes('anime') || q.includes('अनिमे')) {
      const cr = findProduct(['crunchyroll', 'anime']);
      if (cr) {
        return formatProductResponse(cr, '⚡ **Crunchyroll Fan / Mega Fan (Ad-free Anime in 1080p)**');
      }
    }

    // 11. Generic Dynamic Product Search (Matches any product name in current catalog!)
    for (const prod of products) {
      const prodNameParts = prod.name.toLowerCase().split(/\s+/);
      const isMatch = prodNameParts.some(part => part.length > 2 && q.includes(part));
      if (isMatch) {
        return formatProductResponse(prod);
      }
    }

    // 12. PRICE LIST / RATE CARD / KATI PARCHA
    if (
      q.includes('price') ||
      q.includes('rate') ||
      q.includes('kati') ||
      q.includes('cost') ||
      q.includes('charge') ||
      q.includes('list') ||
      q.includes('menu') ||
      q.includes('k k cha') ||
      q.includes('all') ||
      q.includes('मूल्य') ||
      q.includes('कति') ||
      q.includes('रेट')
    ) {
      let priceText = '💰 **SubX Nepal - आधिकारिक मूल्य सूची (Official Rates):**\n\n';
      
      const categories: { [cat: string]: Product[] } = {};
      products.forEach(p => {
        if (!categories[p.category]) categories[p.category] = [];
        categories[p.category].push(p);
      });

      Object.entries(categories).forEach(([category, prods]) => {
        priceText += `📁 **${category}:**\n`;
        prods.forEach(p => {
          const minPrice = p.plans && p.plans.length > 0
            ? Math.min(...p.plans.map(plan => plan.price))
            : (p.price || 0);
          priceText += `  • **${p.name}**: Starting from Rs. ${minPrice.toLocaleString()}\n`;
        });
        priceText += '\n';
      });

      priceText += '💡 माथि उल्लेखित सबै प्लानहरू १००% आधिकारिक र Replacement Warranty सहित उपलब्ध छन्।';

      return {
        text: priceText,
        actionButton: {
          label: '🛒 Cart खोल्नुहोस्',
          actionType: 'cart'
        },
        followUps: ['🍿 Netflix Plan', '🤖 ChatGPT Plus', '⚡ Kasari Kinne?', '💳 Payment Methods']
      };
    }

    // 13. HOW TO ORDER / KASARI KINNE / PROCESS
    if (
      q.includes('order') ||
      q.includes('kinne') ||
      q.includes('how to') ||
      q.includes('kasari') ||
      q.includes('line') ||
      q.includes('process') ||
      q.includes('step') ||
      q.includes('tarika') ||
      q.includes('अर्डर') ||
      q.includes('कसरी') ||
      q.includes('प्रक्रिया')
    ) {
      return {
        text: `⚡ **SubX Nepal मा अर्डर गर्ने सजिलो ४ चरण (Easy 4 Steps):**\n\n1️⃣ **Plan छान्नुहोस्:** आफूलाई चाहिएको Subscription (Netflix, ChatGPT, CapCut आदि) मा गएर Select Plan मा थिच्नुहोस्।\n\n2️⃣ **Cart वा Direct Checkout:** 'Add to Cart' गर्नुहोस् वा सिधै अर्डर बटन थिच्नुहोस्।\n\n3️⃣ **Payment गर्नुहोस्:** eSewa, Khalti वा Mobile Banking QR बाट Payment गरी Screenshot दिनुहोस्।\n\n4️⃣ **Instant Access:** ५ देखि १५ मिनेट भित्र WhatsApp / Email मा Login Credentials वा Activation Link प्राप्त गर्नुहोस्!\n\nयदी कुनै अलमल छ भने WhatsApp मा सिधै सम्पर्क गर्न सक्नुहुन्छ।`,
        actionButton: {
          label: '📱 WhatsApp मा अर्डर गर्नुहोस्',
          url: `${rawWhatsAppUrl}?text=${encodeURIComponent('Namaste SubX Nepal, I would like to order a subscription.')}`,
          actionType: 'whatsapp'
        },
        followUps: ['💳 Payment Methods', '💰 Price List', '🛡️ Warranty & Trust', '🍿 Netflix']
      };
    }

    // 14. PAYMENT METHODS / ESEWA / KHALTI / QR / BANK
    if (
      q.includes('payment') ||
      q.includes('pay') ||
      q.includes('esewa') ||
      q.includes('khalti') ||
      q.includes('qr') ||
      q.includes('bank') ||
      q.includes('fonepay') ||
      q.includes('ime') ||
      q.includes('tirne') ||
      q.includes('पेमेन्ट') ||
      q.includes('पैसा') ||
      q.includes('इसेवा') ||
      q.includes('खल्ती')
    ) {
      return {
        text: `💳 **SubX Nepal मा उपलब्ध भुक्तानीका माध्यमहरू (Payment Options):**\n\n✓ **eSewa ID / QR Code** (शून्य अतिरिक्त शुल्क)\n✓ **Khalti Wallet / QR**\n✓ **Mobile Banking / Fonepay QR** (नेपालका सबै बैंकहरूबाट)\n✓ **IME Pay / ConnectIPS**\n\n📌 **पेमेन्ट प्रक्रिया:**\nहजुरले अर्डर गरेपछि हाम्रो आधिकारिक eSewa / Fonepay QR Code प्राप्त गर्नुहुनेछ। भुक्तानी पश्चात ट्रान्ज्याक्सनको स्क्रिनसट पठाउनासाथ ५-१५ मिनेटमा हजुरको सब्सक्रिप्शन सुचारु हुन्छ।`,
        actionButton: {
          label: '📱 Payment QR को लागि WhatsApp मा जानुहोस्',
          url: `${rawWhatsAppUrl}?text=${encodeURIComponent('Hello SubX Nepal, please provide the Payment QR / eSewa details.')}`,
          actionType: 'whatsapp'
        },
        followUps: ['⚡ Delivery Time?', '💰 Price List', '🍿 Netflix Plan', '🤖 ChatGPT Plus']
      };
    }

    // 15. DELIVERY TIME & SPEED
    if (
      q.includes('delivery') ||
      q.includes('time') ||
      q.includes('kati ber') ||
      q.includes('delay') ||
      q.includes('speed') ||
      q.includes('instant') ||
      q.includes('receive') ||
      q.includes('कति समय') ||
      q.includes('डेलिभरी')
    ) {
      return {
        text: `⚡ **Ultra-Fast Instant Delivery Guarantee!**\n\n⏱️ **डेलिभरी समय:** भुक्तानी प्रमाणीकरण भएको **५ देखि १५ मिनेट** भित्र।\n\n📩 **प्राप्ति माध्यम:**\n• WhatsApp मार्फत आधिकारिक Login ID, Password, र PIN\n• वा हजुरको आफ्नै Email मा आधिकारिक Invitation Link (Gemini / YouTube Premium को हकमा)\n\nहाम्रो टिम २४/७ सक्रिय रहेकाले ढिलाइ बिना तुरुन्त सेवा प्रदान गरिन्छ।`,
        followUps: ['💳 Payment Methods', '💰 Price List', '🛡️ Replacement Warranty', '📱 WhatsApp Chat']
      };
    }

    // 16. TRUST / GENUINE / WARRANTY / REPLACEMENT POLICY
    if (
      q.includes('genuine') ||
      q.includes('fake') ||
      q.includes('trust') ||
      q.includes('warranty') ||
      q.includes('guarantee') ||
      q.includes('replacement') ||
      q.includes('scam') ||
      q.includes('safe') ||
      q.includes('real') ||
      q.includes('वारेन्टी') ||
      q.includes('विश्वास') ||
      q.includes('सुरक्षित')
    ) {
      return {
        text: `🛡️ **१००% Genuine & Full-Term Replacement Warranty!**\n\nSubX Nepal मा हामी हाम्रा सबै ग्राहकहरूलाई निम्न सुरक्षा प्रत्याभूति गर्दछौं:\n\n1️⃣ **100% Genuine Accounts:** कुनै पनि अवैध वा क्र्याक नभई आधिकारिक सर्भिसहरू।\n2️⃣ **Non-Drop Guarantee:** खरिद गरिएको अवधिसम्म निरन्तर चल्ने ग्यारेन्टी।\n3️⃣ **Instant Free Replacement:** प्राविधिक समस्या आएमा तुरुन्त नयाँ लगइन वा समस्या समाधान।\n4️⃣ **24/7 Dedicated Support:** कुनै पनि जिज्ञासाको लागि WhatsApp मा तुरुन्त रेस्पोन्स।\n\nहजुर निर्धक्क भएर सेवा लिन सक्नुहुन्छ! 😊`,
        actionButton: {
          label: '📱 WhatsApp Support मा कुरा गर्नुहोस्',
          url: `${rawWhatsAppUrl}?text=${encodeURIComponent('Hello SubX Nepal, I want to know more about your warranty & services.')}`,
          actionType: 'whatsapp'
        },
        followUps: ['💰 Price List', '⚡ Kasari Kinne?', '🍿 Netflix Plans', '🤖 ChatGPT Plus']
      };
    }

    // 17. PROMO CODE / COUPON / DISCOUNT
    if (
      q.includes('promo') ||
      q.includes('coupon') ||
      q.includes('code') ||
      q.includes('discount') ||
      q.includes('offer') ||
      q.includes('sasto') ||
      q.includes('छुट') ||
      q.includes('कुपन') ||
      q.includes('अफर')
    ) {
      const activeCodes = promoCodes.filter(p => p.active !== false && String(p.active) !== 'false' && String(p.active) !== '0');
      let promoText = '🎁 **SubX Nepal - छुट तथा कुपन कोडहरू (Promo Deals):**\n\n';
      
      if (activeCodes.length > 0) {
        activeCodes.forEach(code => {
          promoText += `• **${code.code}**: ${code.discountType === 'percentage' ? `${code.discountValue}% OFF` : `Rs. ${code.discountValue} FLAT OFF`}${code.minOrderAmount ? ` (Min. Rs. ${code.minOrderAmount} को अर्डरमा)` : ''}\n`;
        });
      } else {
        promoText += `• **WELCOME50**: नयाँ ग्राहकहरूका लागि फ्ल्याट Rs. 50 छुट!\n• **SUBX10**: सिलेक्टेड प्रिमियम AI प्लानहरूमा १०% छुट!\n`;
      }
      
      promoText += '\n📌 **प्रयोग गर्ने तरिका:**\nCart Drawer मा गएर Promo Code बक्समा कोड राखी Apply बटन थिच्नुहोस्।';

      return {
        text: promoText,
        actionButton: {
          label: '🛒 Cart मा Promo Code प्रयोग गर्नुहोस्',
          actionType: 'cart'
        },
        followUps: ['💰 All Price List', '🍿 Netflix', '🤖 ChatGPT Plus', '⚡ Kasari Kinne?']
      };
    }

    // 18. COMPARISON: ChatGPT vs Gemini / Best AI
    if ((q.includes('chatgpt') && q.includes('gemini')) || q.includes('vs') || q.includes('difference') || q.includes('kun ramro') || q.includes('best ai')) {
      return {
        text: `🤖 **ChatGPT Plus vs Google Gemini Advanced (तुलना):**\n\n🔥 **ChatGPT Plus (Rs. 2,999/mo):**\n✓ GPT-4o, o1 reasoning & Deep Research\n✓ DALL-E 3 image generation & Custom GPTs\n✓ Advanced Voice Mode & Coding Assistance\n👉 उत्कृष्ट छ: Developer, Researcher, र AI Enthusiasts का लागि।\n\n✨ **Gemini Advanced (Rs. 2,499/mo):**\n✓ 1M+ Token massive context window\n✓ Google Workspace (Docs, Gmail, Drive) integration\n✓ 2TB Google One Cloud Storage\n👉 उत्कृष्ट छ: Students, Professionals, र Google Ecosystem युजर्सका लागि।`,
        actionButton: {
          label: '🤖 ChatGPT र Gemini को Plans हेर्नुहोस्',
          actionType: 'cart'
        },
        followUps: ['🤖 ChatGPT Plus Price', '✨ Gemini Advanced Price', '⚡ Kasari Kinne?']
      };
    }

    // 19. TROUBLESHOOTING / PROBLEM / LOGIN ISSUE
    if (
      q.includes('problem') ||
      q.includes('issue') ||
      q.includes('login') ||
      q.includes('password') ||
      q.includes('kam garena') ||
      q.includes('error') ||
      q.includes('chalena') ||
      q.includes('मिल्दैन') ||
      q.includes('समस्या')
    ) {
      return {
        text: `🛠️ **समस्या समाधान तथा सहायता (Troubleshooting Support):**\n\nयदि हजुरको सब्स्क्रिप्सन वा लगइनमा कुनै समस्या आएको छ भने नआत्तिनुहोस्, हामी तुरुन्त समाधान गर्छौं:\n\n1️⃣ **Password / PIN Check:** कृपया क्यापिटल/स्मल लेटर र स्पेस राम्रोसँग जाँच गर्नुहोस्।\n2️⃣ **Multiple Device Limit:** एउटै प्रोफाइल एक भन्दा बढी डिभाइसमा लगइन नगर्नुहोस्।\n3️⃣ **Instant WhatsApp Support:** समस्या समाधान नभएमा हाम्रो आधिकारिक WhatsApp मा Order ID सहित म्यासेज गर्नुहोस् — हामी ५ मिनेट भित्र रिप्लेसमेन्ट वा फिक्स दिनेछौं।`,
        actionButton: {
          label: '📱 WhatsApp Support मा सिधै कुरा गर्नुहोस्',
          url: `${rawWhatsAppUrl}?text=${encodeURIComponent('Hello SubX Support Team, I am facing an issue with my subscription.')}`,
          actionType: 'whatsapp'
        },
        followUps: ['🛡️ Warranty Policy', '⚡ Delivery Time?', '💰 Price List']
      };
    }

    // 20. GREETINGS & CASUAL INTERACTION
    if (
      q.includes('namaste') ||
      q.includes('hi') ||
      q.includes('hello') ||
      q.includes('hey') ||
      q.includes('sathi') ||
      q.includes('subxnp') ||
      q.includes('k cha') ||
      q.includes('sanchai') ||
      q.includes('khoi') ||
      q.includes('नमस्ते') ||
      q.includes('हाई') ||
      q.includes('हेलो')
    ) {
      return {
        text: `नमस्ते हजुर! 🙏 म सबएक्स नेपालको आधिकारिक एआई सहायक Subxnp bot हुँ। म एकदम सन्चै छु, हजुरलाई कस्तो छ?\n\nआज हजुरलाई कुन डिजिटल सब्स्क्रिप्सन (Netflix, ChatGPT, CapCut, YouTube वा अन्य) को बारेमा जानकारी चाहिन्छ भन्नुहोस् है!`,
        followUps: ['💰 Price List', '🍿 Netflix Plans', '🤖 ChatGPT Plus', '⚡ Kasari Kinne?']
      };
    }

    // 21. THANK YOU / APPRECIATION
    if (q.includes('thank') || q.includes('dhanyabad') || q.includes('dhanybada') || q.includes('bye') || q.includes('धन्यवाद')) {
      return {
        text: `हजुरलाई धेरै धेरै धन्यवाद! 🙏😊\n\nSubX Nepal रोज्नुभएकोमा हामी आभारी छौं। कुनै पनि बेला थप सहयोग वा नयाँ अर्डरका लागि म हजुरकै सेवामा छु। हजुरको दिन शुभ रहोस्!`,
        followUps: ['💰 All Products Price', '📱 WhatsApp Support', '🍿 Netflix']
      };
    }

    // 22. HUMAN CONTACT / WHATSAPP NUMBER
    if (
      q.includes('contact') ||
      q.includes('number') ||
      q.includes('whatsapp') ||
      q.includes('owner') ||
      q.includes('human') ||
      q.includes('call') ||
      q.includes('फोन') ||
      q.includes('सम्पर्क')
    ) {
      return {
        text: `📱 **SubX Nepal Official Customer Care:**\n\nहाम्रो आधिकारिक ग्राहक सेवा प्रतिनिधिहरूसँग प्रत्यक्ष कुराकानी गर्न तलको WhatsApp बटनमा थिच्नुहोस्।\n\n📞 **WhatsApp No.:** +${targetPhone}\n⏰ **सेवा समय:** २४ घण्टा, हप्ताको ७ दिन सक्रिय!`,
        actionButton: {
          label: '💬 Open WhatsApp Chat',
          url: rawWhatsAppUrl,
          actionType: 'whatsapp'
        },
        followUps: ['💰 Price List', '⚡ Kasari Kinne?', '🍿 Netflix Plans']
      };
    }

    // 23. FALLBACK GENERAL PROFESSIONAL RESPONSE
    return {
      text: `हजुरको प्रश्नको लागि धन्यवाद! 🙏\n\nहामीसँग **Netflix Premium, ChatGPT Plus, Google Gemini Advanced, CapCut Pro, YouTube Premium, Canva Pro** लगायतका सबै प्रिमियम डिजिटल सेवाहरू सबैभन्दा सुलभ मूल्यमा उपलब्ध छन्।\n\nतलका विकल्पहरूबाट हजुरलाई चाहिएको विषय छनोट गर्न सक्नुहुन्छ:`,
      actionButton: {
        label: '📱 WhatsApp मा थप सोध्नुहोस्',
        url: `${rawWhatsAppUrl}?text=${encodeURIComponent(`Hello SubX Nepal, I have a question regarding: ${query}`)}`,
        actionType: 'whatsapp'
      },
      followUps: ['💰 All Price List', '🍿 Netflix Plan', '🤖 ChatGPT Plus', '⚡ Kasari Kinne?']
    };
  };

  const handleSendMessage = (textToSend?: string) => {
    const text = textToSend || inputMessage;
    if (!text.trim()) return;

    const userMsg: ChatMessage = {
      id: Date.now().toString(),
      sender: 'user',
      text: text.trim(),
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };

    setMessages(prev => [...prev, userMsg]);
    if (!textToSend) setInputMessage('');
    setIsTyping(true);

    // Realistic smart response delay
    const delay = Math.min(600 + text.length * 10, 1000);

    setTimeout(() => {
      const response = generateResponse(text);
      const botMsg: ChatMessage = {
        id: (Date.now() + 1).toString(),
        sender: 'bot',
        text: response.text,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        actionButton: response.actionButton,
        followUps: response.followUps
      };
      setMessages(prev => [...prev, botMsg]);
      setIsTyping(false);
    }, delay);
  };

  const handleActionClick = (action?: ChatMessage['actionButton']) => {
    if (!action) return;
    if (action.actionType === 'cart') {
      if (onOpenCart) onOpenCart();
      setIsOpen(false);
    } else if (action.url) {
      window.open(action.url, '_blank');
    } else if (action.productId && onSelectProduct) {
      const prod = products.find(p => p.id === action.productId);
      if (prod) {
        onSelectProduct(prod);
        setIsOpen(false);
      }
    }
  };

  return (
    <>
      {/* Floating AI Chatbot Button on RIGHT side */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        aria-label="Open Subxnp bot Assistant"
        className="fixed bottom-6 right-4 sm:right-6 z-50 flex items-center justify-center w-13 h-13 sm:w-14 sm:h-14 bg-[#060A14] hover:bg-[#0A1020] text-white rounded-full shadow-[0_0_22px_rgba(0,216,255,0.5)] hover:shadow-[0_0_32px_rgba(0,216,255,0.8)] hover:scale-105 active:scale-95 transition-all duration-300 group border-2 border-cyan-400 p-0.5"
        title="Subxnp bot (SubX Nepal AI Assistant)"
      >
        {isOpen ? (
          <div className="w-full h-full rounded-full bg-slate-900 flex items-center justify-center">
            <X className="w-6 h-6 text-cyan-400" />
          </div>
        ) : (
          <div className="relative w-full h-full flex items-center justify-center">
            <SubXBotAvatar size="lg" className="w-full h-full" />
            <span className="absolute -top-0.5 -right-0.5 flex h-4 w-4">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-cyan-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-4 w-4 bg-cyan-400 border-2 border-[#060A14]"></span>
            </span>
          </div>
        )}
      </button>

      {/* Chat Window Popup */}
      {isOpen && (
        <div className="fixed bottom-22 right-3 sm:right-6 z-50 w-[calc(100vw-1.5rem)] sm:w-[410px] h-[550px] max-h-[82vh] bg-[#0C101C] border border-cyan-500/30 rounded-2xl shadow-[0_15px_50px_rgba(0,0,0,0.85)] flex flex-col overflow-hidden animate-fade-in backdrop-blur-xl ring-1 ring-cyan-500/20">
          
          {/* Header */}
          <div className="bg-gradient-to-r from-[#060913] via-[#0E172E] to-[#060913] p-3.5 border-b border-cyan-500/20 flex items-center justify-between shrink-0">
            <div className="flex items-center gap-2.5">
              <SubXBotAvatar size="md" className="border border-cyan-400/60 shadow-md" />
              <div>
                <div className="flex items-center gap-1.5">
                  <h3 className="text-sm font-black text-white tracking-wide flex items-center gap-1.5">
                    <span className="text-cyan-300 font-bold">Subxnp bot</span>
                    <span className="inline-flex items-center justify-center w-3.5 h-3.5 rounded-full bg-cyan-500/20 text-cyan-400 text-[10px]">
                      ✓
                    </span>
                  </h3>
                </div>
                <p className="text-[10.5px] font-medium text-slate-400 flex items-center gap-1.5 mt-0.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
                  <span>Online • 24/7 Instant Reply</span>
                </p>
              </div>
            </div>

            <div className="flex items-center gap-1">
              <button
                onClick={() => {
                  setMessages([initialGreeting]);
                }}
                title="Reset Conversation"
                className="p-1.5 text-slate-400 hover:text-cyan-400 hover:bg-slate-800/80 rounded-lg transition-all"
              >
                <RefreshCw className="w-4 h-4" />
              </button>

              <button
                onClick={() => setIsOpen(false)}
                className="p-1.5 text-slate-400 hover:text-white hover:bg-slate-800/80 rounded-lg transition-all"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          </div>

          {/* Quick Category Chips Strip */}
          <div className="px-3 py-2 bg-slate-950/90 border-b border-slate-800/80 flex items-center gap-1.5 overflow-x-auto scrollbar-none shrink-0">
            {[
              { label: '💰 Price List', query: 'Price list kati ho?' },
              { label: '🍿 Netflix', query: 'Netflix ko plan ra price kati ho?' },
              { label: '🤖 ChatGPT', query: 'ChatGPT Plus ko price ra features k k chhan?' },
              { label: '⚡ Kasari Kinne?', query: 'Order kasari garne?' },
              { label: '💳 Payment', query: 'Payment kasari garne eSewa QR bata?' },
              { label: '🎬 CapCut Pro', query: 'CapCut Pro ko rate kati ho?' },
              { label: '🎵 YouTube', query: 'YouTube Premium ko rate kati ho?' },
              { label: '🛡️ Warranty', query: 'Replacement warranty kasto chha?' },
              { label: '🎁 Promo Code', query: 'Kunai discount coupon code chha?' },
              { label: '📱 WhatsApp', query: 'Official WhatsApp support number dinuhos' }
            ].map((item, idx) => (
              <button
                key={idx}
                onClick={() => handleSendMessage(item.query)}
                className="px-2.5 py-1 bg-slate-900/90 hover:bg-cyan-950/80 text-slate-300 hover:text-cyan-300 text-[11px] font-semibold rounded-lg border border-slate-700/60 hover:border-cyan-500/50 whitespace-nowrap transition-all active:scale-95 shrink-0 shadow-sm"
              >
                {item.label}
              </button>
            ))}
          </div>

          {/* Messages Container */}
          <div className="flex-1 overflow-y-auto p-3.5 space-y-3.5 bg-gradient-to-b from-[#090C16] to-[#06080F]">
            {messages.map((msg) => (
              <div
                key={msg.id}
                className={`flex gap-2.5 ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                {msg.sender === 'bot' && (
                  <SubXBotAvatar size="sm" className="mt-0.5 border border-cyan-400/50 shadow" />
                )}

                <div
                  className={`max-w-[88%] sm:max-w-[85%] rounded-2xl px-3.5 py-2.5 text-xs leading-relaxed group relative ${
                    msg.sender === 'user'
                      ? 'bg-gradient-to-r from-cyan-600 to-blue-600 text-white rounded-br-none shadow-md'
                      : 'bg-[#111625] text-slate-100 border border-slate-800/90 rounded-bl-none shadow-md'
                  }`}
                >
                  {/* Clean Formatted Message Renderer (No raw asterisks!) */}
                  <FormattedMessage text={msg.text} isBot={msg.sender === 'bot'} />

                  {/* Action Button if available */}
                  {msg.actionButton && (
                    <button
                      onClick={() => handleActionClick(msg.actionButton)}
                      className="mt-2.5 w-full flex items-center justify-center gap-1.5 px-3 py-1.5 bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 text-white text-[11px] font-bold rounded-lg transition-all shadow-md active:scale-95 border border-cyan-400/40"
                    >
                      <span>{msg.actionButton.label}</span>
                      <ExternalLink className="w-3.5 h-3.5" />
                    </button>
                  )}

                  {/* Follow-up Question Suggestion Pills */}
                  {msg.followUps && msg.followUps.length > 0 && (
                    <div className="mt-2.5 pt-2 border-t border-slate-800/80 flex flex-wrap gap-1.5">
                      {msg.followUps.map((fu, fIdx) => (
                        <button
                          key={fIdx}
                          onClick={() => handleSendMessage(fu)}
                          className="text-[10px] px-2 py-0.5 rounded-md bg-cyan-950/60 hover:bg-cyan-900 text-cyan-300 border border-cyan-500/30 transition-all flex items-center gap-1 active:scale-95"
                        >
                          <span>{fu}</span>
                          <ChevronRight className="w-2.5 h-2.5 opacity-70" />
                        </button>
                      ))}
                    </div>
                  )}

                  {/* Footer Timestamp & Copy */}
                  <div className="flex items-center justify-between mt-1.5 text-[9px] text-slate-400">
                    <span>{msg.timestamp}</span>
                    {msg.sender === 'bot' && (
                      <button
                        onClick={() => handleCopyText(msg.id, msg.text)}
                        className="opacity-0 group-hover:opacity-100 hover:text-cyan-300 transition-opacity flex items-center gap-0.5 ml-2"
                        title="Copy text"
                      >
                        {copiedId === msg.id ? (
                          <span className="text-emerald-400 flex items-center gap-0.5">
                            <CheckCircle2 className="w-2.5 h-2.5" /> Copied
                          </span>
                        ) : (
                          <span className="flex items-center gap-0.5">
                            <Copy className="w-2.5 h-2.5" /> Copy
                          </span>
                        )}
                      </button>
                    )}
                  </div>
                </div>

                {msg.sender === 'user' && (
                  <div className="w-6 h-6 rounded-full bg-cyan-600/30 border border-cyan-500/40 flex items-center justify-center text-cyan-300 shrink-0 mt-0.5 shadow">
                    <User className="w-3.5 h-3.5" />
                  </div>
                )}
              </div>
            ))}

            {isTyping && (
              <div className="flex gap-2.5 justify-start">
                <SubXBotAvatar size="sm" />
                <div className="bg-[#111625] border border-slate-800 rounded-2xl rounded-bl-none px-3.5 py-2.5 flex items-center gap-1.5 text-slate-400">
                  <span className="w-1.5 h-1.5 bg-cyan-400 rounded-full animate-bounce"></span>
                  <span className="w-1.5 h-1.5 bg-cyan-400 rounded-full animate-bounce [animation-delay:0.2s]"></span>
                  <span className="w-1.5 h-1.5 bg-cyan-400 rounded-full animate-bounce [animation-delay:0.4s]"></span>
                  <span className="text-[10px] text-cyan-400/80 font-medium ml-1">Subxnp bot टाइप गर्दैछ...</span>
                </div>
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>

          {/* Footer Input */}
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleSendMessage();
            }}
            className="p-2.5 bg-slate-950 border-t border-slate-800/90 flex items-center gap-2 shrink-0"
          >
            <input
              type="text"
              value={inputMessage}
              onChange={(e) => setInputMessage(e.target.value)}
              placeholder="सोध्नुहोस् (e.g. Netflix price, ChatGPT, payment)..."
              className="flex-1 bg-slate-900 border border-slate-800 focus:border-cyan-500/80 text-slate-100 placeholder-slate-500 text-xs rounded-xl px-3 py-2.5 outline-none transition-all"
            />
            <button
              type="submit"
              disabled={!inputMessage.trim()}
              className="p-2.5 bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 disabled:opacity-40 text-white rounded-xl transition-all shadow-md active:scale-95 shrink-0"
              title="Send Message"
            >
              <Send className="w-4 h-4" />
            </button>
          </form>

        </div>
      )}
    </>
  );
};

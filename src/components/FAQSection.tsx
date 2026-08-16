import React, { useState } from 'react';
import { ChevronDown, HelpCircle, MessageCircle } from 'lucide-react';
import { DISPLAY_WHATSAPP, WHATSAPP_NUMBER } from '../lib/store';

interface FAQItem {
  question: string;
  answer: string;
}

const FAQS: FAQItem[] = [
  {
    question: "How do I receive my subscription after ordering?",
    answer: "When you place an order on SubX Nepal, your order summary is automatically formatted for WhatsApp. Once you click 'Order via WhatsApp', our support team will verify your details and send your account activation details directly on WhatsApp within 5 to 15 minutes."
  },
  {
    question: "Which payment methods do you accept?",
    answer: "SubX Nepal accepts eSewa, Khalti, Mobile Banking (all Nepalese banks via Fonepay / ConnectIPS), and Binance Pay (Crypto USDT). Payment details are provided directly on WhatsApp upon placing your order."
  },
  {
    question: "Do I need an international dollar card or credit card?",
    answer: "No! SubX Nepal accepts local Nepalese payment options in NPR (eSewa, Khalti, Mobile Banking) as well as Binance Pay (USDT). You do not need any USD or international card."
  },
  {
    question: "How do promo codes & coupon discounts work?",
    answer: "Simply type your promo code (e.g. SUBX10 or NEPAL50) in the product details modal or inside the Cart Checkout drawer and click 'Apply'. The discount will be automatically calculated and reflected in your order summary."
  },
  {
    question: "How does Google Gemini AI Pro or YouTube Premium activation work?",
    answer: "For Gemini AI Pro and YouTube Premium, you can enter your email address during checkout or on WhatsApp. We will send an official activation invite or directly grant premium access to your personal email."
  },
  {
    question: "What is your Account Security & Support Guarantee?",
    answer: "If you encounter any issue or need support with your subscription, our team provides instant technical assistance and secure access resolution on WhatsApp (" + DISPLAY_WHATSAPP + ") at zero extra cost."
  },
  {
    question: "Are these subscriptions 100% genuine and safe?",
    answer: "Yes, 100%. All our subscriptions are legitimately activated and backed by secure access and dedicated customer support."
  }
];

export const FAQSection: React.FC = () => {
  const [openIndex, setOpenIndex] = useState<number | null>(0);

  const toggle = (idx: number) => {
    setOpenIndex(openIndex === idx ? null : idx);
  };

  return (
    <section id="faq" className="py-8 sm:py-12 border-b border-slate-200 dark:border-slate-800/50 transition-colors duration-150">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Title */}
        <div className="text-center">
          <span className="text-xs font-bold text-purple-700 dark:text-purple-400 bg-purple-50 dark:bg-purple-950/80 px-2.5 py-0.5 rounded-full border border-purple-200 dark:border-purple-500/30 uppercase tracking-widest">
            Got Questions?
          </span>
          <h2 className="text-xl sm:text-3xl font-black text-slate-900 dark:text-white mt-2 tracking-tight">
            Frequently Asked Questions
          </h2>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1">
            Everything you need to know about SubX Nepal subscriptions and activation.
          </p>
        </div>

        {/* Accordion List */}
        <div className="mt-10 space-y-3">
          {FAQS.map((faq, idx) => {
            const isOpen = openIndex === idx;
            return (
              <div
                key={idx}
                className="bg-white dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700 rounded-2xl overflow-hidden transition-all shadow-xs"
              >
                <button
                  onClick={() => toggle(idx)}
                  className="w-full text-left p-4 sm:p-5 flex items-center justify-between gap-4 focus:outline-none cursor-pointer"
                >
                  <span className="text-sm sm:text-base font-bold text-slate-900 dark:text-white flex items-center gap-2.5">
                    <HelpCircle className="w-4 h-4 text-cyan-600 dark:text-cyan-400 shrink-0" />
                    {faq.question}
                  </span>
                  <ChevronDown
                    className={`w-5 h-5 text-slate-400 shrink-0 transition-transform duration-300 ${
                      isOpen ? 'rotate-180 text-purple-600 dark:text-purple-400' : ''
                    }`}
                  />
                </button>

                {isOpen && (
                  <div className="px-4 sm:px-5 pb-5 pt-1 text-xs sm:text-sm text-slate-600 dark:text-slate-300 border-t border-slate-100 dark:border-slate-800/50 leading-relaxed animate-fade-in">
                    {faq.answer}
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {/* Still Have Questions Banner */}
        <div className="mt-8 p-5 sm:p-6 rounded-2xl bg-gradient-to-r from-cyan-50 via-purple-50 to-slate-50 dark:from-[#0D1525] dark:via-slate-900 dark:to-[#0B1A1E] border border-cyan-200 dark:border-cyan-500/30 flex flex-col sm:flex-row items-center justify-between gap-4 text-center sm:text-left shadow-md dark:shadow-xl dark:shadow-cyan-950/20">
          <div>
            <h4 className="text-sm sm:text-base font-black text-slate-900 dark:text-white">
              Still have questions or need custom plans?
            </h4>
            <p className="text-xs text-slate-600 dark:text-slate-400 mt-0.5">
              Chat directly with our team on WhatsApp for instant assistance.
            </p>
          </div>
          <a
            href={`https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent('Hello SubX Nepal! I have a question about digital subscriptions.')}`}
            target="_blank"
            rel="noopener noreferrer"
            className="px-4 py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-600 text-white font-extrabold text-xs shadow-lg shadow-emerald-500/30 active:scale-95 transition-all inline-flex items-center gap-1.5 shrink-0"
          >
            <MessageCircle className="w-4 h-4" />
            <span>Chat on WhatsApp</span>
          </a>
        </div>

      </div>
    </section>
  );
};

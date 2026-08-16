import React from 'react';
import { ShieldCheck, Zap, RefreshCw, Headphones } from 'lucide-react';
import { SiteSettings } from '../types';

interface WhyChooseSubXProps {
  siteSettings?: SiteSettings;
}

export const WhyChooseSubX: React.FC<WhyChooseSubXProps> = ({ siteSettings }) => {
  const siteName = siteSettings?.siteName || 'SubX Nepal';

  const reasons = [
    {
      id: 'secure',
      title: 'Secure & Safe',
      description: '100% genuine & verified subscriptions with safe payment handling for your peace of mind.',
      icon: ShieldCheck,
      iconBg: 'bg-emerald-500 text-white shadow-md shadow-emerald-500/20',
    },
    {
      id: 'fast-delivery',
      title: 'Fast Delivery',
      description: 'Get your premium account activation and login credentials delivered within minutes.',
      icon: Zap,
      iconBg: 'bg-blue-500 text-white shadow-md shadow-blue-500/20',
    },
    {
      id: 'replacement-policy',
      title: 'Replacement Policy',
      description: 'Full warranty guarantee: if you face any problem during your subscription duration, an instant replacement will be provided.',
      icon: RefreshCw,
      iconBg: 'bg-purple-500 text-white shadow-md shadow-purple-500/20',
    },
    {
      id: 'support',
      title: '24/7 Support',
      description: 'Our dedicated customer support team is always ready to assist you on WhatsApp.',
      icon: Headphones,
      iconBg: 'bg-amber-500 text-white shadow-md shadow-amber-500/20',
    },
  ];

  return (
    <section id="why-choose" className="py-8 sm:py-12 border-b border-slate-200 dark:border-slate-800/50 transition-colors duration-150">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Section Header */}
        <div className="text-center mb-7 sm:mb-9">
          <h2 className="text-2xl sm:text-3xl lg:text-4xl font-black text-slate-900 dark:text-white tracking-tight">
            Why <span className="text-cyan-500 dark:text-cyan-400">{siteName}</span>?
          </h2>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-2 max-w-lg mx-auto leading-relaxed font-medium">
            We deliver premium digital subscriptions powered by trust, lightning-fast activation, and unmatched reliability.
          </p>
        </div>

        {/* Feature Cards Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 sm:gap-4">
          {reasons.map((item) => {
            const Icon = item.icon;
            return (
              <div
                key={item.id}
                className="bg-white dark:bg-[#0B101E] border border-slate-200/90 dark:border-slate-800/90 hover:border-slate-300 dark:hover:border-slate-700 rounded-2xl sm:rounded-3xl p-4 sm:p-5 transition-all duration-200 shadow-xs hover:shadow-md flex items-start gap-3.5 sm:gap-4"
              >
                {/* Vibrant Icon Box */}
                <div className={`w-11 h-11 sm:w-12 sm:h-12 rounded-2xl flex items-center justify-center shrink-0 ${item.iconBg}`}>
                  <Icon className="w-5 h-5 sm:w-6 sm:h-6" />
                </div>

                {/* Text Content */}
                <div className="flex-1 min-w-0 pt-0.5">
                  <h3 className="text-sm sm:text-base font-bold text-slate-900 dark:text-white tracking-tight">
                    {item.title}
                  </h3>
                  <p className="text-xs sm:text-[13px] text-slate-500 dark:text-slate-400 mt-1 leading-relaxed">
                    {item.description}
                  </p>
                </div>
              </div>
            );
          })}
        </div>

      </div>
    </section>
  );
};

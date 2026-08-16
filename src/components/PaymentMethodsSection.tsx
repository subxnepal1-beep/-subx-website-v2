import React from 'react';
import { ShieldCheck, CheckCircle2 } from 'lucide-react';

export const PaymentMethodsSection: React.FC = () => {
  const paymentMethods = [
    {
      id: 'esewa',
      name: 'Esewa',
      category: 'Digital Wallet',
      description: 'Instant transfer with 0% extra charges',
    },
    {
      id: 'khalti',
      name: 'Khalti',
      category: 'Digital Wallet',
      description: 'Quick wallet payment & fast verification',
    },
    {
      id: 'all-bank',
      name: 'All Bank',
      category: 'Mobile Banking',
      description: 'All Nepal commercial banks & Fonepay QR',
    },
    {
      id: 'binance',
      name: 'Binance',
      category: 'Global Crypto',
      description: 'USDT (TRC20 / BEP20) zero fee transfer',
    },
  ];

  return (
    <section id="payments" className="py-7 sm:py-10 border-b border-slate-200 dark:border-slate-800/60 transition-colors duration-150">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Sleek Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-5 mb-5 border-b border-slate-200 dark:border-slate-800/70">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-xl bg-emerald-50 dark:bg-emerald-500/10 border border-emerald-300 dark:border-emerald-500/30 flex items-center justify-center text-emerald-600 dark:text-emerald-400 shrink-0">
              <ShieldCheck className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-base sm:text-lg font-black text-slate-900 dark:text-white tracking-tight">
                Accepted Payment Methods
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                Pay safely in NPR or USDT with zero extra fee upon WhatsApp checkout
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 text-xs font-bold text-emerald-700 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-200 dark:border-emerald-500/30 px-3 py-1.5 rounded-xl self-start sm:self-auto">
            <CheckCircle2 className="w-3.5 h-3.5" />
            <span>0% Extra Charges • Direct QR Scan</span>
          </div>
        </div>

        {/* 4 Professional Clean Text Cards (Without Logos) */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
          {paymentMethods.map((method) => (
            <div
              key={method.id}
              className="bg-white dark:bg-[#0B0F19] border border-slate-200/90 dark:border-slate-800/90 rounded-2xl p-4 sm:p-5 transition-all duration-200 shadow-xs hover:shadow-md hover:border-slate-300 dark:hover:border-slate-700 flex flex-col justify-between"
            >
              <div>
                {/* Method Name & Category Badge */}
                <div className="flex items-center justify-between gap-2 mb-2">
                  <h3 className="text-base font-black text-slate-900 dark:text-white tracking-tight">
                    {method.name}
                  </h3>
                  <span className="text-[10px] font-extrabold uppercase tracking-wider text-cyan-700 dark:text-cyan-300 bg-cyan-50 dark:bg-cyan-950/70 border border-cyan-200 dark:border-cyan-500/30 px-2 py-0.5 rounded-md">
                    {method.category}
                  </span>
                </div>

                {/* Clear Description Text */}
                <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed font-normal">
                  {method.description}
                </p>
              </div>

              {/* Status Indicator */}
              <div className="mt-4 pt-2.5 border-t border-slate-100 dark:border-slate-800/60 flex items-center justify-between text-[11px]">
                <span className="text-slate-400 dark:text-slate-500 font-medium">Availability</span>
                <span className="font-bold text-emerald-600 dark:text-emerald-400 flex items-center gap-1.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                  Instant Activation
                </span>
              </div>
            </div>
          ))}
        </div>

      </div>
    </section>
  );
};

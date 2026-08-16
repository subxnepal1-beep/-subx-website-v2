import React from 'react';
import { ShoppingBag, CreditCard, Zap, CheckCircle2, ShieldCheck, Clock } from 'lucide-react';

export const HowItWorksSection: React.FC = () => {
  const steps = [
    {
      step: '01',
      title: 'Choose Subscription',
      desc: 'Select your preferred subscription (Netflix, ChatGPT, YouTube, CapCut, etc.) and pick your plan duration.',
      icon: ShoppingBag,
      color: 'from-purple-500/20 to-indigo-500/20 text-purple-400 border-purple-500/30'
    },
    {
      step: '02',
      title: 'Easy Local Payment',
      desc: 'Pay easily using eSewa, Khalti, Mobile Banking (Fonepay/IPS), or Binance Pay in NPR with zero extra fee.',
      icon: CreditCard,
      color: 'from-emerald-500/20 to-teal-500/20 text-emerald-400 border-emerald-500/30'
    },
    {
      step: '03',
      title: 'Instant Delivery (5-15 Min)',
      desc: 'Receive your verified credentials or private email activation invite directly on WhatsApp with full guarantee.',
      icon: Zap,
      color: 'from-cyan-500/20 to-blue-500/20 text-cyan-400 border-cyan-500/30'
    }
  ];

  return (
    <section className="py-12 sm:py-16 border-b border-slate-800/60 bg-[#080C16]/60">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto">
          <div className="inline-flex items-center gap-1.5 text-xs font-bold text-cyan-400 bg-cyan-950/80 px-3 py-1 rounded-full border border-cyan-500/30 uppercase tracking-widest">
            <Clock className="w-3.5 h-3.5 text-cyan-400" />
            <span>Fast & Simple 3-Step Process</span>
          </div>
          <h2 className="text-2xl sm:text-4xl font-black text-white mt-2.5 tracking-tight">
            How It Works
          </h2>
          <p className="text-xs sm:text-sm text-slate-300 mt-1.5 leading-relaxed">
            Get your favorite digital subscriptions activated seamlessly in 3 quick steps.
          </p>
        </div>

        {/* 3 Step Cards */}
        <div className="mt-10 grid grid-cols-1 md:grid-cols-3 gap-6 relative">
          {steps.map((item, idx) => {
            const Icon = item.icon;
            return (
              <div
                key={idx}
                className="relative bg-slate-900/70 border border-slate-800/90 hover:border-slate-700 rounded-2xl p-6 flex flex-col justify-between transition-all duration-300 hover:shadow-xl hover:shadow-cyan-950/20 group"
              >
                {/* Step Number Top Badge */}
                <div className="flex items-center justify-between mb-5">
                  <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${item.color} border flex items-center justify-center shadow-inner group-hover:scale-105 transition-transform`}>
                    <Icon className="w-6 h-6" />
                  </div>
                  <span className="text-2xl font-black text-slate-700/80 font-mono group-hover:text-slate-500 transition-colors">
                    {item.step}
                  </span>
                </div>

                <div className="space-y-2">
                  <h3 className="text-lg font-bold text-white group-hover:text-cyan-300 transition-colors">
                    {item.title}
                  </h3>
                  <p className="text-xs text-slate-400 leading-relaxed font-normal">
                    {item.desc}
                  </p>
                </div>

                <div className="mt-5 pt-3 border-t border-slate-800/60 flex items-center gap-1.5 text-[11px] font-semibold text-emerald-400">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                  <span>100% Guaranteed Activation</span>
                </div>
              </div>
            );
          })}
        </div>

      </div>
    </section>
  );
};

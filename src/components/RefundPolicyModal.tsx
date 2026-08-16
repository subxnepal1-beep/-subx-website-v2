import React from 'react';
import { ShieldCheck, CheckCircle2, X, MessageCircle } from 'lucide-react';
import { DISPLAY_WHATSAPP, WHATSAPP_NUMBER } from '../lib/store';

interface RefundPolicyModalProps {
  isOpen: boolean;
  onClose: () => void;
  whatsappNumber?: string;
}

export const RefundPolicyModal: React.FC<RefundPolicyModalProps> = ({
  isOpen,
  onClose,
  whatsappNumber
}) => {
  if (!isOpen) return null;

  const phone = whatsappNumber || WHATSAPP_NUMBER;

  return (
    <div
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fade-in"
    >
      <div className="relative w-full max-w-md bg-[#0B0F19] border border-slate-800 rounded-2xl overflow-hidden shadow-2xl p-6 space-y-5">
        
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-1.5 bg-slate-900 hover:bg-slate-800 text-slate-400 hover:text-white rounded-full transition-all border border-slate-800 active:scale-95"
          title="Close"
        >
          <X className="w-4 h-4" />
        </button>

        {/* Icon & Title */}
        <div className="flex items-center gap-3 pr-8">
          <div className="p-2.5 bg-emerald-950/80 text-emerald-400 border border-emerald-800/50 rounded-xl shrink-0">
            <ShieldCheck className="w-6 h-6" />
          </div>
          <div>
            <h2 className="text-base font-bold text-white tracking-tight">
              Secure Access & Support Guarantee
            </h2>
            <p className="text-xs text-emerald-400 font-medium">100% Protection & Instant Help</p>
          </div>
        </div>

        {/* Simple & Clean Statement */}
        <div className="p-4 rounded-xl bg-slate-900/90 border border-slate-800 text-slate-200 text-xs sm:text-sm leading-relaxed space-y-3">
          <div className="flex items-start gap-2.5">
            <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0 mt-0.5" />
            <p>
              If you experience any problem with your subscription during the validity period, we will provide you a <strong>full replacement account or instant fix</strong>.
            </p>
          </div>
        </div>

        {/* Simple Note */}
        <p className="text-xs text-slate-400 leading-normal">
          For quick support or replacement claims, reach out directly with your Order ID on WhatsApp.
        </p>

        {/* Action Button */}
        <div className="pt-2 flex items-center gap-3">
          <a
            href={`https://wa.me/${phone}?text=${encodeURIComponent('Hello SubX Nepal! I have an issue with my subscription duration and need a replacement.')}`}
            target="_blank"
            rel="noopener noreferrer"
            className="w-full flex items-center justify-center gap-2 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold py-3 px-4 rounded-xl shadow-lg transition-all active:scale-95"
          >
            <MessageCircle className="w-4 h-4" />
            <span>Claim Replacement on WhatsApp</span>
          </a>
        </div>

      </div>
    </div>
  );
};

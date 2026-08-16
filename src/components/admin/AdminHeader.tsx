import React from 'react';
import { Lock, LogOut, X, RefreshCw, CheckCircle2, AlertTriangle } from 'lucide-react';
import { isSupabaseConfigured } from '../../lib/supabase';

interface AdminHeaderProps {
  isAuthenticated: boolean;
  currentUserEmail: string | null;
  onLogout: () => void;
  onClose: () => void;
}

export const AdminHeader: React.FC<AdminHeaderProps> = ({
  isAuthenticated,
  currentUserEmail,
  onLogout,
  onClose,
}) => {
  return (
    <div className="p-4 sm:p-5 bg-[#07090E] border-b border-slate-800 flex items-center justify-between gap-3 shrink-0">
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-xl bg-purple-950/80 border border-purple-500/40 flex items-center justify-center text-purple-400 shrink-0 shadow-inner">
          <Lock className="w-5 h-5" />
        </div>
        <div>
          <div className="flex items-center gap-2 flex-wrap">
            <h2 className="text-base sm:text-lg font-black text-white tracking-tight">
              SubX Nepal Admin Control
            </h2>
            {isAuthenticated && (
              <span className="text-[10px] bg-emerald-950/90 text-emerald-300 font-extrabold px-2.5 py-0.5 rounded-full border border-emerald-500/40 flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                <span>OWNER AUTHENTICATED</span>
              </span>
            )}
          </div>
          <div className="flex items-center gap-3 text-xs text-slate-400 mt-0.5">
            <span>Product Catalog, Realtime Orders & Database Control</span>
            {isSupabaseConfigured ? (
              <span className="hidden sm:inline-flex items-center gap-1 text-[11px] text-emerald-400 font-semibold">
                <CheckCircle2 className="w-3 h-3 text-emerald-400" />
                Supabase Cloud Live
              </span>
            ) : (
              <span className="hidden sm:inline-flex items-center gap-1 text-[11px] text-amber-400 font-semibold">
                <AlertTriangle className="w-3 h-3 text-amber-400" />
                Local Storage Mode
              </span>
            )}
          </div>
        </div>
      </div>

      <div className="flex items-center gap-2 shrink-0">
        {isAuthenticated && (
          <button
            type="button"
            onClick={onLogout}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-900 hover:bg-slate-800 text-slate-300 hover:text-white rounded-xl border border-slate-700 text-xs font-semibold transition-all cursor-pointer"
            title="Sign out of admin panel"
          >
            <LogOut className="w-3.5 h-3.5 text-rose-400" />
            <span className="hidden sm:inline">Logout</span>
          </button>
        )}
        <button
          type="button"
          onClick={onClose}
          className="p-2 text-slate-400 hover:text-white hover:bg-slate-800 rounded-xl transition-all cursor-pointer"
          title="Close Admin Panel"
        >
          <X className="w-5 h-5" />
        </button>
      </div>
    </div>
  );
};

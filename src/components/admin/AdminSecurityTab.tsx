import React, { useState } from 'react';
import { 
  ShieldCheck, 
  Lock, 
  Eye, 
  EyeOff, 
  CheckCircle2, 
  RefreshCw, 
  UserCheck, 
  ShieldAlert, 
  Fingerprint
} from 'lucide-react';
import { supabase, isSupabaseConfigured } from '../../lib/supabase';
import { SiteSettings } from '../../types';

interface AdminSecurityTabProps {
  currentUserEmail: string | null;
  onLogout: () => void;
  siteSettings?: SiteSettings;
  onUpdateSiteSettings?: (settings: Partial<SiteSettings>) => Promise<void> | void;
}

export const AdminSecurityTab: React.FC<AdminSecurityTabProps> = ({
  currentUserEmail,
  onLogout
}) => {
  // Password Change State
  const [newPassword, setNewPassword] = useState<string>('');
  const [confirmPassword, setConfirmPassword] = useState<string>('');
  const [showNewPassword, setShowNewPassword] = useState<boolean>(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState<boolean>(false);
  const [loadingPassword, setLoadingPassword] = useState<boolean>(false);
  const [passwordError, setPasswordError] = useState<string | null>(null);
  const [passwordSuccess, setPasswordSuccess] = useState<string | null>(null);

  // Handle Admin Password Update
  const handleUpdatePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setPasswordError(null);
    setPasswordSuccess(null);

    const pass = newPassword.trim();
    const confirm = confirmPassword.trim();

    if (!pass) {
      setPasswordError('Please enter a new password.');
      return;
    }

    if (pass.length < 6) {
      setPasswordError('Password must be at least 6 characters long for security.');
      return;
    }

    if (pass !== confirm) {
      setPasswordError('Passwords do not match. Please re-type carefully.');
      return;
    }

    if (!isSupabaseConfigured || !supabase) {
      setPasswordError('Database connection is not active.');
      return;
    }

    setLoadingPassword(true);

    try {
      // Direct update via Supabase Auth API
      const { error } = await supabase.auth.updateUser({
        password: pass
      });

      if (error) {
        throw error;
      }

      setPasswordSuccess('Admin password has been successfully updated! Next login will require this new password.');
      setNewPassword('');
      setConfirmPassword('');
    } catch (err: any) {
      console.error('Password update error:', err);
      setPasswordError(err?.message || 'Failed to update password.');
    } finally {
      setLoadingPassword(false);
    }
  };

  return (
    <div className="p-4 sm:p-8 max-w-4xl mx-auto space-y-6 text-white animate-in fade-in">
      
      {/* Header Banner */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-slate-900 via-purple-950/40 to-slate-900 border border-purple-500/30 p-5 sm:p-6 shadow-xl">
        <div className="absolute top-0 right-0 w-64 h-64 bg-purple-600/10 rounded-full blur-3xl pointer-events-none" />
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 relative z-10">
          <div className="flex items-center gap-3.5">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-purple-500/20 to-indigo-600/20 border border-purple-500/40 flex items-center justify-center text-purple-400 shrink-0 shadow-inner">
              <ShieldCheck className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-extrabold px-2 py-0.5 rounded-full bg-purple-500/20 border border-purple-500/30 text-purple-300 uppercase tracking-widest">
                  Admin Protection
                </span>
                <span className="text-[10px] font-extrabold px-2 py-0.5 rounded-full bg-emerald-500/20 border border-emerald-500/30 text-emerald-300 uppercase tracking-widest flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                  Active
                </span>
              </div>
              <h2 className="text-lg sm:text-xl font-black text-white tracking-tight mt-1">
                Admin Password & Security Settings
              </h2>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={onLogout}
              className="px-4 py-2 bg-slate-900 hover:bg-slate-800 border border-slate-700 hover:border-rose-500/50 text-slate-300 hover:text-rose-300 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-2"
            >
              <Lock className="w-3.5 h-3.5" />
              <span>Sign Out Session</span>
            </button>
          </div>
        </div>
      </div>

      {/* Grid: Session Info & Security Controls */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
        
        {/* Left: Active Session Card */}
        <div className="md:col-span-5 space-y-4">
          <div className="p-5 sm:p-6 bg-slate-900/80 border border-slate-800 rounded-3xl space-y-4 shadow-lg">
            <div className="flex items-center gap-2.5 text-xs font-bold text-slate-200 border-b border-slate-800 pb-3">
              <UserCheck className="w-4 h-4 text-purple-400" />
              <span>Current Session Details</span>
            </div>

            <div className="space-y-3 text-xs">
              <div>
                <label className="text-[11px] font-medium text-slate-400">Authenticated Admin Email:</label>
                <div className="mt-1 px-3.5 py-2.5 rounded-xl bg-slate-950/80 border border-slate-800 font-mono text-purple-300 font-bold break-all flex items-center gap-2">
                  <Fingerprint className="w-4 h-4 text-purple-400 shrink-0" />
                  <span>{currentUserEmail || 'Authorized Administrator'}</span>
                </div>
              </div>

              <div>
                <label className="text-[11px] font-medium text-slate-400">Security Protection:</label>
                <div className="mt-1 px-3.5 py-2.5 rounded-xl bg-emerald-950/40 border border-emerald-500/30 text-emerald-300 font-bold flex items-center gap-2">
                  <ShieldCheck className="w-4 h-4 text-emerald-400 shrink-0" />
                  <span>24/7 Protected & Encrypted</span>
                </div>
              </div>
            </div>

            <div className="p-3 bg-purple-950/30 border border-purple-500/20 rounded-2xl text-[11px] text-purple-300/90 leading-relaxed">
              🔒 <strong>Security Policy:</strong> You can update your Admin Password at any time. Changes take effect immediately.
            </div>
          </div>
        </div>

        {/* Right: Security Settings Forms */}
        <div className="md:col-span-7 space-y-6">
          
          {/* UPDATE ADMIN PASSWORD FORM */}
          <div className="p-5 sm:p-7 bg-slate-900/90 border border-slate-800 rounded-3xl shadow-xl">
            <div className="flex items-center gap-2.5 text-sm font-bold text-white border-b border-slate-800 pb-3 mb-5">
              <Lock className="w-4 h-4 text-purple-400" />
              <span>Change Admin Password</span>
            </div>

            {/* Alerts */}
            {passwordError && (
              <div className="mb-4 p-3.5 bg-red-950/80 border border-red-500/50 rounded-2xl text-xs text-red-300 flex items-start gap-2.5 animate-in fade-in">
                <ShieldAlert className="w-4 h-4 text-red-400 shrink-0 mt-0.5" />
                <span>{passwordError}</span>
              </div>
            )}

            {passwordSuccess && (
              <div className="mb-4 p-3.5 bg-emerald-950/80 border border-emerald-500/50 rounded-2xl text-xs text-emerald-300 flex items-start gap-2.5 animate-in fade-in">
                <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                <span>{passwordSuccess}</span>
              </div>
            )}

            <form onSubmit={handleUpdatePassword} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {/* Field: New Password */}
                <div>
                  <label className="block text-xs font-bold text-slate-300 mb-1.5">
                    New Password <span className="text-purple-400">*</span>
                  </label>
                  <div className="relative">
                    <Lock className="w-4 h-4 text-slate-500 absolute left-3.5 top-3.5" />
                    <input
                      type={showNewPassword ? 'text' : 'password'}
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                      placeholder="Enter new password"
                      className="w-full bg-slate-950/90 border border-slate-800 focus:border-purple-500 rounded-xl pl-10 pr-10 py-2.5 text-xs text-white placeholder-slate-500 focus:outline-none transition-colors"
                      required
                      minLength={6}
                    />
                    <button
                      type="button"
                      onClick={() => setShowNewPassword(!showNewPassword)}
                      className="absolute right-3.5 top-3 text-slate-500 hover:text-slate-300 transition-colors cursor-pointer"
                    >
                      {showNewPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

                {/* Field: Confirm Password */}
                <div>
                  <label className="block text-xs font-bold text-slate-300 mb-1.5">
                    Confirm New Password <span className="text-purple-400">*</span>
                  </label>
                  <div className="relative">
                    <Lock className="w-4 h-4 text-slate-500 absolute left-3.5 top-3.5" />
                    <input
                      type={showConfirmPassword ? 'text' : 'password'}
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      placeholder="Re-enter to confirm"
                      className="w-full bg-slate-950/90 border border-slate-800 focus:border-purple-500 rounded-xl pl-10 pr-10 py-2.5 text-xs text-white placeholder-slate-500 focus:outline-none transition-colors"
                      required
                      minLength={6}
                    />
                    <button
                      type="button"
                      onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                      className="absolute right-3.5 top-3 text-slate-500 hover:text-slate-300 transition-colors cursor-pointer"
                    >
                      {showConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>
              </div>

              {/* Save Button */}
              <button
                type="submit"
                disabled={loadingPassword || !newPassword || !confirmPassword}
                className="w-full py-2.5 px-4 rounded-xl bg-gradient-to-r from-purple-600 via-indigo-600 to-blue-600 hover:from-purple-500 hover:to-blue-500 text-white font-bold text-xs shadow-md shadow-purple-950/50 transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50 active:scale-[0.99]"
              >
                {loadingPassword ? (
                  <>
                    <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                    <span>Updating Password...</span>
                  </>
                ) : (
                  <>
                    <Lock className="w-3.5 h-3.5" />
                    <span>Save & Update Password</span>
                  </>
                )}
              </button>
            </form>
          </div>

        </div>

      </div>
    </div>
  );
};

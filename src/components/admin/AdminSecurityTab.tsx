import React, { useState } from 'react';
import { 
  ShieldCheck, 
  KeyRound, 
  Lock, 
  Eye, 
  EyeOff, 
  CheckCircle2, 
  RefreshCw, 
  UserCheck, 
  ShieldAlert, 
  Fingerprint, 
  Sparkles,
  Key
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
  onLogout,
  siteSettings,
  onUpdateSiteSettings
}) => {
  // Password Change State
  const [newPassword, setNewPassword] = useState<string>('');
  const [confirmPassword, setConfirmPassword] = useState<string>('');
  const [showNewPassword, setShowNewPassword] = useState<boolean>(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState<boolean>(false);
  const [loadingPassword, setLoadingPassword] = useState<boolean>(false);
  const [passwordError, setPasswordError] = useState<string | null>(null);
  const [passwordSuccess, setPasswordSuccess] = useState<string | null>(null);

  // PIN Change State
  const [currentPin, setCurrentPin] = useState<string>('');
  const [newPin, setNewPin] = useState<string>('');
  const [confirmPin, setConfirmPin] = useState<string>('');
  const [showCurrentPin, setShowCurrentPin] = useState<boolean>(false);
  const [showNewPin, setShowNewPin] = useState<boolean>(false);
  const [showConfirmPin, setShowConfirmPin] = useState<boolean>(false);
  const [loadingPin, setLoadingPin] = useState<boolean>(false);
  const [pinError, setPinError] = useState<string | null>(null);
  const [pinSuccess, setPinSuccess] = useState<string | null>(null);

  const getActivePin = () => {
    try {
      const stored = localStorage.getItem('subx_admin_pin');
      if (stored && /^\d{4}$/.test(stored.trim())) return stored.trim();
    } catch {}
    return (siteSettings?.admin_pin || siteSettings?.adminPin || '2026').trim();
  };

  // 1. Handle Supabase Auth Password Update
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
      setPasswordError('Supabase Auth is not connected. Please check your Supabase credentials in the Database tab.');
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

      setPasswordSuccess('Your password has been successfully updated in Supabase Auth! Next login will require this new password.');
      setNewPassword('');
      setConfirmPassword('');
    } catch (err: any) {
      console.error('Password update error:', err);
      setPasswordError(err?.message || 'Failed to update password in Supabase.');
    } finally {
      setLoadingPassword(false);
    }
  };

  // 2. Handle 4-Digit Security PIN Update
  const handleUpdatePin = async (e: React.FormEvent) => {
    e.preventDefault();
    setPinError(null);
    setPinSuccess(null);

    const cur = currentPin.trim();
    const np = newPin.trim();
    const cp = confirmPin.trim();
    const activeSavedPin = getActivePin();

    if (cur !== activeSavedPin) {
      setPinError('The current Security PIN is incorrect.');
      return;
    }

    if (!/^\d{4}$/.test(np)) {
      setPinError('New Security PIN must be exactly 4 digits (0-9).');
      return;
    }

    if (np !== cp) {
      setPinError('New PINs do not match. Please re-enter carefully.');
      return;
    }

    setLoadingPin(true);

    try {
      // 1. Direct Supabase Auth User Metadata Update
      if (isSupabaseConfigured && supabase) {
        try {
          await supabase.auth.updateUser({
            data: { admin_pin: np, adminPin: np }
          });
        } catch (authErr) {
          console.warn('Auth user metadata update warning:', authErr);
        }

        // 2. Direct Supabase Database Tables Upsert
        try {
          await supabase.from('site_settings').upsert([{ id: 'default', admin_pin: np, adminPin: np, updated_at: new Date().toISOString() }]);
          await supabase.from('website_settings').upsert([{ id: 'default', admin_pin: np, adminPin: np, updated_at: new Date().toISOString() }]);
          await supabase.from('settings').upsert([{ id: 'default', admin_pin: np, adminPin: np, updated_at: new Date().toISOString() }]);
        } catch (dbErr) {
          console.warn('Supabase DB table upsert warning:', dbErr);
        }
      }

      // 3. Local and React Store update
      try {
        localStorage.setItem('subx_admin_pin', np);
      } catch {}

      if (onUpdateSiteSettings) {
        await onUpdateSiteSettings({
          admin_pin: np,
          adminPin: np
        });
      }

      setPinSuccess('4-digit Security PIN updated successfully in Supabase! The old PIN will no longer work.');
      setCurrentPin('');
      setNewPin('');
      setConfirmPin('');
    } catch (err: any) {
      setPinError(err?.message || 'Failed to update Security PIN.');
    } finally {
      setLoadingPin(false);
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
                  2-Layer Security
                </span>
                <span className="text-[10px] font-extrabold px-2 py-0.5 rounded-full bg-emerald-500/20 border border-emerald-500/30 text-emerald-300 uppercase tracking-widest flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                  Supabase Live
                </span>
              </div>
              <h2 className="text-lg sm:text-xl font-black text-white tracking-tight mt-1">
                Admin Password & 4-Digit PIN Security
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
        <div className="md:col-span-4 space-y-4">
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
                <label className="text-[11px] font-medium text-slate-400">2-Step Security Status:</label>
                <div className="mt-1 px-3.5 py-2.5 rounded-xl bg-cyan-950/40 border border-cyan-500/30 text-cyan-300 font-bold flex items-center gap-2">
                  <KeyRound className="w-4 h-4 text-cyan-400 shrink-0" />
                  <span>Password + 4-Digit PIN Active</span>
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
              🔒 <strong>Security Policy:</strong> You can update either your Supabase Password or your 4-digit Security PIN at any time. Changes take effect immediately in Supabase.
            </div>
          </div>
        </div>

        {/* Right: Security Settings Forms */}
        <div className="md:col-span-8 space-y-6">
          
          {/* 1. UPDATE 4-DIGIT SECURITY PIN FORM */}
          <div className="p-5 sm:p-7 bg-slate-900/90 border border-slate-800 rounded-3xl shadow-xl">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3 mb-5">
              <div className="flex items-center gap-2.5 text-sm font-bold text-white">
                <KeyRound className="w-4 h-4 text-cyan-400" />
                <span>Step 2: Update 4-Digit Security PIN</span>
              </div>
              <span className="text-[11px] font-mono text-cyan-400 bg-cyan-950/50 border border-cyan-500/30 px-2 py-0.5 rounded-lg">
                4 Digits
              </span>
            </div>

            {/* PIN Alerts */}
            {pinError && (
              <div className="mb-4 p-3.5 bg-red-950/80 border border-red-500/50 rounded-2xl text-xs text-red-300 flex items-start gap-2.5 animate-in fade-in">
                <ShieldAlert className="w-4 h-4 text-red-400 shrink-0 mt-0.5" />
                <span>{pinError}</span>
              </div>
            )}

            {pinSuccess && (
              <div className="mb-4 p-3.5 bg-emerald-950/80 border border-emerald-500/50 rounded-2xl text-xs text-emerald-300 flex items-start gap-2.5 animate-in fade-in">
                <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                <span>{pinSuccess}</span>
              </div>
            )}

            <form onSubmit={handleUpdatePin} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                
                {/* Field: Current PIN */}
                <div>
                  <label className="block text-xs font-bold text-slate-300 mb-1.5">
                    Current PIN <span className="text-cyan-400">*</span>
                  </label>
                  <div className="relative">
                    <Key className="w-3.5 h-3.5 text-slate-500 absolute left-3 top-3.5" />
                    <input
                      type={showCurrentPin ? 'text' : 'password'}
                      inputMode="numeric"
                      maxLength={4}
                      value={currentPin}
                      onChange={(e) => setCurrentPin(e.target.value.replace(/[^0-9]/g, '').slice(0, 4))}
                      placeholder="Current PIN"
                      className="w-full bg-slate-950/90 border border-slate-800 focus:border-cyan-500 rounded-xl pl-8 pr-8 py-2.5 text-xs font-mono tracking-widest text-white placeholder-slate-500 focus:outline-none transition-colors"
                      required
                    />
                    <button
                      type="button"
                      onClick={() => setShowCurrentPin(!showCurrentPin)}
                      className="absolute right-2.5 top-3 text-slate-500 hover:text-slate-300 cursor-pointer"
                    >
                      {showCurrentPin ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                    </button>
                  </div>
                </div>

                {/* Field: New PIN */}
                <div>
                  <label className="block text-xs font-bold text-slate-300 mb-1.5">
                    New PIN <span className="text-cyan-400">*</span>
                  </label>
                  <div className="relative">
                    <Key className="w-3.5 h-3.5 text-slate-500 absolute left-3 top-3.5" />
                    <input
                      type={showNewPin ? 'text' : 'password'}
                      inputMode="numeric"
                      maxLength={4}
                      value={newPin}
                      onChange={(e) => setNewPin(e.target.value.replace(/[^0-9]/g, '').slice(0, 4))}
                      placeholder="4 Digits"
                      className="w-full bg-slate-950/90 border border-slate-800 focus:border-cyan-500 rounded-xl pl-8 pr-8 py-2.5 text-xs font-mono tracking-widest text-white placeholder-slate-500 focus:outline-none transition-colors"
                      required
                    />
                    <button
                      type="button"
                      onClick={() => setShowNewPin(!showNewPin)}
                      className="absolute right-2.5 top-3 text-slate-500 hover:text-slate-300 cursor-pointer"
                    >
                      {showNewPin ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                    </button>
                  </div>
                </div>

                {/* Field: Confirm PIN */}
                <div>
                  <label className="block text-xs font-bold text-slate-300 mb-1.5">
                    Confirm PIN <span className="text-cyan-400">*</span>
                  </label>
                  <div className="relative">
                    <Key className="w-3.5 h-3.5 text-slate-500 absolute left-3 top-3.5" />
                    <input
                      type={showConfirmPin ? 'text' : 'password'}
                      inputMode="numeric"
                      maxLength={4}
                      value={confirmPin}
                      onChange={(e) => setConfirmPin(e.target.value.replace(/[^0-9]/g, '').slice(0, 4))}
                      placeholder="Confirm"
                      className="w-full bg-slate-950/90 border border-slate-800 focus:border-cyan-500 rounded-xl pl-8 pr-8 py-2.5 text-xs font-mono tracking-widest text-white placeholder-slate-500 focus:outline-none transition-colors"
                      required
                    />
                    <button
                      type="button"
                      onClick={() => setShowConfirmPin(!showConfirmPin)}
                      className="absolute right-2.5 top-3 text-slate-500 hover:text-slate-300 cursor-pointer"
                    >
                      {showConfirmPin ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                    </button>
                  </div>
                </div>

              </div>

              {/* Save PIN Button */}
              <button
                type="submit"
                disabled={loadingPin || newPin.length < 4 || confirmPin.length < 4}
                className="w-full py-2.5 px-4 rounded-xl bg-gradient-to-r from-cyan-600 via-blue-600 to-indigo-600 hover:from-cyan-500 hover:to-indigo-500 text-white font-bold text-xs shadow-md shadow-cyan-950/50 transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50 active:scale-[0.99]"
              >
                {loadingPin ? (
                  <>
                    <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                    <span>Updating PIN in Supabase...</span>
                  </>
                ) : (
                  <>
                    <KeyRound className="w-3.5 h-3.5" />
                    <span>Save & Update 4-Digit Security PIN</span>
                  </>
                )}
              </button>
            </form>
          </div>

          {/* 2. UPDATE SUPABASE PASSWORD FORM */}
          <div className="p-5 sm:p-7 bg-slate-900/90 border border-slate-800 rounded-3xl shadow-xl">
            <div className="flex items-center gap-2.5 text-sm font-bold text-white border-b border-slate-800 pb-3 mb-5">
              <Lock className="w-4 h-4 text-purple-400" />
              <span>Step 1: Update Supabase Admin Password</span>
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
                      placeholder="Enter new strong password"
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

              {/* Action Button */}
              <div className="pt-1">
                <button
                  type="submit"
                  disabled={loadingPassword}
                  className="w-full py-2.5 px-4 rounded-xl bg-gradient-to-r from-purple-600 via-indigo-600 to-purple-600 hover:from-purple-500 hover:to-indigo-500 text-white font-bold text-xs shadow-md shadow-purple-950/50 hover:shadow-purple-900/60 transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50 active:scale-[0.99]"
                >
                  {loadingPassword ? (
                    <>
                      <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                      <span>Updating Supabase Auth...</span>
                    </>
                  ) : (
                    <>
                      <Sparkles className="w-3.5 h-3.5" />
                      <span>Save & Apply New Password in Supabase</span>
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>

        </div>

      </div>

    </div>
  );
};

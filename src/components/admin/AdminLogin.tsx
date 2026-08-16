import React, { useState, useEffect } from 'react';
import { 
  Mail, 
  Lock, 
  Eye, 
  EyeOff, 
  ShieldCheck, 
  ShieldAlert, 
  RefreshCw,
  Clock,
  AlertOctagon
} from 'lucide-react';
import { supabase, isSupabaseConfigured } from '../../lib/supabase';

const FAILED_ATTEMPTS_STORAGE_KEY = 'subx_admin_failed_attempts';
const LOCK_UNTIL_STORAGE_KEY = 'subx_admin_lock_until';
const LOCK_DURATION_MS = 10 * 60 * 1000; // 10 minutes

interface AdminLoginProps {
  onLoginSuccess: (email: string) => void;
}

export const AdminLogin: React.FC<AdminLoginProps> = ({ onLoginSuccess }) => {
  const [emailInput, setEmailInput] = useState<string>('');
  const [passwordInput, setPasswordInput] = useState<string>('');
  const [showPassword, setShowPassword] = useState<boolean>(false);
  const [authError, setAuthError] = useState<{ title: string; message: string; attempts?: number } | null>(null);
  const [authLoading, setAuthLoading] = useState<boolean>(false);
  
  // Failed Attempt & Lockout State
  const [failedAttempts, setFailedAttempts] = useState<number>(() => {
    try {
      const saved = localStorage.getItem(FAILED_ATTEMPTS_STORAGE_KEY);
      return saved ? parseInt(saved, 10) || 0 : 0;
    } catch {
      return 0;
    }
  });

  const [lockUntil, setLockUntil] = useState<number>(() => {
    try {
      const saved = localStorage.getItem(LOCK_UNTIL_STORAGE_KEY);
      return saved ? parseInt(saved, 10) || 0 : 0;
    } catch {
      return 0;
    }
  });

  const [remainingSeconds, setRemainingSeconds] = useState<number>(() => {
    try {
      const saved = localStorage.getItem(LOCK_UNTIL_STORAGE_KEY);
      const until = saved ? parseInt(saved, 10) || 0 : 0;
      const diff = Math.ceil((until - Date.now()) / 1000);
      return diff > 0 ? diff : 0;
    } catch {
      return 0;
    }
  });

  const isLocked = remainingSeconds > 0;

  // Countdown timer for locked period
  useEffect(() => {
    if (!isLocked && lockUntil <= Date.now()) {
      return;
    }

    const interval = setInterval(() => {
      const now = Date.now();
      const diff = Math.ceil((lockUntil - now) / 1000);

      if (diff <= 0) {
        // Unlock automatically after 10 minutes
        setRemainingSeconds(0);
        setLockUntil(0);
        setFailedAttempts(0);
        setAuthError(null);
        try {
          localStorage.removeItem(LOCK_UNTIL_STORAGE_KEY);
          localStorage.removeItem(FAILED_ATTEMPTS_STORAGE_KEY);
        } catch {}
      } else {
        setRemainingSeconds(diff);
      }
    }, 1000);

    return () => clearInterval(interval);
  }, [isLocked, lockUntil]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Prevent any login attempt during locked period
    if (isLocked) {
      return;
    }

    setAuthError(null);
    setAuthLoading(true);

    const emailToLogin = emailInput.trim().toLowerCase();
    const passToLogin = passwordInput.trim();

    if (!emailToLogin || !passToLogin) {
      setAuthError({
        title: 'Authentication Failed',
        message: 'Please enter your authorized email address and password.'
      });
      setAuthLoading(false);
      return;
    }

    if (!isSupabaseConfigured || !supabase) {
      setAuthError({
        title: 'Authentication Failed',
        message: 'Supabase database is not configured. Please ensure Supabase credentials are set in the environment.'
      });
      setAuthLoading(false);
      return;
    }

    try {
      // Direct Supabase Authentication - Only registered Supabase users can sign in
      const { data, error } = await supabase.auth.signInWithPassword({
        email: emailToLogin,
        password: passToLogin
      });

      if (error || !data?.user) {
        // Handle failed login attempt
        const newAttempts = failedAttempts + 1;
        setFailedAttempts(newAttempts);
        try {
          localStorage.setItem(FAILED_ATTEMPTS_STORAGE_KEY, String(newAttempts));
        } catch {}

        if (newAttempts >= 3) {
          // Lock for 10 minutes
          const until = Date.now() + LOCK_DURATION_MS;
          setLockUntil(until);
          setRemainingSeconds(Math.ceil(LOCK_DURATION_MS / 1000));
          try {
            localStorage.setItem(LOCK_UNTIL_STORAGE_KEY, String(until));
          } catch {}
          setAuthError(null);
        } else {
          setAuthError({
            title: 'Authentication Failed',
            message: 'The email address or password you entered is incorrect. Please verify your credentials and try again.',
            attempts: newAttempts
          });
        }
      } else {
        // Successful Login - Reset failed attempts & lock state
        setFailedAttempts(0);
        setLockUntil(0);
        setRemainingSeconds(0);
        try {
          localStorage.removeItem(FAILED_ATTEMPTS_STORAGE_KEY);
          localStorage.removeItem(LOCK_UNTIL_STORAGE_KEY);
        } catch {}

        onLoginSuccess(data.user.email || emailToLogin);
      }
    } catch (err: any) {
      setAuthError({
        title: 'Authentication Failed',
        message: 'The email address or password you entered is incorrect. Please verify your credentials and try again.'
      });
    } finally {
      setAuthLoading(false);
    }
  };

  // Format MM:SS for countdown timer
  const formatTime = (secs: number) => {
    const m = Math.floor(secs / 60);
    const s = secs % 60;
    return `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
  };

  return (
    <div className="w-full max-w-md mx-auto my-auto p-4 sm:p-6 animate-in fade-in zoom-in-95 duration-200">
      {/* SaaS Glassmorphism Card */}
      <div 
        className="relative bg-slate-950/90 border border-slate-800 rounded-3xl p-6 sm:p-8 shadow-[0_25px_60px_rgba(0,0,0,0.9)] overflow-hidden text-center"
        style={{
          boxShadow: '0 0 50px -10px rgba(168, 85, 247, 0.15), 0 25px 60px -15px rgba(59, 130, 246, 0.2)'
        }}
      >
        {/* Subtle top gradient accent line */}
        <div className="absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-transparent via-purple-500/80 to-blue-500/80" />
        
        {/* Ambient background glows */}
        <div className="absolute -top-14 -right-14 w-44 h-44 bg-purple-600/15 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -bottom-14 -left-14 w-44 h-44 bg-blue-600/15 rounded-full blur-3xl pointer-events-none" />

        {/* Security Shield Icon */}
        <div className={`relative mx-auto w-14 h-14 rounded-2xl flex items-center justify-center mb-4 shadow-inner border transition-all ${
          isLocked
            ? 'bg-rose-950/40 border-rose-500/40 text-rose-400'
            : 'bg-gradient-to-br from-purple-500/20 via-indigo-600/20 to-blue-600/30 border-purple-500/30 text-purple-400'
        }`}>
          {isLocked ? (
            <AlertOctagon className="w-7 h-7 text-rose-400 animate-pulse" />
          ) : (
            <ShieldCheck className="w-7 h-7 text-purple-300" />
          )}
        </div>

        {/* Header & Subtitle */}
        <h2 className="text-xl sm:text-2xl font-black text-white tracking-tight">
          SubX Nepal Admin Panel
        </h2>
        <p className="text-xs text-slate-400 mt-1.5 leading-relaxed">
          {isLocked 
            ? 'Access is temporarily restricted due to security protection.'
            : 'Login with your authorized email and password to access the admin dashboard.'}
        </p>

        {/* 🔒 10-Minute Lockout Professional Warning Card */}
        {isLocked && (
          <div className="mt-5 p-4 sm:p-5 bg-gradient-to-b from-rose-950/70 to-slate-950/90 border-2 border-rose-500/60 rounded-2xl text-left space-y-3 animate-in fade-in shadow-2xl shadow-rose-950/50">
            <div className="flex items-center gap-2 text-rose-300 font-black text-sm">
              <span className="text-base">🔒</span>
              <span>Account Temporarily Locked</span>
            </div>
            
            <p className="text-xs text-slate-300 leading-relaxed font-normal">
              For security reasons, admin access has been temporarily restricted after multiple failed login attempts.
            </p>

            <p className="text-xs text-rose-300/90 font-medium">
              Please wait 10 minutes before trying again.
            </p>

            {/* Live Countdown Box */}
            <div className="mt-2 pt-3 border-t border-rose-500/30 flex items-center justify-between bg-black/40 px-3.5 py-2.5 rounded-xl border border-rose-500/20">
              <div className="flex items-center gap-1.5 text-xs text-slate-300 font-semibold">
                <Clock className="w-4 h-4 text-rose-400 animate-spin-slow" />
                <span>Remaining Lock Time:</span>
              </div>
              <div className="font-mono text-base font-black text-rose-400 tracking-wider bg-rose-950/80 px-2.5 py-0.5 rounded-lg border border-rose-500/40 shadow-inner">
                {formatTime(remainingSeconds)}
              </div>
            </div>
          </div>
        )}

        {/* Standard Invalid Login Error Card */}
        {!isLocked && authError && (
          <div className="mt-5 p-3.5 bg-red-950/80 border border-red-500/60 rounded-2xl text-left space-y-1 animate-in fade-in">
            <div className="flex items-center gap-2 text-red-300 font-black text-xs">
              <ShieldAlert className="w-4 h-4 text-red-400 shrink-0" />
              <span>{authError.title}</span>
            </div>
            <p className="text-xs text-red-200/90 leading-snug pl-6">
              {authError.message}
            </p>
            {authError.attempts !== undefined && (
              <div className="pt-1.5 pl-6 text-[11px] text-amber-300 font-bold flex items-center gap-1">
                <span>Failed attempt {authError.attempts} of 3. (3 failed attempts locks login for 10 min)</span>
              </div>
            )}
          </div>
        )}

        {/* Authentication Form */}
        <form onSubmit={handleSubmit} className="mt-5 space-y-4 text-left relative z-10">
          
          {/* Field 1: Admin Email */}
          <div>
            <label className="block text-xs font-bold text-slate-300 mb-1.5">
              Admin Email
            </label>
            <div className="relative">
              <Mail className={`w-4 h-4 absolute left-3.5 top-3.5 ${isLocked ? 'text-slate-600' : 'text-slate-500'}`} />
              <input
                type="email"
                value={emailInput}
                onChange={(e) => setEmailInput(e.target.value)}
                placeholder="Enter your authorized email address"
                disabled={isLocked || authLoading}
                className={`w-full border rounded-xl pl-10 pr-3.5 py-3 text-xs focus:outline-none transition-colors ${
                  isLocked
                    ? 'bg-slate-900/40 border-slate-800 text-slate-500 placeholder-slate-700 cursor-not-allowed'
                    : 'bg-slate-900/90 border-slate-800 focus:border-purple-500 text-white placeholder-slate-500'
                }`}
                required
                autoComplete="email"
              />
            </div>
          </div>

          {/* Field 2: Password */}
          <div>
            <label className="block text-xs font-bold text-slate-300 mb-1.5">
              Password
            </label>
            <div className="relative">
              <Lock className={`w-4 h-4 absolute left-3.5 top-3.5 ${isLocked ? 'text-slate-600' : 'text-slate-500'}`} />
              <input
                type={showPassword ? 'text' : 'password'}
                value={passwordInput}
                onChange={(e) => setPasswordInput(e.target.value)}
                placeholder="Enter your Supabase user password"
                disabled={isLocked || authLoading}
                className={`w-full border rounded-xl pl-10 pr-10 py-3 text-xs focus:outline-none transition-colors ${
                  isLocked
                    ? 'bg-slate-900/40 border-slate-800 text-slate-500 placeholder-slate-700 cursor-not-allowed'
                    : 'bg-slate-900/90 border-slate-800 focus:border-purple-500 text-white placeholder-slate-500'
                }`}
                required
                autoComplete="current-password"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                disabled={isLocked}
                className="absolute right-3.5 top-3.5 text-slate-500 hover:text-slate-300 transition-colors cursor-pointer disabled:opacity-40"
                aria-label={showPassword ? 'Hide password' : 'Show password'}
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          {/* Sign In Button */}
          <button
            type="submit"
            disabled={isLocked || authLoading}
            className={`w-full py-3.5 px-4 rounded-xl text-white font-black text-xs sm:text-sm tracking-wide transition-all flex items-center justify-center gap-2 ${
              isLocked
                ? 'bg-slate-800/80 text-slate-500 cursor-not-allowed border border-slate-700/50'
                : 'bg-gradient-to-r from-purple-600 via-indigo-600 to-blue-600 hover:from-purple-500 hover:via-indigo-500 hover:to-blue-500 shadow-lg shadow-purple-950/60 hover:shadow-purple-900/70 cursor-pointer active:scale-[0.99] disabled:opacity-50'
            }`}
          >
            {authLoading ? (
              <>
                <RefreshCw className="w-4 h-4 animate-spin" />
                <span>Verifying with Supabase Auth...</span>
              </>
            ) : isLocked ? (
              <>
                <Lock className="w-4 h-4 text-slate-500" />
                <span>Login Locked ({formatTime(remainingSeconds)})</span>
              </>
            ) : (
              <>
                <Lock className="w-4 h-4" />
                <span>Sign In to Dashboard</span>
              </>
            )}
          </button>
        </form>

        {/* Footer Security Badge */}
        <div className="mt-6 pt-4 border-t border-slate-800/80 text-center space-y-1 relative z-10">
          <div className="text-[11px] font-bold text-slate-300">
            SubX Nepal Admin Panel
          </div>
          <div className="text-[10px] text-purple-400 font-medium">
            🔒 24/7 Supabase Auth Security Protection
          </div>
          <div className="text-[10px] text-slate-500">
            Direct Supabase Authentication • Authorized Access Only
          </div>
        </div>

      </div>
    </div>
  );
};

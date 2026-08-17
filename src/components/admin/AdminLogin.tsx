import React, { useState, useEffect, useRef } from 'react';
import { 
  Lock, 
  Eye, 
  EyeOff, 
  RefreshCw,
  Clock,
  ArrowRight
} from 'lucide-react';
import { supabase, isSupabaseConfigured } from '../../lib/supabase';
import { SiteSettings } from '../../types';

const FAILED_ATTEMPTS_STORAGE_KEY = 'subx_admin_failed_attempts';
const LOCK_UNTIL_STORAGE_KEY = 'subx_admin_lock_until';
const LOCK_DURATION_MS = 10 * 60 * 1000; // 10 minutes
const DISGUISE_SESSION_KEY = 'subx_admin_disguise_unlocked';

interface AdminLoginProps {
  onLoginSuccess: (email: string) => void;
  siteSettings?: SiteSettings;
}

export const AdminLogin: React.FC<AdminLoginProps> = ({ onLoginSuccess }) => {
  // Disguise State (Camouflage Screen - default true unless unlocked in current tab)
  const [isDisguised, setIsDisguised] = useState<boolean>(() => {
    try {
      return sessionStorage.getItem(DISGUISE_SESSION_KEY) !== 'true';
    } catch {
      return true;
    }
  });

  const [tapCount, setTapCount] = useState<number>(0);
  const lastTapRef = useRef<number>(0);

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

  // Autofill email if active session exists
  useEffect(() => {
    const fetchLatestData = async () => {
      if (isSupabaseConfigured && supabase) {
        try {
          const { data: authData } = await supabase.auth.getUser();
          if (authData?.user?.email && !emailInput) {
            setEmailInput(authData.user.email);
          }
        } catch {}
      }
    };
    fetchLatestData();
  }, []);

  // Handle Secret 5 Clicks on Error Logo
  const handleSadIconClick = (e: React.MouseEvent) => {
    e.preventDefault();
    const now = Date.now();
    
    // Reset if taps are separated by more than 3.5 seconds
    if (now - lastTapRef.current > 3500) {
      setTapCount(1);
    } else {
      const nextCount = tapCount + 1;
      setTapCount(nextCount);
      
      if (nextCount >= 5) {
        setIsDisguised(false);
        try {
          sessionStorage.setItem(DISGUISE_SESSION_KEY, 'true');
        } catch {}
        setTapCount(0);
      }
    }
    lastTapRef.current = now;
  };

  // Handle Login with Admin Email & Password
  const handleLoginSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (isLocked) return;

    setAuthError(null);
    setAuthLoading(true);

    const emailToLogin = emailInput.trim().toLowerCase();
    const passToLogin = passwordInput.trim();

    if (!emailToLogin || !passToLogin) {
      setAuthError({
        title: 'Credentials Required',
        message: 'Please enter your Admin Email and Password.'
      });
      setAuthLoading(false);
      return;
    }

    if (!isSupabaseConfigured || !supabase) {
      setAuthError({
        title: 'Connection Error',
        message: 'Database is not connected.'
      });
      setAuthLoading(false);
      return;
    }

    const recordFailedAttempt = (errorMessage: string) => {
      const newAttempts = failedAttempts + 1;
      setFailedAttempts(newAttempts);
      try {
        localStorage.setItem(FAILED_ATTEMPTS_STORAGE_KEY, String(newAttempts));
      } catch {}

      if (newAttempts >= 3) {
        const until = Date.now() + LOCK_DURATION_MS;
        setLockUntil(until);
        setRemainingSeconds(Math.ceil(LOCK_DURATION_MS / 1000));
        try {
          localStorage.setItem(LOCK_UNTIL_STORAGE_KEY, String(until));
        } catch {}
        setAuthError(null);
      } else {
        setAuthError({
          title: 'Sign in failed',
          message: errorMessage,
          attempts: newAttempts
        });
      }
    };

    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email: emailToLogin,
        password: passToLogin
      });

      if (error || !data?.user) {
        recordFailedAttempt(
          error?.message || 'Invalid email or password.'
        );
        setAuthLoading(false);
        return;
      }

      // Success
      setFailedAttempts(0);
      setLockUntil(0);
      setRemainingSeconds(0);
      try {
        localStorage.removeItem(FAILED_ATTEMPTS_STORAGE_KEY);
        localStorage.removeItem(LOCK_UNTIL_STORAGE_KEY);
      } catch {}

      onLoginSuccess(data.user.email || emailToLogin);

    } catch (err: any) {
      recordFailedAttempt(err?.message || 'Authentication failed.');
    } finally {
      setAuthLoading(false);
    }
  };

  const formatTime = (secs: number) => {
    const m = Math.floor(secs / 60);
    const s = secs % 60;
    return `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
  };

  const currentHost = typeof window !== 'undefined' 
    ? window.location.hostname || 'subxnepal.store' 
    : 'subxnepal.store';

  // -------------------------------------------------------------
  // VIEW 1: AUTHENTIC LIGHT BROWSER ERROR PAGE (Chrome DNS Style)
  // -------------------------------------------------------------
  if (isDisguised) {
    return (
      <div className="min-h-screen bg-white text-[#202124] flex flex-col justify-start px-6 sm:px-12 pt-16 sm:pt-24 max-w-2xl mx-auto font-sans select-none antialiased">
        
        {/* Sad Document Icon - Secret 5-Tap Area */}
        <div 
          onClick={handleSadIconClick}
          className="cursor-pointer mb-8 inline-block select-none"
          style={{ WebkitTapHighlightColor: 'transparent' }}
          title=""
        >
          <svg 
            width="56" 
            height="56" 
            viewBox="0 0 48 48" 
            fill="none" 
            xmlns="http://www.w3.org/2000/svg"
            className="text-[#5f6368] hover:text-[#202124] transition-colors"
          >
            {/* Sheet Outline */}
            <path 
              d="M10 4C7.79086 4 6 5.79086 6 8V40C6 42.2091 7.79086 44 10 44H38C40.2091 44 42 42.2091 42 40V16L30 4H10Z" 
              stroke="#5f6368" 
              strokeWidth="2.5" 
              strokeLinejoin="round"
              fill="#ffffff"
            />
            {/* Folded Corner */}
            <path 
              d="M30 4V16H42" 
              stroke="#5f6368" 
              strokeWidth="2.5" 
              strokeLinejoin="round"
            />
            {/* Sad Eyes */}
            <rect x="15" y="24" width="4" height="4" rx="1" fill="#5f6368" />
            <rect x="29" y="24" width="4" height="4" rx="1" fill="#5f6368" />
            {/* Sad Mouth */}
            <path 
              d="M18 35C20 32.5 22 31.5 24 31.5C26 31.5 28 32.5 30 35" 
              stroke="#5f6368" 
              strokeWidth="2.5" 
              strokeLinecap="round"
            />
          </svg>
        </div>

        {/* Heading */}
        <h1 className="text-[26px] sm:text-[28px] font-medium text-[#202124] tracking-tight leading-snug mb-6">
          This site can’t be reached
        </h1>

        {/* Typo message */}
        <p className="text-[15px] sm:text-[16px] text-[#5f6368] leading-relaxed mb-4">
          Check if there is a typo in <span className="text-[#202124] font-medium">{currentHost}</span>.
        </p>

        {/* Sub-bullet suggestions */}
        <ul className="list-disc pl-5 text-[14px] text-[#5f6368] space-y-2 mb-6">
          <li>If spelling is correct, try running Windows Network Diagnostics.</li>
          <li>Check your internet connection and DNS configuration.</li>
        </ul>

        {/* Error Code */}
        <p className="text-[13px] text-[#5f6368] font-mono tracking-wide mb-10">
          DNS_PROBE_FINISHED_NXDOMAIN
        </p>

        {/* Standard Chrome Blue Reload Button */}
        <div>
          <button
            type="button"
            onClick={() => window.location.reload()}
            className="px-6 py-2.5 bg-[#1a73e8] hover:bg-[#1557b0] active:bg-[#174ea6] text-white text-[14px] font-medium rounded-full transition-colors shadow-none cursor-pointer"
          >
            Reload
          </button>
        </div>

      </div>
    );
  }

  // -------------------------------------------------------------
  // VIEW 2: CLEAN MINIMAL LIGHT SIGN IN FORM (After 5 Clicks)
  // -------------------------------------------------------------
  return (
    <div className="min-h-screen bg-white text-[#202124] flex flex-col justify-start px-6 sm:px-12 pt-12 sm:pt-20 max-w-lg mx-auto font-sans antialiased">
      
      {/* Small Simple Header */}
      <div className="mb-8">
        <h1 className="text-[24px] font-medium text-[#202124] tracking-tight">
          Sign In
        </h1>
        <p className="text-[14px] text-[#5f6368] mt-1.5">
          {isLocked 
            ? 'Access is temporarily locked for security.' 
            : 'Enter administrator credentials to proceed.'}
        </p>
      </div>

      {/* Lockout Notice */}
      {isLocked && (
        <div className="mb-6 p-4 rounded-lg bg-[#fce8e6] border border-[#fad2cf] text-[#c5221f] text-[13px] space-y-2">
          <div className="font-semibold flex items-center gap-1.5">
            <Clock className="w-4 h-4" />
            <span>Account temporarily restricted</span>
          </div>
          <p className="text-[#3c4043]">
            Too many failed sign-in attempts. Please wait 10 minutes before trying again.
          </p>
          <div className="font-mono font-bold text-[14px]">
            Remaining time: {formatTime(remainingSeconds)}
          </div>
        </div>
      )}

      {/* Standard Error Notice */}
      {!isLocked && authError && (
        <div className="mb-6 p-3.5 rounded-lg bg-[#fce8e6] border border-[#fad2cf] text-[#c5221f] text-[13px] space-y-1">
          <div className="font-medium">{authError.message}</div>
          {authError.attempts !== undefined && (
            <div className="text-[12px] text-[#5f6368]">
              Attempt {authError.attempts} of 3. (3 failed attempts locks login for 10 min)
            </div>
          )}
        </div>
      )}

      {/* Clean Form */}
      <form onSubmit={handleLoginSubmit} className="space-y-5">
        
        {/* Email Field */}
        <div>
          <label className="block text-[13px] font-medium text-[#3c4043] mb-1.5">
            Enter admin mail
          </label>
          <input
            type="email"
            value={emailInput}
            onChange={(e) => setEmailInput(e.target.value)}
            placeholder="admin@example.com"
            disabled={isLocked || authLoading}
            className="w-full bg-white border border-[#dadce0] focus:border-[#1a73e8] focus:ring-1 focus:ring-[#1a73e8] rounded-md px-3.5 py-2.5 text-[14px] text-[#202124] placeholder-[#80868b] outline-none transition-all disabled:bg-[#f1f3f4] disabled:text-[#80868b]"
            required
            autoComplete="email"
          />
        </div>

        {/* Password Field */}
        <div>
          <label className="block text-[13px] font-medium text-[#3c4043] mb-1.5">
            Enter admin password
          </label>
          <div className="relative">
            <input
              type={showPassword ? 'text' : 'password'}
              value={passwordInput}
              onChange={(e) => setPasswordInput(e.target.value)}
              placeholder="••••••••"
              disabled={isLocked || authLoading}
              className="w-full bg-white border border-[#dadce0] focus:border-[#1a73e8] focus:ring-1 focus:ring-[#1a73e8] rounded-md pl-3.5 pr-10 py-2.5 text-[14px] text-[#202124] placeholder-[#80868b] outline-none transition-all disabled:bg-[#f1f3f4] disabled:text-[#80868b]"
              required
              autoComplete="current-password"
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              disabled={isLocked}
              className="absolute right-3 top-2.5 text-[#5f6368] hover:text-[#202124] cursor-pointer disabled:opacity-30"
              tabIndex={-1}
            >
              {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
            </button>
          </div>
        </div>

        {/* Action Button */}
        <div className="pt-2">
          <button
            type="submit"
            disabled={isLocked || authLoading || !emailInput || !passwordInput}
            className="w-full sm:w-auto px-6 py-2.5 bg-[#1a73e8] hover:bg-[#1557b0] active:bg-[#174ea6] text-white text-[14px] font-medium rounded-full transition-colors disabled:bg-[#dadce0] disabled:text-[#80868b] cursor-pointer flex items-center justify-center gap-2"
          >
            {authLoading ? (
              <>
                <RefreshCw className="w-4 h-4 animate-spin" />
                <span>Signing in...</span>
              </>
            ) : isLocked ? (
              <>
                <Lock className="w-4 h-4" />
                <span>Locked ({formatTime(remainingSeconds)})</span>
              </>
            ) : (
              <>
                <span>Sign in</span>
                <ArrowRight className="w-4 h-4" />
              </>
            )}
          </button>
        </div>

      </form>

    </div>
  );
};

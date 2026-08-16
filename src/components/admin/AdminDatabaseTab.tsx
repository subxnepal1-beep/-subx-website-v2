import React, { useState } from 'react';
import {
  Database,
  CheckCircle2,
  AlertTriangle,
  Copy,
  Check,
  RefreshCw,
  Zap,
  KeyRound,
  ShieldCheck,
  ExternalLink
} from 'lucide-react';
import {
  isSupabaseConfigured,
  supabaseUrl,
  supabaseAnonKey,
  configureSupabase,
  testSupabaseConnection
} from '../../lib/supabase';

export const AdminDatabaseTab: React.FC = () => {
  const [copiedSQL, setCopiedSQL] = useState(false);
  const [testingConn, setTestingConn] = useState(false);
  const [testResult, setTestResult] = useState<{ success: boolean; message: string } | null>(null);

  const [urlInput, setUrlInput] = useState(supabaseUrl || '');
  const [anonKeyInput, setAnonKeyInput] = useState(supabaseAnonKey || '');
  const [saveSuccess, setSaveSuccess] = useState(false);

  const handleTestConnection = async () => {
    setTestingConn(true);
    setTestResult(null);
    try {
      const res = await testSupabaseConnection();
      setTestResult(res);
    } catch (err: any) {
      setTestResult({ success: false, message: err?.message || 'Connection test failed' });
    } finally {
      setTestingConn(false);
    }
  };

  const handleSaveCredentials = (e: React.FormEvent) => {
    e.preventDefault();
    if (!urlInput.trim() || !anonKeyInput.trim()) return;

    try {
      configureSupabase(urlInput.trim(), anonKeyInput.trim());
      setSaveSuccess(true);
      setTimeout(() => {
        window.location.reload();
      }, 1200);
    } catch (err) {
      console.error(err);
    }
  };

  const sqlScript = `-- SubX Nepal Supabase Schema & Storage Configuration
-- Run this in your Supabase Dashboard -> SQL Editor

-- 1. Site Settings Table
CREATE TABLE IF NOT EXISTS public.site_settings (
  id TEXT PRIMARY KEY DEFAULT 'default',
  site_name TEXT DEFAULT 'SubX Nepal',
  tagline TEXT DEFAULT 'Nepal''s #1 Digital Subscription Store',
  logo_url TEXT,
  whatsapp_number TEXT DEFAULT '9779765617156',
  display_whatsapp TEXT DEFAULT '+977 9765617156',
  show_promotional_posters BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. Products Table
CREATE TABLE IF NOT EXISTS public.products (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  category TEXT DEFAULT 'AI Tools',
  description TEXT,
  badge TEXT,
  discount_percent INTEGER DEFAULT 10,
  image TEXT,
  banner_type TEXT DEFAULT 'custom',
  plans JSONB NOT NULL DEFAULT '[]'::jsonb,
  stock TEXT DEFAULT 'In Stock',
  requires_email_input BOOLEAN DEFAULT false,
  instructions TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. Customer Orders Table
CREATE TABLE IF NOT EXISTS public.orders (
  id TEXT PRIMARY KEY,
  customer_name TEXT,
  customer_phone TEXT,
  items JSONB NOT NULL DEFAULT '[]'::jsonb,
  total NUMERIC NOT NULL,
  original_total NUMERIC,
  promo_code TEXT,
  discount_amount NUMERIC DEFAULT 0,
  status TEXT DEFAULT 'Pending',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  notes TEXT
);

-- 4. Promotional Posters Table
CREATE TABLE IF NOT EXISTS public.promotional_posters (
  id TEXT PRIMARY KEY,
  title TEXT NOT NULL,
  subtitle TEXT,
  description TEXT,
  badge TEXT,
  image TEXT,
  product_id TEXT,
  cta_text TEXT DEFAULT 'Get Now →',
  active BOOLEAN DEFAULT true,
  display_order INTEGER DEFAULT 1,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 5. Promo Codes Table
CREATE TABLE IF NOT EXISTS public.promo_codes (
  id TEXT PRIMARY KEY,
  code TEXT UNIQUE NOT NULL,
  discount_type TEXT DEFAULT 'percentage',
  discount_value NUMERIC NOT NULL,
  min_order_amount NUMERIC DEFAULT 0,
  active BOOLEAN DEFAULT true,
  usage_count INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 6. Enable Row Level Security (RLS) and Open Public Access for Store Operations
ALTER TABLE public.site_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.promotional_posters ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.promo_codes ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Public Full Access site_settings" ON public.site_settings;
CREATE POLICY "Public Full Access site_settings" ON public.site_settings FOR ALL USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "Public Full Access products" ON public.products;
CREATE POLICY "Public Full Access products" ON public.products FOR ALL USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "Public Full Access orders" ON public.orders;
CREATE POLICY "Public Full Access orders" ON public.orders FOR ALL USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "Public Full Access promotional_posters" ON public.promotional_posters;
CREATE POLICY "Public Full Access promotional_posters" ON public.promotional_posters FOR ALL USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "Public Full Access promo_codes" ON public.promo_codes;
CREATE POLICY "Public Full Access promo_codes" ON public.promo_codes FOR ALL USING (true) WITH CHECK (true);

-- 7. Storage Buckets for Images & Assets
INSERT INTO storage.buckets (id, name, public) 
VALUES ('product-images', 'product-images', true),
       ('site-assets', 'site-assets', true),
       ('posters', 'posters', true)
ON CONFLICT (id) DO NOTHING;

DROP POLICY IF EXISTS "Public Read and Write product-images" ON storage.objects;
CREATE POLICY "Public Read and Write product-images" ON storage.objects FOR ALL USING (true) WITH CHECK (true);
`;

  const handleCopySQL = () => {
    navigator.clipboard.writeText(sqlScript);
    setCopiedSQL(true);
    setTimeout(() => setCopiedSQL(false), 3000);
  };

  return (
    <div className="p-4 sm:p-6 space-y-6">
      
      {/* Status Bar */}
      <div className="p-5 bg-slate-900/80 border border-slate-800 rounded-2xl flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-purple-950 border border-purple-500/40 flex items-center justify-center text-purple-400 shrink-0">
            <Database className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h4 className="text-sm font-black text-white">Supabase Cloud Database</h4>
              {isSupabaseConfigured ? (
                <span className="text-[10px] bg-emerald-950 text-emerald-300 font-extrabold px-2 py-0.5 rounded-full border border-emerald-500/40 flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                  CONNECTED
                </span>
              ) : (
                <span className="text-[10px] bg-amber-950 text-amber-300 font-extrabold px-2 py-0.5 rounded-full border border-amber-500/40">
                  LOCAL MODE
                </span>
              )}
            </div>
            <p className="text-xs text-slate-400 mt-0.5">
              {isSupabaseConfigured
                ? `Project Endpoint: ${supabaseUrl}`
                : 'Configure Supabase URL & Key below to enable cloud synchronization.'}
            </p>
          </div>
        </div>

        <button
          type="button"
          onClick={handleTestConnection}
          disabled={testingConn}
          className="px-4 py-2 bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-200 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 transition-all cursor-pointer disabled:opacity-50 shrink-0"
        >
          {testingConn ? (
            <RefreshCw className="w-3.5 h-3.5 animate-spin" />
          ) : (
            <Zap className="w-3.5 h-3.5 text-cyan-400" />
          )}
          <span>Test Database Ping</span>
        </button>
      </div>

      {testResult && (
        <div
          className={`p-3.5 rounded-xl text-xs flex items-center gap-2 animate-fade-in ${
            testResult.success
              ? 'bg-emerald-950/90 border border-emerald-500/50 text-emerald-300'
              : 'bg-red-950/90 border border-red-500/50 text-red-300'
          }`}
        >
          {testResult.success ? (
            <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
          ) : (
            <AlertTriangle className="w-4 h-4 text-red-400 shrink-0" />
          )}
          <span className="font-semibold">{testResult.message}</span>
        </div>
      )}

      {/* Credentials Form */}
      <form
        onSubmit={handleSaveCredentials}
        className="p-5 bg-slate-900/80 border border-slate-800 rounded-2xl space-y-4"
      >
        <div className="flex items-center gap-2 pb-2 border-b border-slate-800">
          <KeyRound className="w-4 h-4 text-cyan-400" />
          <h4 className="text-sm font-black text-white uppercase tracking-wider">
            Supabase Project Credentials
          </h4>
        </div>

        {saveSuccess && (
          <div className="p-3 bg-emerald-950/90 border border-emerald-500/50 rounded-xl text-xs text-emerald-300 flex items-center gap-2 animate-fade-in">
            <CheckCircle2 className="w-4 h-4 text-emerald-400" />
            <span>Credentials saved! Reloading application...</span>
          </div>
        )}

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-bold text-slate-300 mb-1">Project URL</label>
            <input
              type="text"
              value={urlInput}
              onChange={(e) => setUrlInput(e.target.value)}
              placeholder="https://your-project.supabase.co"
              className="w-full bg-slate-950 border border-slate-800 focus:border-cyan-500 rounded-xl px-3.5 py-2.5 text-xs text-white font-mono focus:outline-none"
              required
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-300 mb-1">Anon / Public API Key</label>
            <input
              type="text"
              value={anonKeyInput}
              onChange={(e) => setAnonKeyInput(e.target.value)}
              placeholder="eyJhbGciOiJIUzI1NiIsIn..."
              className="w-full bg-slate-950 border border-slate-800 focus:border-cyan-500 rounded-xl px-3.5 py-2.5 text-xs text-white font-mono focus:outline-none"
              required
            />
          </div>
        </div>

        <div className="flex items-center justify-end pt-2">
          <button
            type="submit"
            className="px-5 py-2.5 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white font-black rounded-xl text-xs shadow-lg shadow-purple-950/50 transition-all cursor-pointer active:scale-95 flex items-center gap-1.5"
          >
            <Check className="w-4 h-4" />
            <span>Save & Reconnect Supabase</span>
          </button>
        </div>
      </form>

      {/* SQL Setup Script Box */}
      <div className="p-5 bg-slate-900/80 border border-slate-800 rounded-2xl space-y-4">
        <div className="flex items-center justify-between gap-3 pb-2 border-b border-slate-800">
          <div>
            <h4 className="text-sm font-black text-white uppercase tracking-wider flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-emerald-400" />
              <span>Full Supabase SQL Setup Script</span>
            </h4>
            <p className="text-xs text-slate-400 mt-0.5">
              Copy and execute this script in your Supabase Dashboard &gt; SQL Editor to ensure all tables, storage buckets, and RLS policies are set up.
            </p>
          </div>

          <button
            type="button"
            onClick={handleCopySQL}
            className={`px-4 py-2 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer shrink-0 ${
              copiedSQL
                ? 'bg-emerald-950 text-emerald-300 border border-emerald-500/50'
                : 'bg-slate-800 hover:bg-slate-700 text-white border border-slate-700'
            }`}
          >
            {copiedSQL ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
            <span>{copiedSQL ? 'Copied SQL!' : 'Copy SQL Script'}</span>
          </button>
        </div>

        <div className="relative">
          <pre className="p-4 bg-slate-950 border border-slate-800 rounded-xl text-[11px] font-mono text-emerald-400 overflow-x-auto max-h-64 leading-relaxed scrollbar-thin">
            {sqlScript}
          </pre>
        </div>
      </div>

    </div>
  );
};

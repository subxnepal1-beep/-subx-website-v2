import { createClient, SupabaseClient } from '@supabase/supabase-js';

function sanitizeSupabaseUrl(rawUrl: string): string {
  let clean = (rawUrl || '').trim().replace(/['"]/g, '').replace(/\/+$/, '');
  if (clean && !clean.startsWith('http://') && !clean.startsWith('https://')) {
    clean = `https://${clean}`;
  }
  return clean;
}

function sanitizeSupabaseKey(rawKey: string): string {
  return (rawKey || '').trim().replace(/['"]/g, '');
}

function getInitialCredentials() {
  let url = import.meta.env.VITE_SUPABASE_URL || '';
  let key = import.meta.env.VITE_SUPABASE_ANON_KEY || '';

  try {
    const savedUrl = localStorage.getItem('VITE_SUPABASE_URL');
    const savedKey = localStorage.getItem('VITE_SUPABASE_ANON_KEY');
    if (savedUrl) url = savedUrl;
    if (savedKey) key = savedKey;
  } catch (e) {
    console.warn('LocalStorage read error for Supabase credentials:', e);
  }

  const cleanUrl = sanitizeSupabaseUrl(url);
  const cleanKey = sanitizeSupabaseKey(key);

  return {
    url: cleanUrl,
    key: cleanKey
  };
}

const initialCreds = getInitialCredentials();

export let supabaseUrl = initialCreds.url;
export let supabaseAnonKey = initialCreds.key;
export let isSupabaseConfigured = Boolean(supabaseUrl && supabaseAnonKey);

export let supabase: SupabaseClient | null = isSupabaseConfigured
  ? createClient(supabaseUrl, supabaseAnonKey, {
      auth: {
        persistSession: true,
        autoRefreshToken: true,
        detectSessionInUrl: true
      }
    })
  : null;

export function configureSupabase(url: string, key: string) {
  const cleanUrl = sanitizeSupabaseUrl(url);
  const cleanKey = sanitizeSupabaseKey(key);

  try {
    if (cleanUrl) {
      localStorage.setItem('VITE_SUPABASE_URL', cleanUrl);
    } else {
      localStorage.removeItem('VITE_SUPABASE_URL');
    }

    if (cleanKey) {
      localStorage.setItem('VITE_SUPABASE_ANON_KEY', cleanKey);
    } else {
      localStorage.removeItem('VITE_SUPABASE_ANON_KEY');
    }
  } catch (e) {
    console.warn('LocalStorage write error for Supabase credentials:', e);
  }

  supabaseUrl = cleanUrl;
  supabaseAnonKey = cleanKey;
  isSupabaseConfigured = Boolean(cleanUrl && cleanKey);
  supabase = isSupabaseConfigured
    ? createClient(cleanUrl, cleanKey, {
        auth: {
          persistSession: true,
          autoRefreshToken: true,
          detectSessionInUrl: true
        }
      })
    : null;

  return { isConfigured: isSupabaseConfigured, client: supabase };
}

export function getSupabaseCredentials() {
  return {
    url: supabaseUrl,
    key: supabaseAnonKey,
    isConfigured: isSupabaseConfigured
  };
}

export async function testSupabaseConnection(): Promise<{ success: boolean; message: string; buckets?: string[] }> {
  if (!isSupabaseConfigured || !supabase) {
    return { success: false, message: 'Supabase URL or Anon Key is missing.' };
  }
  try {
    const { error: dbError } = await supabase.from('products').select('id').limit(1);
    let bucketInfo = '';
    let foundBuckets: string[] = [];

    try {
      const { data: buckets, error: bError } = await supabase.storage.listBuckets();
      if (!bError && buckets) {
        foundBuckets = buckets.map(b => b.name);
        bucketInfo = ` | Storage Buckets: [${foundBuckets.join(', ') || 'none found'}]`;
      }
    } catch {}

    if (dbError) {
      return { success: false, message: `Connected to Supabase endpoint, but query failed: ${dbError.message}${bucketInfo}` };
    }
    return {
      success: true,
      message: `Supabase connected successfully! Database active${bucketInfo}`,
      buckets: foundBuckets
    };
  } catch (err: any) {
    return { success: false, message: err?.message || 'Failed to ping Supabase.' };
  }
}

/**
 * Upload a file/data URL to Supabase Storage bucket 'product-images' or 'site-assets'
 */
export interface StorageUploadResult {
  url: string | null;
  error: string | null;
}

/**
 * Determine MIME content type from file name or File object
 */
function getContentType(fileName: string, fallbackType?: string): string {
  if (fallbackType && fallbackType !== 'application/octet-stream' && fallbackType !== '') {
    return fallbackType;
  }
  const ext = fileName.split('.').pop()?.toLowerCase();
  switch (ext) {
    case 'jpg':
    case 'jpeg':
      return 'image/jpeg';
    case 'png':
      return 'image/png';
    case 'webp':
      return 'image/webp';
    case 'gif':
      return 'image/gif';
    case 'svg':
      return 'image/svg+xml';
    default:
      return 'image/png';
  }
}

/**
 * Sanitize filename to ensure characters are valid for S3/Supabase storage key paths
 */
function sanitizeFileName(fileName: string): string {
  const parts = fileName.split('.');
  if (parts.length > 1) {
    const ext = parts.pop()?.toLowerCase() || 'png';
    const base = parts.join('.').toLowerCase().replace(/[^a-z0-9_-]/g, '_');
    return `${base}.${ext}`;
  }
  return fileName.toLowerCase().replace(/[^a-z0-9_-]/g, '_');
}

/**
 * Core image uploader function targeting specified bucket ('product-images', 'product-logos', or 'site-assets')
 * Automatically attempts candidate buckets if initial bucket fails due to missing bucket or RLS restrictions.
 */
export async function uploadImageToSupabaseStorage(
  fileOrDataUrl: File | string,
  bucketName: 'product-images' | 'product-logos' | 'site-assets' | string = 'product-images',
  fileName?: string
): Promise<StorageUploadResult> {
  if (!supabase || !isSupabaseConfigured) {
    return { url: null, error: 'Supabase client is not configured.' };
  }

  try {
    let fileToUpload: File | Blob;
    let originalName = fileName || `image-${Date.now()}.png`;
    let detectedType = '';

    if (typeof fileOrDataUrl === 'string' && fileOrDataUrl.startsWith('data:')) {
      const mimeMatch = fileOrDataUrl.match(/^data:(image\/[a-zA-Z0-9+.-]+);base64,/);
      if (mimeMatch) {
        detectedType = mimeMatch[1];
      }
      const res = await fetch(fileOrDataUrl);
      fileToUpload = await res.blob();
    } else if (fileOrDataUrl instanceof File) {
      fileToUpload = fileOrDataUrl;
      originalName = fileOrDataUrl.name;
      detectedType = fileOrDataUrl.type;
    } else {
      return { url: null, error: 'Invalid file or image data provided.' };
    }

    const cleanName = sanitizeFileName(originalName);
    const contentType = getContentType(cleanName, detectedType);
    const path = `${Date.now()}-${cleanName}`;

    // Try candidate buckets in order of preference
    const candidateBuckets = Array.from(
      new Set([bucketName, 'product-images', 'product-logos', 'site-assets', 'public'])
    );

    let primaryError = '';
    let lastErrorMessage = '';

    for (let i = 0; i < candidateBuckets.length; i++) {
      const bName = candidateBuckets[i];
      const { data, error } = await supabase.storage
        .from(bName)
        .upload(path, fileToUpload, {
          cacheControl: '3600',
          upsert: true,
          contentType
        });

      if (!error && data?.path) {
        const { data: publicUrlData } = supabase.storage
          .from(bName)
          .getPublicUrl(data.path);

        if (publicUrlData && publicUrlData.publicUrl) {
          return { url: publicUrlData.publicUrl, error: null };
        }
      } else if (error) {
        if (i === 0) {
          primaryError = error.message;
        }
        lastErrorMessage = error.message;
        console.warn(`Supabase storage bucket '${bName}' upload attempt failed:`, error.message);
      }
    }

    const finalErrMsg = primaryError || lastErrorMessage || 'Bucket missing or row-level security policy restriction';
    return {
      url: null,
      error: `Storage upload to bucket '${bucketName}' failed: ${finalErrMsg}`
    };
  } catch (e: any) {
    console.error('Failed to upload image to Supabase storage', e);
    return { url: null, error: e?.message || 'Unexpected error uploading image to storage.' };
  }
}

/**
 * Upload a file/data URL to Supabase Storage bucket 'product-images'
 */
export async function uploadProductLogoToSupabase(fileOrDataUrl: File | string, fileName?: string): Promise<StorageUploadResult> {
  return uploadImageToSupabaseStorage(fileOrDataUrl, 'product-images', fileName);
}

/**
 * Upload Website Header / Branding Logo to Supabase Storage bucket 'site-assets'
 */
export async function uploadWebsiteLogoToSupabase(fileOrDataUrl: File | string, fileName?: string): Promise<StorageUploadResult> {
  return uploadImageToSupabaseStorage(fileOrDataUrl, 'site-assets', fileName);
}

/**
 * Delete a file from Supabase Storage by its public URL
 */
export async function deleteStorageFileFromSupabase(publicUrl?: string | null): Promise<boolean> {
  if (!supabase || !isSupabaseConfigured || !publicUrl) return false;

  try {
    if (!publicUrl.includes('/storage/v1/object/public/')) return false;

    // URL format: .../storage/v1/object/public/BUCKET_NAME/PATH/TO/FILE
    const fullPathPart = publicUrl.split('/storage/v1/object/public/')[1];
    if (!fullPathPart) return false;

    // Strip out query string if present (e.g. ?t=12345)
    const cleanPathPart = fullPathPart.split('?')[0];

    const [bucket, ...filePathParts] = cleanPathPart.split('/');
    let filePath = filePathParts.join('/');
    try {
      filePath = decodeURIComponent(filePath);
    } catch {
      // keep raw if decode fails
    }

    if (!bucket || !filePath) return false;

    // Try primary bucket first, then all known buckets
    const candidateBuckets = Array.from(
      new Set([bucket, 'product-images', 'site-assets', 'product-logos', 'posters', 'public'])
    );

    let deleted = false;
    for (const bName of candidateBuckets) {
      try {
        const { error, data } = await supabase.storage.from(bName).remove([filePath]);
        if (!error && data && data.length > 0) {
          deleted = true;
          console.log(`[Supabase Storage] Automatically cleaned up old file: ${filePath} from bucket '${bName}'`);
          break;
        }
      } catch (err) {
        // continue trying other candidate buckets
      }
    }
    return deleted;
  } catch (e) {
    console.warn('[Supabase Storage] Notice during old file cleanup:', e);
    return false;
  }
}

/**
 * SQL Schema for SubX Nepal Supabase Setup:
 * 
 * -- 1. website_settings table
 * CREATE TABLE IF NOT EXISTS public.website_settings (
 *   id TEXT PRIMARY KEY DEFAULT 'default',
 *   site_name TEXT DEFAULT 'SubX Nepal',
 *   logo_url TEXT,
 *   tagline TEXT DEFAULT 'PREMIUM DIGITAL SUBSCRIPTIONS',
 *   whatsapp_number TEXT DEFAULT '9779765617156',
 *   updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now())
 * );
 * 
 * -- settings table (legacy/compatibility alias)
 * CREATE TABLE IF NOT EXISTS public.settings (
 *   id TEXT PRIMARY KEY DEFAULT 'default',
 *   site_name TEXT DEFAULT 'SubX Nepal',
 *   tagline TEXT DEFAULT 'PREMIUM DIGITAL SUBSCRIPTIONS',
 *   logo_url TEXT,
 *   whatsapp_number TEXT DEFAULT '9779765617156',
 *   display_whatsapp TEXT DEFAULT '+977 9765617156',
 *   updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now())
 * );
 * 
 * -- 2. products table
 * CREATE TABLE IF NOT EXISTS public.products (
 *   id TEXT PRIMARY KEY,
 *   name TEXT NOT NULL,
 *   category TEXT NOT NULL,
 *   description TEXT,
 *   features JSONB DEFAULT '[]'::jsonb,
 *   image_url TEXT,
 *   price NUMERIC DEFAULT 0,
 *   discount NUMERIC DEFAULT 0,
 *   stock_status TEXT DEFAULT 'In Stock',
 *   options JSONB NOT NULL DEFAULT '[]'::jsonb,
 *   plans JSONB DEFAULT '[]'::jsonb,
 *   logo_url TEXT,
 *   banner_image_url TEXT,
 *   badge TEXT,
 *   image TEXT,
 *   banner_type TEXT DEFAULT 'custom',
 *   requires_email_input BOOLEAN DEFAULT false,
 *   created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()),
 *   updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now())
 * );
 * 
 * -- 3. orders table
 * CREATE TABLE IF NOT EXISTS public.orders (
 *   id TEXT PRIMARY KEY,
 *   customer_name TEXT,
 *   customer_phone TEXT,
 *   items JSONB NOT NULL,
 *   total NUMERIC NOT NULL,
 *   status TEXT DEFAULT 'Pending',
 *   created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now())
 * );
 * 
 * -- Storage Bucket Setup
 * INSERT INTO storage.buckets (id, name, public) VALUES ('product-images', 'product-images', true) ON CONFLICT DO NOTHING;
 * INSERT INTO storage.buckets (id, name, public) VALUES ('product-logos', 'product-logos', true) ON CONFLICT DO NOTHING;
 * INSERT INTO storage.buckets (id, name, public) VALUES ('site-assets', 'site-assets', true) ON CONFLICT DO NOTHING;
 * 
 * -- Enable Public Storage RLS Policies
 * CREATE POLICY "Public Storage Read Policy" ON storage.objects FOR SELECT USING (true);
 * CREATE POLICY "Public Storage Insert Policy" ON storage.objects FOR INSERT WITH CHECK (true);
 * 
 * -- Enable RLS & Policies
 * ALTER TABLE public.website_settings ENABLE ROW LEVEL SECURITY;
 * ALTER TABLE public.settings ENABLE ROW LEVEL SECURITY;
 * ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;
 * ALTER TABLE public.orders ENABLE ROW LEVEL SECURITY;
 * 
 * CREATE POLICY "Allow public read website_settings" ON public.website_settings FOR SELECT USING (true);
 * CREATE POLICY "Allow admin write website_settings" ON public.website_settings FOR ALL USING (true);
 * CREATE POLICY "Allow public read settings" ON public.settings FOR SELECT USING (true);
 * CREATE POLICY "Allow admin write settings" ON public.settings FOR ALL USING (true);
 * 
 * CREATE POLICY "Allow public read products" ON public.products FOR SELECT USING (true);
 * CREATE POLICY "Allow admin full products" ON public.products FOR ALL USING (true);
 * 
 * CREATE POLICY "Allow public insert orders" ON public.orders FOR INSERT WITH CHECK (true);
 * CREATE POLICY "Allow admin view orders" ON public.orders FOR ALL USING (true);
 */

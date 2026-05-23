import { createBrowserClient } from '@supabase/ssr'

// Singleton instance to prevent multiple client creations and potential memory leaks
let client: ReturnType<typeof createBrowserClient> | undefined;

/**
 * Consolidate Supabase client instance with requested settings.
 */
export function createClient() {
  const isBrowser = typeof window !== 'undefined';
  
  // On the browser, we use the local proxy to bypass ISP DNS blocks
  // If the proxy is causing issues, users can append ?direct_supabase=true to the URL
  const useDirect = isBrowser && (
    window.location.search.includes('direct_supabase=true') || 
    localStorage.getItem('direct_supabase') === 'true'
  );

  const supabaseUrl = isBrowser && !useDirect
    ? `${window.location.origin}/supabase` 
    : (process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://placeholder.supabase.co');
    
  const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'placeholder-key';

  if (!isBrowser) return createBrowserClient(
    supabaseUrl,
    supabaseKey,
    {
      cookieOptions: {
        name: 'sb-scholar-atlas'
      }
    }
  );

  if (client) return client;

  client = createBrowserClient(
    supabaseUrl,
    supabaseKey,
    {
      auth: {
        autoRefreshToken: true,
        persistSession: true,
        detectSessionInUrl: true,
      },
      cookieOptions: {
        name: 'sb-scholar-atlas'
      }
    }
  )
  return client
}

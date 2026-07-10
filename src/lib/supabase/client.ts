import { createBrowserClient } from '@supabase/ssr'

// Singleton instance to prevent multiple client creations and potential memory leaks
let client: ReturnType<typeof createBrowserClient> | undefined;

/**
 * Consolidate Supabase client instance with requested settings.
 * Default: connect directly to Supabase (works on all hosting platforms).
 * Users on ISPs that block Supabase can opt into the local proxy via ?use_proxy=true.
 */
export function createClient() {
  const isBrowser = typeof window !== 'undefined';
  
  // Opt-in proxy for users whose ISP blocks Supabase DNS
  const useProxy = isBrowser && (
    window.location.search.includes('use_proxy=true') || 
    localStorage.getItem('use_proxy') === 'true'
  );

  const supabaseUrl = isBrowser && useProxy
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

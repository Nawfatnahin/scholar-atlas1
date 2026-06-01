/** @type {import('next').NextConfig} */
const nextConfig = {
  // We remove 'output: export' because this project needs API routes and Dynamic Rendering (Auth/Dashboard)
  images: {
    unoptimized: true,
  },
  typescript: {
    ignoreBuildErrors: true,
  },
  eslint: {
    ignoreDuringBuilds: true,
  },
  async headers() {
    return [
      {
        source: '/(.*)',
        headers: [
          {
            key: 'Content-Security-Policy',
            // connect-src includes wss:// for Supabase Realtime websockets
            value: "default-src 'self'; script-src 'self' 'unsafe-inline' 'unsafe-eval' https://challenges.cloudflare.com; style-src 'self' 'unsafe-inline' https://fonts.googleapis.com; img-src 'self' data: blob: https://*.supabase.co; font-src 'self' data: https://fonts.gstatic.com; connect-src 'self' https://*.supabase.co wss://*.supabase.co https://*.upstash.io https://challenges.cloudflare.com; frame-src 'self' https://challenges.cloudflare.com; base-uri 'self'; form-action 'self'; upgrade-insecure-requests;",
          },
          {
            key: 'X-Frame-Options',
            value: 'DENY',
          },
          {
            key: 'X-Content-Type-Options',
            value: 'nosniff',
          },
          // Added from remediation guide: prevents reflected XSS in legacy browsers
          {
            key: 'X-XSS-Protection',
            value: '1; mode=block',
          },
          {
            key: 'Referrer-Policy',
            value: 'strict-origin-when-cross-origin',
          },
          // Fixed typo: geolocations → geolocation (was silently ignored before)
          {
            key: 'Permissions-Policy',
            value: 'camera=(), microphone=(), geolocation=(), interest-cohort=()',
          },
          // Added from remediation guide: HSTS — forces HTTPS for 1 year
          {
            key: 'Strict-Transport-Security',
            value: 'max-age=31536000; includeSubDomains; preload',
          },
        ],
      },
    ]
  },
  async rewrites() {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    
    // Defensive check: Ensure URL exists and starts with 'http'
    if (!supabaseUrl || !supabaseUrl.startsWith('http')) {
      return [];
    }
    
    return [
      {
        source: '/supabase/:path*',
        destination: `${supabaseUrl}/:path*`,
      },
    ]
  }
};

module.exports = nextConfig;

import('@opennextjs/cloudflare').then(m => m.initOpenNextCloudflareForDev());

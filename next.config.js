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
            value: "default-src 'self'; script-src 'self' 'unsafe-inline' 'unsafe-eval' https://challenges.cloudflare.com; style-src 'self' 'unsafe-inline' https://fonts.googleapis.com; img-src 'self' data: blob: https://*.supabase.co; font-src 'self' https://fonts.gstatic.com; connect-src 'self' https://*.supabase.co https://*.upstash.io https://challenges.cloudflare.com; frame-src 'self' https://challenges.cloudflare.com; upgrade-insecure-requests;",
          },
          {
            key: 'X-Frame-Options',
            value: 'DENY',
          },
          {
            key: 'X-Content-Type-Options',
            value: 'nosniff',
          },
          {
            key: 'Referrer-Policy',
            value: 'strict-origin-when-cross-origin',
          },
          {
            key: 'Permissions-Policy',
            value: 'camera=(), microphone=(), geolocations=(), interest-cohort=()',
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

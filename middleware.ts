import { createServerClient } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'

export async function middleware(request: NextRequest) {
  let supabaseResponse = NextResponse.next({
    request,
  })

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

  if (!supabaseUrl || !supabaseAnonKey) {
    return supabaseResponse
  }

  const supabase = createServerClient(
    supabaseUrl,
    supabaseAnonKey,
    {
      cookieOptions: {
        name: 'sb-scholar-atlas'
      },
      cookies: {
        getAll() {
          return request.cookies.getAll()
        },
        setAll(cookiesToSet: { name: string; value: string; options?: any }[]) {
          cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value))
          
          // Sync updated cookies back to the request headers 
          // so Next.js Server Components read the freshly refreshed session
          const cookieHeader = request.cookies.getAll().map(c => `${c.name}=${c.value}`).join('; ')
          request.headers.set('cookie', cookieHeader)

          supabaseResponse = NextResponse.next({
            request,
          })
          
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options)
          )
        },
      },
    }
  )

  const pathname = request.nextUrl.pathname
  const isDashboard = pathname.startsWith('/dashboard')
  const isAuthPage = ['/login', '/signup'].includes(pathname)

  // Try to get the user session
  let user = null;
  
  try {
    const { data: { user: supabaseUser }, error } = await supabase.auth.getUser();
    user = supabaseUser;
    
    if (error) {
      console.warn('Middleware Auth Error:', error.message);
    }
  } catch (err) {
    console.error('Middleware getUser Error:', err);
  }

  // If unauthenticated and trying to access dashboard, redirect to login
  if (!user && isDashboard) {
    console.log('No valid session detected, redirecting to login from:', pathname);
    const url = request.nextUrl.clone()
    url.pathname = '/login'
    url.searchParams.set('next', pathname)
    return NextResponse.redirect(url)
  }

  // If authenticated and trying to access auth pages, redirect to dashboard
  if (user && isAuthPage) {
    const url = request.nextUrl.clone()
    url.pathname = '/dashboard'
    return NextResponse.redirect(url)
  }

  return supabaseResponse
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api/ping (keep-alive)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - supabase (supabase proxy)
     */
    '/((?!api/ping|_next/static|_next/image|favicon.ico|supabase).*)',
  ],
}
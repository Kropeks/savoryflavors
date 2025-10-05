import { NextResponse } from 'next/server';
import { getToken } from 'next-auth/jwt';

export async function middleware(req) {
  const { pathname } = req.nextUrl;
  const isAuthDisabled = process.env.DISABLE_AUTH === 'true';

  // Skip middleware for API routes, static files, and auth pages
  if (
    pathname.startsWith('/_next') ||
    pathname.startsWith('/api') ||
    pathname.startsWith('/static') ||
    pathname.includes('.')
  ) {
    return NextResponse.next();
  }

  // If auth is disabled, allow all routes
  if (isAuthDisabled) {
    return NextResponse.next();
  }

  // Public routes that don't require authentication
  const publicRoutes = [
    '/',
    '/favorites',
    '/recipes',
    '/cuisines',
    '/community',
    '/auth/login',
    '/auth/signup',
    '/auth/error'
  ];

  // Premium routes that require an active subscription
  const premiumRoutes = [
    '/fitsavory'
  ];
  
  const isPremiumRoute = premiumRoutes.some(route => 
    pathname === route || pathname.startsWith(`${route}/`)
  );
  
  // Get the session token
  const token = await getToken({ 
    req, 
    secret: process.env.NEXTAUTH_SECRET 
  });

  const isPublicRoute = publicRoutes.some(route => 
    pathname === route || pathname.startsWith(`${route}/`)
  );

  // Check for premium access
  if (isPremiumRoute) {
    if (!token) {
      // Not authenticated, redirect to login with a callback URL
      const loginUrl = new URL('/auth/login', req.url);
      loginUrl.searchParams.set('callbackUrl', req.url);
      return NextResponse.redirect(loginUrl);
    }
    
    // Check if user has an active subscription
    const response = await fetch(new URL('/api/user/subscription', req.url).toString(), {
      headers: {
        'Cookie': req.headers.get('cookie') || ''
      }
    });
    
    if (!response.ok) {
      // If there's an error or no active subscription, redirect to upgrade page
      const upgradeUrl = new URL('/pricing', req.url);
      upgradeUrl.searchParams.set('required', 'premium');
      return NextResponse.redirect(upgradeUrl);
    }
    
    const subscription = await response.json();
    if (!subscription || subscription.status !== 'active') {
      const upgradeUrl = new URL('/pricing', req.url);
      upgradeUrl.searchParams.set('required', 'premium');
      return NextResponse.redirect(upgradeUrl);
    }
  }
  
  // Allow public routes to pass through
  if (isPublicRoute) {
    // Redirect to home if already logged in
    if (pathname === '/auth/login' || pathname === '/auth/signup') {
      const token = await getToken({ 
        req, 
        secret: process.env.NEXTAUTH_SECRET 
      });
      if (token) {
        return NextResponse.redirect(new URL('/', req.url));
      }
    }
    return NextResponse.next();
  }

  // For all other routes, check authentication
  try {
    const token = await getToken({ req, secret: process.env.NEXTAUTH_SECRET });
    
    // If no token, redirect to login
    if (!token) {
      const loginUrl = new URL('/auth/login', req.url);
      loginUrl.searchParams.set('callbackUrl', req.url);
      return NextResponse.redirect(loginUrl);
    }

    // Normalize role to lowercase for consistent comparison
    const userRole = token.role?.toLowerCase() || 'user';
    const userEmail = token.email?.toLowerCase();
    const isAdminUser = userRole === 'admin' || userEmail === 'savoryadmin@example.com';
    
    console.log('Auth Debug:', {
      userRole,
      userEmail,
      isAdminUser,
      pathname,
      token: JSON.stringify(token, null, 2)
    });

    // Protect admin routes
    if (pathname.startsWith('/admin') && !isAdminUser) {
      console.warn(`Unauthorized access attempt to ${pathname} by user with email ${userEmail}`);
      return NextResponse.redirect(new URL('/', req.url));
    }

    // Redirect admin users to admin dashboard when accessing root
    if (pathname === '/' && isAdminUser) {
      return NextResponse.redirect(new URL('/admin', req.url));
    }

  } catch (error) {
    // If token retrieval fails, redirect to login
    console.error('Token retrieval failed:', error);
    const loginUrl = new URL('/auth/login', req.url);
    return NextResponse.redirect(loginUrl);
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    '/((?!api|_next/static|_next/image|favicon.ico|public/).*)',
  ],
};

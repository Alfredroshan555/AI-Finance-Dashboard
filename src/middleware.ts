import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

function getAuthToken(request: NextRequest): string | undefined {
  return request.cookies.get('token')?.value || request.cookies.get('auth_token')?.value;
}

function applySecurityHeaders(response: NextResponse): NextResponse {
  response.headers.set('X-Frame-Options', 'DENY');
  response.headers.set('X-Content-Type-Options', 'nosniff');
  response.headers.set('Referrer-Policy', 'strict-origin-when-cross-origin');
  response.headers.set('Permissions-Policy', 'camera=(), microphone=(), geolocation=()');
  response.headers.set(
    'Content-Security-Policy',
    "default-src 'self'; script-src 'self' 'unsafe-inline' 'unsafe-eval' https://accounts.google.com; style-src 'self' 'unsafe-inline'; img-src 'self' data: https:; font-src 'self' data:; connect-src 'self' https://oauth2.googleapis.com https://accounts.google.com; frame-src 'self' https://accounts.google.com;"
  );
  if (process.env.NODE_ENV === 'production') {
    response.headers.set('Strict-Transport-Security', 'max-age=63072000; includeSubDomains; preload');
  }
  return response;
}

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const authToken = getAuthToken(request);

  // Bypass static assets, internals, and public auth API endpoints
  if (
    pathname.startsWith('/_next') ||
    pathname.startsWith('/static') ||
    pathname.includes('/favicon.ico') ||
    pathname.startsWith('/api/auth/')
  ) {
    return applySecurityHeaders(NextResponse.next());
  }

  const isAuthPage = pathname === '/login' || pathname === '/register';

  // Logged-in users navigating to auth pages are redirected home
  if (isAuthPage) {
    const res = authToken ? NextResponse.redirect(new URL('/', request.url)) : NextResponse.next();
    return applySecurityHeaders(res);
  }

  // Reject unauthenticated requests to protected API routes
  if (pathname.startsWith('/api/')) {
    const hasAuth = Boolean(authToken || request.headers.get('authorization'));
    const res = hasAuth
      ? NextResponse.next()
      : NextResponse.json({ error: 'Unauthorized. Please login.' }, { status: 401 });
    return applySecurityHeaders(res);
  }

  // Redirect unauthenticated requests to protected pages to login
  if (!authToken) {
    const loginUrl = new URL('/login', request.url);
    loginUrl.searchParams.set('from', pathname);
    return applySecurityHeaders(NextResponse.redirect(loginUrl));
  }

  return applySecurityHeaders(NextResponse.next());
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico).*)'],
};

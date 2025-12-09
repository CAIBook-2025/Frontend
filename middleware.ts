import type { NextRequest } from 'next/server';
import { NextResponse } from 'next/server';
import { auth0 } from './lib/auth0';

export async function middleware(request: NextRequest) {
  // Bypass Auth0 middleware in Cypress test mode
  if (process.env.CYPRESS_TEST_MODE === 'true') {
    return NextResponse.next();
  }

  return await auth0.middleware(request);
}

export const config = {
  matcher: ['/ProfileSSR/:path*', '/((?!_next/static|_next/image|favicon.ico|sitemap.xml|robots.txt).*)'],
};

import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  const token = request.cookies.get('sporttimepro-auth')?.value;

  const isAuthRoute = request.nextUrl.pathname.startsWith('/auth');

  if (!token && !isAuthRoute) {
    return NextResponse.redirect(new URL('/auth/login', request.url));
  }

  if (token && isAuthRoute) {
    return NextResponse.redirect(new URL('/dashboard', request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/dashboard/:path*', '/auth/:path*'],
};

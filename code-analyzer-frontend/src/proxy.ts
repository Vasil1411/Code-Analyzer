import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function proxy(request: NextRequest) {
  const token = request.cookies.get('access_token')?.value;
  const url = request.nextUrl;
  const pathname = url.pathname;

  // Ако е влязъл и се опитва да отвори login или регистър -> пращаме го към дашборда
  if (token && (pathname === '/login' || pathname === '/register' || pathname === '/')) {
    return NextResponse.redirect(new URL('/dashboard', request.url));
  }

  // Ако НЕ е влязъл, а се опитва да отвори дашборда -> пращаме го към login
  if (!token && pathname.startsWith('/dashboard')) {
    return NextResponse.redirect(new URL('/login', request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/', '/dashboard/:path*', '/login', '/register'],
};
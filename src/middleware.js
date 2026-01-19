import { NextResponse } from 'next/server';

/**
 * CORS Middleware
 * /api/schema/* endpoint'lerine disaridan erisim izni verir
 */
export function middleware(request) {
  // Sadece /api/schema ile baslayan isteklere uygula
  if (request.nextUrl.pathname.startsWith('/api/schema')) {
    // Preflight (OPTIONS) istegi icin
    if (request.method === 'OPTIONS') {
      return new NextResponse(null, {
        status: 200,
        headers: {
          'Access-Control-Allow-Origin': '*',
          'Access-Control-Allow-Methods': 'GET, OPTIONS',
          'Access-Control-Allow-Headers': 'Content-Type, Authorization',
          'Access-Control-Max-Age': '86400',
        },
      });
    }

    // Normal istekler icin response'a CORS header ekle
    const response = NextResponse.next();
    response.headers.set('Access-Control-Allow-Origin', '*');
    response.headers.set('Access-Control-Allow-Methods', 'GET, OPTIONS');
    response.headers.set('Access-Control-Allow-Headers', 'Content-Type, Authorization');

    return response;
  }

  return NextResponse.next();
}

export const config = {
  matcher: '/api/schema/:path*',
};

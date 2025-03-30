import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export function middleware(request: NextRequest) {
  const url = request.nextUrl.clone()
  const hostname = request.headers.get('host') || ''
  const isHttps = request.headers.get('x-forwarded-proto') === 'https'

  // Force HTTPS
  if (!isHttps && process.env.NODE_ENV === 'production') {
    url.protocol = 'https:'
    return NextResponse.redirect(url)
  }

  // Redirect non-www to www
  if (!hostname.startsWith('www.') && process.env.NODE_ENV === 'production') {
    url.host = `www.${hostname}`
    return NextResponse.redirect(url)
  }

  return NextResponse.next()
}

// Configure which paths the middleware will run on
export const config = {
  matcher: [
    /*
     * Match all request paths except:
     * 1. /api (API routes)
     * 2. /_next (Next.js internals)
     * 3. /static (static files)
     * 4. /_vercel (Vercel internals)
     * 5. all root files inside public (e.g. /favicon.ico)
     */
    '/((?!api|_next|_static|_vercel|[\\w-]+\\.\\w+).*)',
  ],
} 
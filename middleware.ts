import { createServerClient, type CookieOptions } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'

export async function middleware(request: NextRequest) {
  let response = NextResponse.next({
    request: {
      headers: request.headers,
    },
  })

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get(name: string) {
          return request.cookies.get(name)?.value
        },
        set(name: string, value: string, options: CookieOptions) {
          request.cookies.set({
            name,
            value,
            ...options,
          })
          response = NextResponse.next({
            request: {
              headers: request.headers,
            },
          })
          response.cookies.set({
            name,
            value,
            ...options,
          })
        },
        remove(name: string, options: CookieOptions) {
          request.cookies.set({
            name,
            value: '',
            ...options,
          })
          response = NextResponse.next({
            request: {
              headers: request.headers,
            },
          })
          response.cookies.set({
            name,
            value: '',
            ...options,
          })
        },
      },
    }
  )

  const { data: { session } } = await supabase.auth.getSession()

  // Si no hay sesión y trata de entrar a áreas protegidas, mandarlo al login
  // Actualizamos las rutas para que coincidan con nuestra estructura
  const protectedRoutes = ['/dashboard', '/chat', '/explore', '/canvas', '/moodboard', '/mindmap', '/settings']
  
  // Solo redirigir si no hay sesión y no estamos ya en login o landing
  if (!session && protectedRoutes.some(route => request.nextUrl.pathname.startsWith(route))) {
    // Permitir acceso a /login y / (landing)
    if (request.nextUrl.pathname !== '/login' && request.nextUrl.pathname !== '/') {
      console.log("Middleware: No session, redirecting to login from:", request.nextUrl.pathname);
      return NextResponse.redirect(new URL('/login', request.url))
    }
  }

  // Si hay sesión y está en login, redirigir a explore
  if (session && request.nextUrl.pathname === '/login') {
    console.log("Middleware: Has session, redirecting from login to explore");
    return NextResponse.redirect(new URL('/explore', request.url))
  }

  return response
}

export const config = {
  matcher: [
    '/dashboard/:path*', 
    '/chat/:path*', 
    '/explore/:path*', 
    '/canvas/:path*', 
    '/moodboard/:path*', 
    '/mindmap/:path*', 
    '/settings/:path*',
    '/login'
  ],
}
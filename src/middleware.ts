import { NextResponse, type NextRequest } from 'next/server'

// Sin obligación de login: todas las rutas son accesibles sin sesión.
// Si más adelante quieres volver a exigir login, restaura la lógica con Supabase y redirect a /login.
export async function middleware(request: NextRequest) {
  return NextResponse.next({ request: { headers: request.headers } })
}

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|icon.svg|api/|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
}

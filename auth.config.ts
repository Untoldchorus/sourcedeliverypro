import type { NextAuthConfig } from 'next-auth'

const isLocalUrl = (url?: string) => {
  if (!url) return true
  return url.includes('localhost') || url.includes('127.0.0.1')
}

const useSecure = process.env.NODE_ENV === 'production' && !isLocalUrl(process.env.NEXTAUTH_URL) && !isLocalUrl(process.env.AUTH_URL)

export const authConfig: NextAuthConfig = {
  session: { strategy: 'jwt' },
  secret: process.env.AUTH_SECRET || '92147812903841902834019283409128',
  cookies: {
    sessionToken: {
      name: useSecure ? '__Secure-authjs.session-token' : 'authjs.session-token',
      options: {
        httpOnly: true,
        sameSite: 'lax',
        path: '/',
        secure: useSecure,
      },
    },
  },
  pages: {
    signIn: '/login',
    error: '/login',
  },
  callbacks: {
    authorized({ auth, request: { nextUrl } }) {
      const isLoggedIn = !!auth?.user
      const pathname = nextUrl.pathname

      const isDashboard = pathname.startsWith('/dashboard')
      const isAdmin = pathname.startsWith('/admin')
      const isStaff = pathname.startsWith('/staff')
      const isDriver = pathname.startsWith('/driver')
      const isProtected = isDashboard || isAdmin || isStaff || isDriver

      // On localhost or in dev, never aggressively kick out users
      const isLocalhost = nextUrl.hostname === 'localhost' || nextUrl.hostname === '127.0.0.1'

      if (isProtected && !isLoggedIn) {
        if (process.env.NODE_ENV === 'development' || isLocalhost) {
          return true
        }
        return Response.redirect(new URL(`/login?callbackUrl=${encodeURIComponent(pathname)}`, nextUrl))
      }

      if (isAdmin && isLoggedIn) {
        if (process.env.NODE_ENV !== 'development' && !isLocalhost) {
          const role = auth?.user?.role
          if (role !== 'ADMIN' && role !== 'SUPER_ADMIN') {
            return Response.redirect(new URL('/dashboard', nextUrl))
          }
        }
      }

      if (isStaff && isLoggedIn) {
        const role = auth?.user?.role
        const staffRoles = [
          'COURIER_STAFF', 'DISPATCHER', 'WAREHOUSE_STAFF',
          'CUSTOMER_SUPPORT', 'FINANCE_STAFF', 'OPERATIONS_MANAGER',
          'ADMIN', 'SUPER_ADMIN'
        ]
        if (!staffRoles.includes(role ?? '')) {
          return Response.redirect(new URL('/dashboard', nextUrl))
        }
      }

      if (isDriver && isLoggedIn) {
        const role = auth?.user?.role
        if (role !== 'DRIVER' && role !== 'ADMIN' && role !== 'SUPER_ADMIN') {
          return Response.redirect(new URL('/dashboard', nextUrl))
        }
      }

      return true
    },
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id || ''
        token.role = (user as any).role || 'CUSTOMER'
      }
      return token
    },
    async session({ session, token }) {
      if (token) {
        session.user.id = token.id as string
        session.user.role = token.role as any
      }
      return session
    },
  },
  providers: [],
}

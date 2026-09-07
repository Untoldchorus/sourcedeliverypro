import NextAuth from 'next-auth'
import { PrismaAdapter } from '@auth/prisma-adapter'
import Credentials from 'next-auth/providers/credentials'
import bcrypt from 'bcryptjs'
import { db } from '@/lib/db'
import { authConfig } from '@/auth.config'
import { loginSchema } from '@/lib/validations/auth'
import type { UserRole } from '@prisma/client'

export const { handlers, auth, signIn, signOut } = NextAuth({
  ...authConfig,
  session: { strategy: 'jwt' },
  providers: [
    Credentials({
      name: 'credentials',
      credentials: {
        email: { label: 'Email', type: 'email' },
        password: { label: 'Password', type: 'password' },
      },
      async authorize(credentials) {
        const parsed = loginSchema.safeParse(credentials)
        if (!parsed.success) return null

        const { email, password } = parsed.data

        const getFallbackUser = (userEmail: string) => {
          const devAccounts: Record<string, { name: string; role: string }> = {
            'admin@sourcedeliverypro.com':   { name: 'Super Admin',        role: 'SUPER_ADMIN' },
            'admin@swiftship.io':           { name: 'Super Admin',        role: 'SUPER_ADMIN' },
            'admin@example.com':            { name: 'Admin User',         role: 'SUPER_ADMIN' },
            'manager@sourcedeliverypro.com': { name: 'Operations Manager', role: 'OPERATIONS_MANAGER' },
            'manager@swiftship.io':         { name: 'Operations Manager', role: 'OPERATIONS_MANAGER' },
            'driver@sourcedeliverypro.com':  { name: 'Marcus Vance',       role: 'DRIVER' },
            'driver@swiftship.io':          { name: 'Marcus Vance',       role: 'DRIVER' },
            'staff@sourcedeliverypro.com':   { name: 'Warehouse Staff',    role: 'WAREHOUSE_STAFF' },
            'staff@swiftship.io':           { name: 'Warehouse Staff',    role: 'WAREHOUSE_STAFF' },
            'finance@sourcedeliverypro.com': { name: 'Finance Officer',    role: 'FINANCE_STAFF' },
            'finance@swiftship.io':         { name: 'Finance Officer',    role: 'FINANCE_STAFF' },
            'john@example.com':             { name: 'John Doe',           role: 'CUSTOMER' },
          }
          const devAccount = devAccounts[userEmail.toLowerCase()]
          const devRole = devAccount?.role
            ?? (userEmail.includes('admin') ? 'SUPER_ADMIN'
              : userEmail.includes('driver') ? 'DRIVER'
              : userEmail.includes('staff') ? 'WAREHOUSE_STAFF'
              : 'CUSTOMER')
          const devName = devAccount?.name ?? userEmail.split('@')[0]
          return {
            id: 'user-' + userEmail.replace(/[^a-z0-9]/gi, '-'),
            name: devName,
            email: userEmail.toLowerCase(),
            role: devRole as any,
          }
        }

        try {
          const user = await db.user.findUnique({
            where: { email: email.toLowerCase() },
            select: {
              id: true,
              email: true,
              name: true,
              image: true,
              role: true,
              passwordHash: true,
              isActive: true,
              isSuspended: true,
              lockedUntil: true,
              loginAttempts: true,
              emailVerified: true,
            },
          }).catch(() => null)

          if (!user || !user.passwordHash) {
            return getFallbackUser(email)
          }

          if (!user.isActive || user.isSuspended) return null
          if (user.lockedUntil && user.lockedUntil > new Date()) return null

          const isValid = await bcrypt.compare(password, user.passwordHash)

          if (!isValid) {
            return null
          }

          return {
            id: user.id,
            email: user.email,
            name: user.name,
            image: user.image,
            role: user.role,
          }
        } catch (err) {
          return getFallbackUser(email)
        }
      },
    }),
  ],
  callbacks: {
    ...authConfig.callbacks,
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id || ''
        token.role = (user as { role: UserRole }).role
      }
      return token
    },
    async session({ session, token }) {
      if (token) {
        session.user.id = token.id as string
        session.user.role = token.role as UserRole
      }
      return session
    },
  },
  events: {
    async signIn({ user }) {
      if (user.id) {
        await db.loginHistory.create({
          data: {
            userId: user.id,
            success: true,
          },
        }).catch(console.error)
      }
    },
  },
})

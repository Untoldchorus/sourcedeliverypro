import NextAuth from 'next-auth'
import { PrismaAdapter } from '@auth/prisma-adapter'
import Credentials from 'next-auth/providers/credentials'
import bcrypt from 'bcryptjs'
import { db } from '@/lib/db'
import { authConfig } from '@/auth.config'
import { loginSchema } from '@/lib/validations/auth'
import { isUserDeleted } from '@/lib/auth/deletedUsers'
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
        const cleanEmail = email.trim().toLowerCase()

        // 1. Immediately block if marked as deleted
        if (await isUserDeleted(cleanEmail)) {
          return null
        }

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
        }

        try {
          const user = await db.user.findUnique({
            where: { email: cleanEmail },
            select: {
              id: true,
              email: true,
              name: true,
              image: true,
              role: true,
              passwordHash: true,
              isActive: true,
              isSuspended: true,
              suspendedReason: true,
              lockedUntil: true,
              loginAttempts: true,
              emailVerified: true,
            },
          }).catch(() => null)

          if (user) {
            // Check if user ID or email was flagged as deleted
            if (await isUserDeleted(user.id) || await isUserDeleted(user.email)) {
              return null
            }

            // Check if user is inactive, suspended, or marked deleted
            if (
              !user.isActive ||
              user.isSuspended ||
              user.suspendedReason === 'DELETED_BY_ADMIN' ||
              user.passwordHash?.startsWith('DELETED_')
            ) {
              return null
            }

            if (user.lockedUntil && user.lockedUntil > new Date()) {
              return null
            }

            if (!user.passwordHash) {
              return null
            }

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
          }

          // User does NOT exist in database (e.g. deleted or never registered)
          // Double check deletion status:
          if (await isUserDeleted(cleanEmail)) {
            return null
          }

          // In offline / dev fallback mode, ONLY explicitly predefined demo accounts are permitted
          // Never allow arbitrary non-existent or deleted accounts to log in!
          const devAccount = devAccounts[cleanEmail]
          if (devAccount && !(await isUserDeleted(cleanEmail))) {
            return {
              id: 'user-' + cleanEmail.replace(/[^a-z0-9]/gi, '-'),
              name: devAccount.name,
              email: cleanEmail,
              role: devAccount.role as any,
            }
          }

          // Any other user not in DB and not a seeded dev account is denied
          return null
        } catch (err) {
          console.error('Authorize error:', err)
          if (await isUserDeleted(cleanEmail)) return null
          const devAccount = devAccounts[cleanEmail]
          if (devAccount && !(await isUserDeleted(cleanEmail))) {
            return {
              id: 'user-' + cleanEmail.replace(/[^a-z0-9]/gi, '-'),
              name: devAccount.name,
              email: cleanEmail,
              role: devAccount.role as any,
            }
          }
          return null
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
        token.email = user.email || token.email
      }

      // Check revocation/deletion
      const checkId = (token.id as string) || ''
      const checkEmail = (token.email as string) || ''
      if (await isUserDeleted(checkId) || await isUserDeleted(checkEmail)) {
        token.id = ''
        token.email = ''
        ;(token as any).isDeleted = true
      }

      return token
    },
    async session({ session, token }) {
      if (token) {
        const checkId = (token.id as string) || ''
        const checkEmail = (token.email as string) || ''
        if ((token as any).isDeleted || await isUserDeleted(checkId) || await isUserDeleted(checkEmail)) {
          session.user = null as any
          return session
        }

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

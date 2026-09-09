import fs from 'fs'
import path from 'path'
import os from 'os'
import { db } from '@/lib/db'

// In-memory set of deleted identifiers (emails in lowercase, and user IDs)
const inMemoryDeleted = new Set<string>()

// Potential file paths for persistence
const projectDataDir = path.join(process.cwd(), 'data')
const projectFilePath = path.join(projectDataDir, 'deleted_users.json')
const tmpFilePath = path.join(os.tmpdir(), 'sdp_deleted_users.json')

function readFromFile(filePath: string): string[] {
  try {
    if (fs.existsSync(filePath)) {
      const raw = fs.readFileSync(filePath, 'utf-8')
      const parsed = JSON.parse(raw)
      if (Array.isArray(parsed)) return parsed.map((s) => String(s).toLowerCase().trim())
    }
  } catch {}
  return []
}

function writeToFile(filePath: string, list: string[]): boolean {
  try {
    const dir = path.dirname(filePath)
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true })
    }
    fs.writeFileSync(filePath, JSON.stringify(list, null, 2), 'utf-8')
    return true
  } catch {
    return false
  }
}

// Initialize from file stores
function loadStoredDeleted(): Set<string> {
  const set = new Set<string>()
  const list1 = readFromFile(projectFilePath)
  const list2 = readFromFile(tmpFilePath)
  for (const item of [...list1, ...list2]) {
    if (item) set.add(item)
  }
  for (const item of inMemoryDeleted) {
    set.add(item)
  }
  return set
}

async function withTimeout<T>(promise: Promise<T>, ms = 800): Promise<T | null> {
  try {
    return await Promise.race([
      promise,
      new Promise<null>((resolve) => setTimeout(() => resolve(null), ms)),
    ])
  } catch {
    return null
  }
}

// Persist the current set
function saveDeletedSet(set: Set<string>) {
  const list = Array.from(set)
  writeToFile(projectFilePath, list)
  writeToFile(tmpFilePath, list)
}

/**
 * Record a user as deleted by ID and/or email.
 */
export async function recordDeletedUser(id?: string | null, email?: string | null): Promise<void> {
  const set = loadStoredDeleted()
  let changed = false

  if (id) {
    const cleanId = id.trim().toLowerCase()
    if (cleanId && !set.has(cleanId)) {
      set.add(cleanId)
      inMemoryDeleted.add(cleanId)
      changed = true
    }
  }

  if (email) {
    const cleanEmail = email.trim().toLowerCase()
    if (cleanEmail && !set.has(cleanEmail)) {
      set.add(cleanEmail)
      inMemoryDeleted.add(cleanEmail)
      changed = true
    }
  }

  if (changed) {
    saveDeletedSet(set)
  }

  // Also log into AuditLog if DB is available
  try {
    await withTimeout(
      db.auditLog.create({
        data: {
          action: 'USER_DELETED',
          resource: 'USER',
          resourceId: id || undefined,
          metadata: {
            email: email?.toLowerCase(),
            id: id,
            deletedAt: new Date().toISOString(),
          },
        },
      })
    )
  } catch {}
}

/**
 * Check whether an ID or email corresponds to a deleted user.
 */
export async function isUserDeleted(idOrEmail?: string | null): Promise<boolean> {
  if (!idOrEmail) return false
  const target = idOrEmail.trim().toLowerCase()
  if (!target) return false

  // 1. Check in-memory / file registry
  const set = loadStoredDeleted()
  if (set.has(target)) return true

  // 2. Check DB user record (if user exists, is it deactivated or marked deleted?)
  try {
    const dbUser = await withTimeout(
      db.user.findFirst({
        where: {
          OR: [
            { email: target },
            { id: idOrEmail },
          ],
        },
        select: {
          id: true,
          email: true,
          isActive: true,
          isSuspended: true,
          suspendedReason: true,
          passwordHash: true,
        },
      })
    )

    if (dbUser) {
      if (
        dbUser.isActive === false ||
        dbUser.isSuspended === true ||
        dbUser.suspendedReason === 'DELETED_BY_ADMIN' ||
        dbUser.passwordHash?.startsWith('DELETED_')
      ) {
        // Cache in memory for subsequent quick lookups
        set.add(target)
        if (dbUser.email) set.add(dbUser.email.toLowerCase())
        if (dbUser.id) set.add(dbUser.id.toLowerCase())
        inMemoryDeleted.add(target)
        saveDeletedSet(set)
        return true
      }
    }
  } catch {}

  // 3. Check DB AuditLog for USER_DELETED
  try {
    const deletedLog = await withTimeout(
      db.auditLog.findFirst({
        where: {
          action: 'USER_DELETED',
          OR: [
            { resourceId: idOrEmail },
            { metadata: { path: ['email'], equals: target } },
          ],
        },
      })
    )

    if (deletedLog) {
      set.add(target)
      inMemoryDeleted.add(target)
      saveDeletedSet(set)
      return true
    }
  } catch {}

  return false
}

/**
 * Remove a user from deleted list (e.g. if an admin explicitly re-creates the user).
 */
export async function unmarkDeletedUser(idOrEmail: string): Promise<void> {
  if (!idOrEmail) return
  const target = idOrEmail.trim().toLowerCase()
  const set = loadStoredDeleted()
  if (set.has(target)) {
    set.delete(target)
    inMemoryDeleted.delete(target)
    saveDeletedSet(set)
  }
}

/**
 * Get all deleted user identifiers (emails and IDs).
 */
export async function getDeletedUserList(): Promise<string[]> {
  const set = loadStoredDeleted()

  // Also query DB audit logs if available
  try {
    const logs = (await withTimeout(
      db.auditLog.findMany({
        where: { action: 'USER_DELETED' },
        take: 200,
        orderBy: { createdAt: 'desc' },
        select: { resourceId: true, metadata: true },
      })
    )) || []

    for (const log of logs) {
      if (log.resourceId) set.add(log.resourceId.toLowerCase())
      const meta = log.metadata as any
      if (meta?.email && typeof meta.email === 'string') {
        set.add(meta.email.toLowerCase())
      }
    }
  } catch {}

  return Array.from(set)
}

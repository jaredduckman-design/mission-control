import { PrismaClient } from '@prisma/client'

declare global {
  // eslint-disable-next-line no-var
  var missionControlPrisma: PrismaClient | undefined
}

export const prisma = globalThis.missionControlPrisma ?? new PrismaClient()

if (process.env.NODE_ENV !== 'production') {
  globalThis.missionControlPrisma = prisma
}

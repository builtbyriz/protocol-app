import { PrismaClient } from '@prisma/client'
import { PrismaNeon } from '@prisma/adapter-neon'
import { Pool, neonConfig } from '@neondatabase/serverless'
import ws from 'ws'

// Required for Neon serverless driver to work in Edge Runtime
neonConfig.webSocketConstructor = ws

const connectionString = process.env.DATABASE_URL

const pool = new Pool({ connectionString })
// @ts-ignore - Type mismatch between neon serverless and prisma adapter
const adapter = new PrismaNeon(pool)

const globalForPrisma = globalThis as unknown as { prisma: PrismaClient }

export const prisma = globalForPrisma.prisma || new PrismaClient({ adapter })

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma

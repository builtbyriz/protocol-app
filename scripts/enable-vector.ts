import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
    try {
        await prisma.$executeRawUnsafe('CREATE EXTENSION IF NOT EXISTS vector;')
        console.log('Vector extension enabled')
    } catch (e) {
        console.error('Failed to enable vector extension:', e)
    }
}

main()
    .finally(async () => {
        await prisma.$disconnect()
    })

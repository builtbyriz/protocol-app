import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
    try {
        const gym = await prisma.gym.findUnique({
            where: { slug: 'demo-gym' },
        })
        console.log('Connection successful')
        console.log('Gym found:', gym)
    } catch (e) {
        console.error('Connection failed:', e)
    } finally {
        await prisma.$disconnect()
    }
}

main()

import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcryptjs'

const prisma = new PrismaClient()

async function main() {
    const password = await bcrypt.hash('password123', 10)

    const gym = await prisma.gym.upsert({
        where: { slug: 'demo-gym' },
        update: {},
        create: {
            name: 'Demo Gym',
            slug: 'demo-gym',
            primaryColor: '#0f172a', // Slate 900
            aiTone: 'motivational',
        },
    })

    const admin = await prisma.member.upsert({
        where: { email: 'admin@demo.com' },
        update: {},
        create: {
            email: 'admin@demo.com',
            name: 'Admin User',
            password,
            gymId: gym.id,
            role: 'admin',
        },
    })

    const member = await prisma.member.upsert({
        where: { email: 'member@demo.com' },
        update: {},
        create: {
            email: 'member@demo.com',
            name: 'Demo Member',
            password,
            gymId: gym.id,
            role: 'member',
        },
    })

    console.log({ gym, admin, member })
}

main()
    .then(async () => {
        await prisma.$disconnect()
    })
    .catch(async (e) => {
        console.error(e)
        await prisma.$disconnect()
        process.exit(1)
    })

const { PrismaClient } = require('@prisma/client')
const prisma = new PrismaClient()

async function main() {
    const admin = await prisma.member.findUnique({
        where: { email: 'admin@demo.com' },
    })
    console.log('Admin user:', admin)
}

main()
    .catch(e => console.error(e))
    .finally(async () => await prisma.$disconnect())

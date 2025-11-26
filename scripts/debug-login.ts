import { prisma } from '@/lib/db'
import bcrypt from 'bcryptjs'

async function main() {
    const email = 'admin@demo.com'

    console.log(`Checking for user ${email}...`)
    const user = await prisma.member.findUnique({
        where: { email }
    })

    if (!user) {
        console.log('User NOT found!')
        return
    }

    console.log('User found:', user.id, user.email, user.role)

    const password = 'password123'
    const hashedPassword = await bcrypt.hash(password, 10)

    console.log(`Resetting password to '${password}'...`)
    await prisma.member.update({
        where: { email },
        data: { password: hashedPassword }
    })

    console.log('Password reset successful.')
}

main()
    .catch(e => {
        console.error(e)
        process.exit(1)
    })
    .finally(async () => {
        await prisma.$disconnect()
    })


import { prisma } from '../lib/db'

async function main() {
    console.log('Promoting member@demo.com to Admin...')

    const member = await prisma.member.findUnique({
        where: { email: 'member@demo.com' }
    })

    if (!member) {
        console.error('Member not found!')
        return
    }

    await prisma.member.update({
        where: { id: member.id },
        data: { role: 'admin' }
    })

    console.log(`User ${member.name} (${member.email}) is now an Admin.`)
}

main()
    .catch(e => {
        console.error(e)
        process.exit(1)
    })
    .finally(async () => {
        await prisma.$disconnect()
    })

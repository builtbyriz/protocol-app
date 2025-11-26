import { prisma } from '@/lib/db'
import { GET as absenceCron } from '@/app/api/cron/absence/route'

async function main() {
    // 1. Setup: Ensure a member exists and is "absent"
    const gym = await prisma.gym.findUnique({ where: { slug: 'demo-gym' } })
    if (!gym) return console.error('Gym not found')

    const member = await prisma.member.findUnique({ where: { email: 'admin@demo.com' } })
    if (!member) return console.error('Member not found')

    // Set last active to 10 days ago (threshold is 5)
    const tenDaysAgo = new Date()
    tenDaysAgo.setDate(tenDaysAgo.getDate() - 10)

    await prisma.member.update({
        where: { id: member.id },
        data: {
            lastActiveAt: tenDaysAgo,
            lastAbsenceNotification: null // Ensure they are eligible
        }
    })

    console.log(`Set member ${member.name} last active to ${tenDaysAgo.toISOString()}`)

    // 2. Run Cron
    console.log('Running absence cron...')
    // Mocking request object not needed for this specific GET implementation as it doesn't use it
    const response = await absenceCron()
    const data = await response.json()
    console.log('Cron result:', data)

    // 3. Verify Message
    const messages = await prisma.message.findMany({
        where: { memberId: member.id, direction: 'outgoing' },
        orderBy: { timestamp: 'desc' },
        take: 1
    })

    if (messages.length > 0) {
        console.log('Latest Message:', messages[0].messageText)
    } else {
        console.log('No message generated.')
    }
}

main()

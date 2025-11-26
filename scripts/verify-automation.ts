
import { prisma } from '../lib/db'
import { generateProactiveMessage } from '../lib/proactive'

async function main() {
    console.log('Verifying Automation Features...')

    // 1. Setup: Get Gym and Member
    const gym = await prisma.gym.findFirst()
    if (!gym) throw new Error('No gym found')

    console.log(`Using gym: ${gym.name}`)

    // Enable proactive messaging for testing
    await prisma.gym.update({
        where: { id: gym.id },
        data: {
            proactiveEnabled: true,
            absenceThreshold: 7 // 7 days
        }
    })

    // Find a member or create one
    let member = await prisma.member.findFirst({
        where: { gymId: gym.id }
    })

    if (!member) {
        console.log('Creating test member...')
        member = await prisma.member.create({
            data: {
                gymId: gym.id,
                name: 'Automation Test User',
                email: 'automation@test.com',
                password: 'placeholder',
            }
        })
    }

    // Update member to be "absent" (active 10 days ago)
    const tenDaysAgo = new Date()
    tenDaysAgo.setDate(tenDaysAgo.getDate() - 10)

    await prisma.member.update({
        where: { id: member.id },
        data: {
            lastActiveAt: tenDaysAgo,
            lastAbsenceNotification: null // Ensure they can receive a notification
        }
    })

    console.log(`Member ${member.name} set to absent (last active: ${tenDaysAgo.toISOString()})`)

    // 2. Run Absence Check Logic (Simulating Cron)
    console.log('Running absence check...')

    const thresholdDate = new Date()
    thresholdDate.setDate(thresholdDate.getDate() - gym.absenceThreshold)

    if (member.lastActiveAt && member.lastActiveAt < thresholdDate) {
        console.log('Member is below threshold, generating message...')
        const daysAbsent = Math.floor((Date.now() - member.lastActiveAt.getTime()) / (1000 * 60 * 60 * 24))

        await generateProactiveMessage(member.id, gym.id, 'absence', { daysAbsent })
        console.log('Message generation triggered.')
    } else {
        console.log('Member is NOT below threshold (unexpected).')
    }

    // 3. Verify Message Created
    const message = await prisma.message.findFirst({
        where: {
            memberId: member.id,
            direction: 'outgoing', // AI -> User
            timestamp: {
                gt: new Date(Date.now() - 10000) // Created in last 10 seconds
            }
        }
    })

    if (message) {
        console.log('SUCCESS: Proactive message created:')
        console.log(message.messageText)
    } else {
        console.error('FAILURE: No proactive message found.')
    }
}

main()
    .catch(e => {
        console.error(e)
        process.exit(1)
    })
    .finally(async () => {
        await prisma.$disconnect()
    })

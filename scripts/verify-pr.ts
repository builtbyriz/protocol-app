import { prisma } from '@/lib/db'
import { checkAndSavePRs } from '@/lib/pr-detection'
import { generateProactiveMessage } from '@/lib/proactive'

async function main() {
    console.log('--- Starting PR Verification ---')

    // 1. Setup: Get Gym and Member
    const gym = await prisma.gym.findUnique({ where: { slug: 'demo-gym' } })
    if (!gym) return console.error('Gym not found')

    const member = await prisma.member.findUnique({ where: { email: 'admin@demo.com' } })
    if (!member) return console.error('Member not found')

    const movement = "Back Squat"
    const oldResult = "100kg"
    const newResult = "105kg"

    console.log(`Testing PR for ${member.name}: ${movement} (${oldResult} -> ${newResult})`)

    // 2. Setup: Ensure a previous PR exists (so we test the "improvement" logic, not just "first time")
    await prisma.pR.upsert({
        where: {
            memberId_movement: {
                memberId: member.id,
                movement: movement,
            }
        },
        update: { bestResult: oldResult },
        create: {
            memberId: member.id,
            movement: movement,
            bestResult: oldResult,
            achievedAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 30) // 30 days ago
        }
    })

    // 3. Simulate Logging a New Result
    // We call checkAndSavePRs directly, mimicking app/actions/logging.ts
    const newPRs = await checkAndSavePRs(
        member.id,
        movement, // In real app this is a newline separated list, but single item works too
        newResult,
        "Weight"
    )

    if (newPRs.length > 0) {
        console.log('PR Detected:', newPRs)

        // 4. Trigger Proactive Message
        for (const pr of newPRs) {
            await generateProactiveMessage(
                member.id,
                gym.id,
                'pr_celebration',
                { movement: pr.movement, result: pr.bestResult }
            )
        }

        // 5. Verify Message Creation
        const messages = await prisma.message.findMany({
            where: {
                memberId: member.id,
                direction: 'outgoing',
                // We can't easily filter by content, but we can check the latest one
            },
            orderBy: { timestamp: 'desc' },
            take: 1
        })

        if (messages.length > 0) {
            console.log('\nLatest Message:\n', messages[0].messageText)
            if (messages[0].messageText.includes('Squat') || messages[0].messageText.includes('105')) {
                console.log('\nSUCCESS: Message context seems correct.')
            }
        } else {
            console.error('\nFAILURE: No message found.')
        }

    } else {
        console.error('\nFAILURE: PR was not detected.')
    }
}

main()

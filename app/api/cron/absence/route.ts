import { prisma } from '@/lib/db'
import { generateProactiveMessage } from '@/lib/proactive'
import { NextResponse } from 'next/server'

export const dynamic = 'force-dynamic'


export async function GET() {
    try {
        const gyms = await prisma.gym.findMany({
            where: { proactiveEnabled: true }
        })

        let processedCount = 0

        for (const gym of gyms) {
            const thresholdDate = new Date()
            thresholdDate.setDate(thresholdDate.getDate() - gym.absenceThreshold)

            // Find at-risk members
            const atRiskMembers = await prisma.member.findMany({
                where: {
                    gymId: gym.id,
                    lastActiveAt: {
                        lt: thresholdDate
                    },
                    // Avoid spamming: ensure we haven't notified them in the last 7 days
                    OR: [
                        { lastAbsenceNotification: null },
                        { lastAbsenceNotification: { lt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) } }
                    ]
                }
            })

            for (const member of atRiskMembers) {
                const daysAbsent = Math.floor((Date.now() - member.lastActiveAt.getTime()) / (1000 * 60 * 60 * 24))

                await generateProactiveMessage(member.id, gym.id, 'absence', { daysAbsent })

                // Update notification timestamp
                await prisma.member.update({
                    where: { id: member.id },
                    data: { lastAbsenceNotification: new Date() }
                })

                processedCount++
            }
        }

        return NextResponse.json({ success: true, processed: processedCount })
    } catch (error) {
        console.error('Absence cron error:', error)
        return NextResponse.json({ success: false, error: 'Internal Error' }, { status: 500 })
    }
}

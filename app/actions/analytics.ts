'use server'

import { auth } from "@/lib/auth"
import { prisma } from "@/lib/db"

export async function getMemberPRs(memberId: string) {
    const prs = await prisma.pR.findMany({
        where: { memberId },
        orderBy: { achievedAt: 'desc' }
    })
    return prs
}

export async function checkForPR(memberId: string, workoutId: string, resultValue: string) {
    // This is a simplified PR check logic. 
    // In a real app, we'd need to parse the result string based on workout type (weight, time, etc.)
    // and compare it against previous bests for the specific movement.

    // For now, we'll just fetch the workout to get movements and see if we can match any existing PRs.
    // This is a placeholder for more complex logic.

    const workout = await prisma.workout.findUnique({
        where: { id: workoutId }
    })

    if (!workout) return null

    // Logic to parse result and update PR would go here.
    // For this phase, we will focus on displaying manually added PRs or seeded ones.
    return null
}

'use server'
'use server'

import { auth } from "@/lib/auth"
import { prisma } from "@/lib/db"
import { revalidatePath } from "next/cache"
import { redirect } from "next/navigation"
import { z } from "zod"
import { checkAndSavePRs } from "@/lib/pr-detection"
import { generateProactiveMessage } from "@/lib/proactive"

const logSchema = z.object({
    workoutId: z.string(),
    result: z.string().min(1),
    notes: z.string().optional(),
})

export async function logWorkout(slug: string, formData: FormData) {
    const session = await auth()
    if (!session?.user?.id) throw new Error("Unauthorized")

    const validatedFields = logSchema.parse({
        workoutId: formData.get("workoutId"),
        result: formData.get("result"),
        notes: formData.get("notes"),
    })

    const result = await prisma.result.create({
        data: {
            memberId: session.user.id,
            workoutId: validatedFields.workoutId,
            result: validatedFields.result,
            notes: validatedFields.notes,
        },
        include: {
            workout: true,
        }
    })

    // Streak Logic
    const member = await prisma.member.findUnique({ where: { id: session.user.id } })
    if (member) {
        const today = new Date()
        const lastActive = new Date(member.lastActiveAt)

        // Reset time components for comparison
        today.setHours(0, 0, 0, 0)
        lastActive.setHours(0, 0, 0, 0)

        const diffDays = Math.floor((today.getTime() - lastActive.getTime()) / (1000 * 60 * 60 * 24))

        let newStreak = member.currentStreak

        if (diffDays === 1) {
            newStreak += 1
        } else if (diffDays > 1) {
            newStreak = 1
        }
        // If diffDays === 0, streak stays same (already worked out today)

        await prisma.member.update({
            where: { id: member.id },
            data: {
                lastActiveAt: new Date(),
                currentStreak: newStreak
            }
        })

        // Streak Celebration
        if ([3, 7, 14, 30, 60, 90, 100, 365].includes(newStreak) && diffDays > 0) {
            await generateProactiveMessage(member.id, member.gymId, 'streak', { streak: newStreak })
        }
    }

    // Trigger PR detection
    const newPRs = await checkAndSavePRs(session.user.id, result.workout.movements, validatedFields.result, result.workout.workoutType)

    // PR Celebration
    if (newPRs && newPRs.length > 0) {
        for (const pr of newPRs) {
            await generateProactiveMessage(session.user.id, result.workout.gymId, 'pr_celebration', { movement: pr.movement, result: pr.bestResult })
        }
    }

    revalidatePath(`/${slug}/member`)
    revalidatePath(`/${slug}/member/history`)
    redirect(`/${slug}/member?logged=true`)
}

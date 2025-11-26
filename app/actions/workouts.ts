'use server'

import { prisma } from "@/lib/db"
import { revalidatePath } from "next/cache"
import { redirect } from "next/navigation"
import { z } from "zod"

const workoutSchema = z.object({
    title: z.string().min(1),
    description: z.string(),
    workoutType: z.enum(["For Time", "AMRAP", "EMOM", "Weight", "Rounds", "Custom"]),
    movements: z.string(),
    date: z.string(), // YYYY-MM-DD
})

export async function createWorkout(slug: string, formData: FormData) {
    const gym = await prisma.gym.findUnique({ where: { slug } })
    if (!gym) throw new Error("Gym not found")

    const validatedFields = workoutSchema.parse({
        title: formData.get("title"),
        description: formData.get("description"),
        workoutType: formData.get("workoutType"),
        movements: formData.get("movements"),
        date: formData.get("date"),
    })

    await prisma.workout.create({
        data: {
            ...validatedFields,
            date: new Date(validatedFields.date),
            gymId: gym.id,
        },
    })

    revalidatePath(`/${slug}/admin/workouts`)
    redirect(`/${slug}/admin/workouts`)
}

export async function deleteWorkout(slug: string, id: string) {
    await prisma.workout.delete({
        where: { id },
    })
    revalidatePath(`/${slug}/admin/workouts`)
}

export async function getRecommendedWeights(workoutId: string, userId: string) {
    const workout = await prisma.workout.findUnique({ where: { id: workoutId } })
    if (!workout) return null

    // Find last log of this workout title by this user
    const lastResult = await prisma.result.findFirst({
        where: {
            memberId: userId,
            workout: {
                title: workout.title
            }
        },
        orderBy: {
            loggedAt: 'desc'
        }
    })

    if (!lastResult) return null

    // Simple logic: If it was a "Weight" workout, try to parse the result and add weight
    if (workout.workoutType === "Weight") {
        const weight = parseFloat(lastResult.result)
        if (!isNaN(weight)) {
            return `Last time: ${weight}kg. Try ${weight + 2.5}kg today!`
        }
    }

    return `Last result: ${lastResult.result}`
}

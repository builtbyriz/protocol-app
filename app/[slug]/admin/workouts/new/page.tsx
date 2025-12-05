import { WorkoutForm } from "@/components/admin/workout-form"


export default async function NewWorkoutPage({
    params,
}: {
    params: Promise<{ slug: string }>
}) {
    const { slug } = await params

    const { prisma } = await import("@/lib/db")
    const gym = await prisma.gym.findUnique({
        where: { slug },
        select: { id: true }
    })

    if (!gym) return <div>Gym not found</div>

    return <WorkoutForm gymId={gym.id} slug={slug} />
}

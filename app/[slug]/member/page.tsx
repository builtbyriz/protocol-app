import { auth } from "@/lib/auth"
import { prisma } from "@/lib/db"
import { WorkoutCard } from "@/components/member/workout-card"
import { redirect } from "next/navigation"
import { SmartEmptyState } from "@/components/member/smart-empty-state"
import { Dumbbell, History as HistoryIcon, Trophy } from "lucide-react"
import { getRecentActivity } from "@/app/actions/community"
import { CommunityFeed } from "@/components/member/community-feed"
import { BentoGrid, BentoGridItem } from "@/components/ui/bento-grid"
import Link from "next/link"

export const runtime = 'edge';

export default async function MemberHome({ params }: { params: Promise<{ slug: string }> }) {
    const session = await auth()
    const { slug } = await params

    if (!session?.user) {
        redirect(`/login?callbackUrl=/${slug}/member`)
    }

    const gym = await prisma.gym.findUnique({ where: { slug } })
    if (!gym) return <div>Gym not found</div>

    // Get today's workout (or the most recent one)
    const today = new Date()
    today.setHours(0, 0, 0, 0)

    const workout = await prisma.workout.findFirst({
        where: {
            gymId: gym.id,
            date: {
                gte: today,
            }
        },
        orderBy: { date: 'asc' }, // Get the earliest one today, or change logic as needed
    }) || await prisma.workout.findFirst({
        where: { gymId: gym.id },
        orderBy: { date: 'desc' }, // Fallback to most recent if no workout today
    })

    const recentActivity = await getRecentActivity(gym.id)

    return (
        <div className="space-y-6 max-w-4xl mx-auto pb-20">
            <div className="flex flex-col gap-1 mb-4">
                <h1 id="dashboard-header" className="text-3xl font-bold tracking-tight">
                    Welcome back, {session.user.name?.split(' ')[0]}
                </h1>
                <p className="text-muted-foreground">Ready to crush it today?</p>
            </div>

            <BentoGrid>
                <div className="md:col-span-2 md:row-span-2">
                    {workout ? (
                        <WorkoutCard
                            workout={workout}
                            slug={slug}
                            memberName={session.user.name || "Athlete"}
                            memberAvatar={session.user.image || `https://api.dicebear.com/9.x/initials/svg?seed=${session.user.name}`}
                        />
                    ) : (
                        <SmartEmptyState
                            icon={Dumbbell}
                            title="No Workout Scheduled"
                            description="Rest day? Or log your own."
                            actionLabel="Log Custom"
                            actionHref={`/${slug}/member/log-workout/custom`}
                        />
                    )}
                </div>

                <Link href={`/${slug}/member/prs`} className="md:col-span-1">
                    <BentoGridItem
                        title="Personal Records"
                        description="View your best lifts & benchmarks"
                        icon={<Trophy className="h-6 w-6 text-yellow-500" />}
                        className="h-full cursor-pointer hover:bg-muted/50 transition-colors"
                    />
                </Link>

                <Link href={`/${slug}/member/history`} className="md:col-span-1">
                    <BentoGridItem
                        title="History"
                        description="Review past workouts"
                        icon={<HistoryIcon className="h-6 w-6 text-blue-500" />}
                        className="h-full cursor-pointer hover:bg-muted/50 transition-colors"
                    />
                </Link>
            </BentoGrid>

            <div className="mt-8">
                <h2 className="text-xl font-bold mb-4 px-1">Community Pulse</h2>
                <CommunityFeed initialActivities={recentActivity} gymId={gym.id} />
            </div>
        </div>
    )
}

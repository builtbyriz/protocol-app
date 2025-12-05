import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Users, Dumbbell, MessageSquare, TrendingUp, AlertTriangle } from "lucide-react"
import { getAdminStats, getRecentActivity, getMembersAtRisk } from "@/app/actions/admin"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { ScrollArea } from "@/components/ui/scroll-area"

export const runtime = 'edge';

export default async function AdminDashboard({ params }: { params: Promise<{ slug: string }> }) {
    const { slug } = await params

    const { prisma } = await import("@/lib/db")
    const gym = await prisma.gym.findUnique({
        where: { slug },
        select: { id: true }
    })

    if (!gym) return <div>Gym not found</div>

    const stats = await getAdminStats(gym.id)
    const recentActivity = await getRecentActivity(gym.id)
    const atRiskMembers = await getMembersAtRisk(gym.id)

    if (!stats) return <div>Error loading stats</div>

    const statCards = [
        {
            title: "Total Members",
            value: stats.totalMembers.toString(),
            change: "Active members",
            icon: Users,
        },
        {
            title: "Active Workouts",
            value: stats.activeWorkouts.toString(),
            change: "Total templates",
            icon: Dumbbell,
        },
        {
            title: "AI Messages",
            value: stats.aiMessagesCount.toString(),
            change: "Total interactions",
            icon: MessageSquare,
        },
        {
            title: "PRs This Week",
            value: stats.prsThisWeek.toString(),
            change: "Last 7 days",
            icon: TrendingUp,
        },
    ]

    return (
        <div className="space-y-6">
            <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                {statCards.map((stat) => (
                    <Card key={stat.title}>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">
                                {stat.title}
                            </CardTitle>
                            <stat.icon className="h-4 w-4 text-muted-foreground" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">{stat.value}</div>
                            <p className="text-xs text-muted-foreground">
                                {stat.change}
                            </p>
                        </CardContent>
                    </Card>
                ))}
            </div>
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
                <Card className="col-span-4">
                    <CardHeader>
                        <CardTitle>Recent Activity</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <ScrollArea className="h-[300px] pr-4">
                            <div className="space-y-4">
                                {recentActivity.length === 0 ? (
                                    <div className="text-center text-muted-foreground py-8">No recent activity</div>
                                ) : (
                                    recentActivity.map((activity) => (
                                        <div key={activity.id} className="flex items-center">
                                            <Avatar className="h-9 w-9">
                                                <AvatarImage src={activity.memberAvatar} alt="Avatar" />
                                                <AvatarFallback>{activity.memberName[0]}</AvatarFallback>
                                            </Avatar>
                                            <div className="ml-4 space-y-1">
                                                <p className="text-sm font-medium leading-none">{activity.memberName}</p>
                                                <p className="text-sm text-muted-foreground">
                                                    {activity.title} - <span className="font-mono text-xs">{activity.subtitle}</span>
                                                </p>
                                            </div>
                                            <div className="ml-auto font-medium text-xs text-muted-foreground">
                                                {new Date(activity.timestamp).toLocaleDateString()}
                                            </div>
                                        </div>
                                    ))
                                )}
                            </div>
                        </ScrollArea>
                    </CardContent>
                </Card>
                <Card className="col-span-3">
                    <CardHeader>
                        <CardTitle>Members at Risk</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-4">
                            {atRiskMembers.length === 0 ? (
                                <div className="text-center text-muted-foreground py-8">No members at risk</div>
                            ) : (
                                atRiskMembers.map((member) => (
                                    <div key={member.id} className="flex items-center">
                                        <div className="ml-4 space-y-1">
                                            <p className="text-sm font-medium leading-none">{member.name}</p>
                                            <p className="text-sm text-muted-foreground">Absent for {member.daysAbsent} days</p>
                                        </div>
                                        <div className={`ml-auto font-medium ${member.riskLevel === 'High' ? 'text-red-500' : 'text-yellow-500'}`}>
                                            {member.riskLevel} Risk
                                        </div>
                                    </div>
                                ))
                            )}
                        </div>
                    </CardContent>
                </Card>
            </div>
        </div>
    )
}

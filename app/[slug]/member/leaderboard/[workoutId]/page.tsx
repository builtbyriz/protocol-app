import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Trophy, Medal } from "lucide-react"
import { getWorkoutLeaderboard } from "@/app/actions/community"
import { prisma } from "@/lib/db"

export default async function LeaderboardPage({ params }: { params: Promise<{ slug: string, workoutId: string }> }) {
    const { slug, workoutId } = await params
    const workout = await prisma.workout.findUnique({ where: { id: workoutId } })
    const leaderboard = await getWorkoutLeaderboard(workoutId)

    return (
        <div className="space-y-6 max-w-md mx-auto">
            <div className="flex items-center justify-between">
                <h1 className="text-2xl font-bold flex items-center gap-2">
                    <Trophy className="h-6 w-6 text-yellow-500" />
                    Leaderboard
                </h1>
                <Badge variant="outline">{workout?.title || 'Workout'}</Badge>
            </div>

            <Card>
                <CardHeader className="pb-2">
                    <CardTitle className="text-sm font-medium text-muted-foreground">Top Performers</CardTitle>
                </CardHeader>
                <CardContent className="p-0">
                    {leaderboard.length === 0 ? (
                        <div className="p-8 text-center text-muted-foreground text-sm">
                            No results logged yet. Be the first!
                        </div>
                    ) : (
                        <div className="divide-y">
                            {leaderboard.map((entry) => (
                                <div key={entry.rank} className="flex items-center p-4 hover:bg-muted/50 transition-colors">
                                    <div className="w-8 font-bold text-muted-foreground flex justify-center">
                                        {entry.rank === 1 ? <Medal className="h-5 w-5 text-yellow-500" /> :
                                            entry.rank === 2 ? <Medal className="h-5 w-5 text-gray-400" /> :
                                                entry.rank === 3 ? <Medal className="h-5 w-5 text-amber-600" /> :
                                                    entry.rank}
                                    </div>

                                    <Avatar className="h-8 w-8 border border-background ml-2">
                                        <AvatarFallback>{entry.user.initials}</AvatarFallback>
                                    </Avatar>

                                    <div className="ml-3 flex-1">
                                        <p className="text-sm font-medium">{entry.user.name}</p>
                                        <p className="text-xs text-muted-foreground">{entry.date}</p>
                                    </div>

                                    <div className="font-mono font-bold text-sm">
                                        {entry.result}
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </CardContent>
            </Card>
        </div>
    )
}

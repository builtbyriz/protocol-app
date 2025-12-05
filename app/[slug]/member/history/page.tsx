import { auth } from "@/lib/auth"
import { prisma } from "@/lib/db"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { redirect } from "next/navigation"
import { Calendar, Trophy } from "lucide-react"

import { VolumeChart } from "@/components/member/analytics/volume-chart"


export default async function HistoryPage({ params }: { params: Promise<{ slug: string }> }) {
    const session = await auth()
    const { slug } = await params

    if (!session?.user) {
        redirect(`/login?callbackUrl=/${slug}/member/history`)
    }

    const results = await prisma.result.findMany({
        where: {
            memberId: session.user.id,
        },
        include: {
            workout: true,
        },
        orderBy: {
            loggedAt: 'desc',
        },
    })

    // Calculate weekly volume (last 7 days)
    const last7Days = Array.from({ length: 7 }, (_, i) => {
        const d = new Date()
        d.setDate(d.getDate() - i)
        return d.toLocaleDateString('en-US', { weekday: 'short' })
    }).reverse()

    const volumeData = last7Days.map(day => ({
        name: day,
        total: results.filter(r =>
            new Date(r.loggedAt).toLocaleDateString('en-US', { weekday: 'short' }) === day &&
            new Date(r.loggedAt) > new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)
        ).length
    }))

    return (
        <div className="space-y-6 max-w-md mx-auto pb-20">
            <h1 className="text-2xl font-bold">Workout History</h1>

            <VolumeChart data={volumeData} />

            <div className="space-y-4">
                {results.map((result) => (
                    <Card key={result.id}>
                        <CardHeader className="pb-2">
                            <div className="flex justify-between items-start">
                                <div>
                                    <CardTitle className="text-base">{result.workout.title}</CardTitle>
                                    <div className="flex items-center text-xs text-muted-foreground gap-2">
                                        <Calendar className="h-3 w-3" />
                                        <span>{new Date(result.workout.date).toLocaleDateString()}</span>
                                    </div>
                                </div>
                                <div className="text-right">
                                    <div className="font-bold text-lg">{result.result}</div>
                                    <div className="text-xs text-muted-foreground">{result.workout.workoutType}</div>
                                </div>
                            </div>
                        </CardHeader>
                        <CardContent>
                            {result.notes && (
                                <p className="text-sm text-muted-foreground bg-muted/30 p-2 rounded mt-2">
                                    {result.notes}
                                </p>
                            )}
                        </CardContent>
                    </Card>
                ))}
                {results.length === 0 && (
                    <div className="text-center py-10 text-muted-foreground">
                        No workouts logged yet.
                    </div>
                )}
            </div>
        </div>
    )
}

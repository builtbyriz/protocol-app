import { auth } from "@/lib/auth"
import { redirect } from "next/navigation"
import { getMemberPRs } from "@/app/actions/analytics"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Trophy, TrendingUp, Calendar } from "lucide-react"
import { Badge } from "@/components/ui/badge"


export default async function PRsPage({ params }: { params: Promise<{ slug: string }> }) {
    const session = await auth()
    const { slug } = await params

    if (!session?.user?.id) {
        redirect(`/login?callbackUrl=/${slug}/member/prs`)
    }

    const prs = await getMemberPRs(session.user.id)

    return (
        <div className="space-y-6 max-w-md mx-auto pb-20">
            <div className="flex items-center justify-between">
                <h1 className="text-2xl font-bold flex items-center gap-2">
                    <Trophy className="h-6 w-6 text-yellow-500" />
                    Personal Records
                </h1>
                <Badge variant="secondary">{prs.length} Records</Badge>
            </div>

            {prs.length === 0 ? (
                <Card className="border-dashed">
                    <CardContent className="pt-6 text-center text-muted-foreground">
                        <Trophy className="h-12 w-12 mx-auto mb-2 opacity-20" />
                        <p>No PRs recorded yet.</p>
                        <p className="text-sm">Log your workouts to track your bests!</p>
                    </CardContent>
                </Card>
            ) : (
                <div className="grid gap-4">
                    {prs.map((pr) => (
                        <Card key={pr.id} className="overflow-hidden">
                            <CardHeader className="pb-2 bg-muted/30">
                                <div className="flex justify-between items-start">
                                    <CardTitle className="text-lg">{pr.movement}</CardTitle>
                                    {pr.unit && <Badge variant="outline">{pr.unit}</Badge>}
                                </div>
                            </CardHeader>
                            <CardContent className="pt-4">
                                <div className="flex items-baseline gap-2 mb-2">
                                    <span className="text-3xl font-bold tracking-tight">{pr.bestResult}</span>
                                </div>
                                <div className="flex items-center text-xs text-muted-foreground gap-4">
                                    <div className="flex items-center gap-1">
                                        <Calendar className="h-3 w-3" />
                                        {new Date(pr.achievedAt).toLocaleDateString()}
                                    </div>
                                    {/* Placeholder for "Days since" calculation if needed */}
                                </div>
                            </CardContent>
                        </Card>
                    ))}
                </div>
            )}
        </div>
    )
}

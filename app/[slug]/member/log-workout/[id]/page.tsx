import { auth } from "@/lib/auth"
import { prisma } from "@/lib/db"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { logWorkout } from "@/app/actions/logging"
import { notFound, redirect } from "next/navigation"

import { getRecommendedWeights } from "@/app/actions/workouts"
import { Sparkles } from "lucide-react"


export default async function LogWorkoutPage({
    params
}: {
    params: Promise<{ slug: string; id: string }>
}) {
    const session = await auth()
    const { slug, id } = await params

    if (!session?.user) {
        redirect(`/login?callbackUrl=/${slug}/member/log-workout/${id}`)
    }

    const workout = await prisma.workout.findUnique({
        where: { id },
    })

    if (!workout) notFound()

    const recommendation = await getRecommendedWeights(id, session.user.id || "")

    // Helper to get placeholder based on type
    const getPlaceholder = (type: string) => {
        switch (type) {
            case "For Time": return "e.g., 12:45"
            case "AMRAP": return "e.g., 5 rounds + 12 reps"
            case "EMOM": return "e.g., Completed all rounds"
            case "Weight": return "e.g., 120kg"
            case "Rounds": return "e.g., 15 rounds"
            default: return "Result"
        }
    }

    return (
        <div className="space-y-6 max-w-md mx-auto">
            <div className="space-y-1">
                <h1 className="text-2xl font-bold">Log Result</h1>
                <p className="text-muted-foreground">{workout.title}</p>
            </div>

            {recommendation && (
                <div className="bg-blue-500/10 border border-blue-500/20 p-4 rounded-lg flex items-start gap-3 animate-in fade-in slide-in-from-top-2">
                    <Sparkles className="h-5 w-5 text-blue-500 mt-0.5" />
                    <div className="space-y-1">
                        <p className="text-sm font-medium text-blue-500">AI Coach Suggestion</p>
                        <p className="text-sm text-muted-foreground">{recommendation}</p>
                    </div>
                </div>
            )}

            <Card>
                <CardHeader>
                    <CardTitle>How did it go?</CardTitle>
                </CardHeader>
                <CardContent>
                    <form action={logWorkout.bind(null, slug)} className="space-y-6">
                        <input type="hidden" name="workoutId" value={workout.id} />

                        <div className="space-y-2">
                            <Label htmlFor="result">Result ({workout.workoutType})</Label>
                            <Input
                                id="result"
                                name="result"
                                placeholder={getPlaceholder(workout.workoutType)}
                                required
                                autoFocus
                            />
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="notes">Notes (Optional)</Label>
                            <Textarea
                                id="notes"
                                name="notes"
                                placeholder="How did you feel? Any scaling?"
                            />
                        </div>

                        <Button type="submit" className="w-full">
                            Save Result
                        </Button>
                    </form>
                </CardContent>
            </Card>
        </div>
    )
}

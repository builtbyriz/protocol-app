"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Calendar, Clock, Dumbbell, Repeat, Timer, ArrowRight, Trophy, Sparkles, Share2, Download, Volume2, VolumeX } from "lucide-react"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import { SwipeableItem } from "@/components/ui/swipeable-item"
import { useRouter } from "next/navigation"
import { Dialog, DialogContent, DialogTrigger } from "@/components/ui/dialog"
import { ShareWorkoutCard } from "@/components/social/share-workout-card"
import { toast } from "sonner"
import { useVoiceCoach } from "@/hooks/use-voice-coach"

interface WorkoutCardProps {
    workout: {
        id: string
        title: string
        workoutType: string
        description: string
        movements: string
        date: Date
    }
    slug: string
    logged?: boolean
    memberName?: string
    memberAvatar?: string
}

export function WorkoutCard({ workout, slug, logged, memberName = "Athlete", memberAvatar = "" }: WorkoutCardProps) {
    const router = useRouter()
    const { speak, cancel, isSpeaking, isSupported } = useVoiceCoach()

    const handleSpeak = (e: React.MouseEvent) => {
        e.stopPropagation()
        if (isSpeaking) {
            cancel()
        } else {
            const text = `Workout Briefing for ${workout.title}. This is a ${workout.workoutType} workout. ${workout.description}. Good luck, ${memberName.split(' ')[0]}!`
            speak(text)
        }
    }

    const getIcon = (type: string) => {
        switch (type) {
            case "For Time": return <Timer className="h-4 w-4" />
            case "AMRAP": return <Clock className="h-4 w-4" />
            case "EMOM": return <Repeat className="h-4 w-4" />
            case "Weight": return <Dumbbell className="h-4 w-4" />
            default: return <Dumbbell className="h-4 w-4" />
        }
    }

    return (
        <Card className="w-full">
            <CardHeader className="pb-2">
                <div className="flex justify-between items-start">
                    <div>
                        <CardTitle className="text-xl mb-1 flex items-center gap-2">
                            {workout.title}
                            {isSupported && (
                                <Button
                                    variant="ghost"
                                    size="icon"
                                    className="h-6 w-6 rounded-full"
                                    onClick={handleSpeak}
                                >
                                    {isSpeaking ? (
                                        <VolumeX className="h-4 w-4 text-primary animate-pulse" />
                                    ) : (
                                        <Volume2 className="h-4 w-4 text-muted-foreground" />
                                    )}
                                </Button>
                            )}
                        </CardTitle>
                        <div className="flex items-center text-sm text-muted-foreground gap-2">
                            <Calendar className="h-3 w-3" />
                            <span>{new Date(workout.date).toLocaleDateString()}</span>
                        </div>
                    </div>
                    <Badge variant="secondary" className="flex items-center gap-1">
                        {getIcon(workout.workoutType)}
                        {workout.workoutType}
                    </Badge>
                </div>
            </CardHeader>
            <CardContent className="space-y-4">
                <div className="bg-muted/30 p-3 rounded-md text-sm whitespace-pre-wrap font-mono">
                    {workout.description}
                </div>

                {workout.movements && (
                    <div className="space-y-2">
                        <h4 className="text-sm font-medium text-muted-foreground">Movements (Swipe to Complete)</h4>
                        <div className="flex flex-col gap-2">
                            {workout.movements.split('\n').map((m, i) => (
                                <SwipeableItem key={i}>
                                    <div className="text-sm font-medium">
                                        {m}
                                    </div>
                                </SwipeableItem>
                            ))}
                        </div>
                    </div>
                )}

                <div className="flex gap-2 mt-4">
                    <Button
                        className="flex-1 gap-2"
                        onClick={() => router.push(`/${slug}/member/log-workout/${workout.id}`)}
                    >
                        {logged ? "Log Another" : "Log Result"} <ArrowRight className="h-4 w-4" />
                    </Button>
                    <Button
                        variant="outline"
                        className="gap-2"
                        onClick={() => router.push(`/${slug}/member/leaderboard/${workout.id}`)}
                    >
                        <Trophy className="h-4 w-4" />
                        Leaderboard
                    </Button>
                </div>

                <div className="flex gap-2 mt-2">
                    <Button
                        variant="ghost"
                        size="sm"
                        className="flex-1 text-xs text-muted-foreground hover:text-primary gap-1"
                        onClick={() => router.push(`/${slug}/member/chat?initialPrompt=Analyze my performance on ${workout.title}. How can I improve?`)}
                    >
                        <Sparkles className="h-3 w-3" />
                        Ask Coach
                    </Button>

                    <Dialog>
                        <DialogTrigger asChild>
                            <Button variant="ghost" size="sm" className="flex-1 text-xs text-muted-foreground hover:text-primary gap-1">
                                <Share2 className="h-3 w-3" />
                                Share
                            </Button>
                        </DialogTrigger>
                        <DialogContent className="sm:max-w-md bg-transparent border-none shadow-none p-0 flex flex-col items-center">
                            <ShareWorkoutCard
                                workoutTitle={workout.title}
                                duration="45:00"
                                calories={450}
                                memberName={memberName}
                                memberAvatar={memberAvatar}
                                date={new Date(workout.date)}
                            />
                            <Button className="mt-4 w-full max-w-[375px]" onClick={() => toast.success("Image saved to gallery!")}>
                                <Download className="h-4 w-4 mr-2" />
                                Save Image
                            </Button>
                        </DialogContent>
                    </Dialog>
                </div>
            </CardContent>
        </Card>
    )
}

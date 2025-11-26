'use client'

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { ThumbsUp, Clock } from "lucide-react"
import { useState } from "react"
import { useHaptic } from "@/hooks/use-haptic"
import { toggleFistbump } from "@/app/actions/community"
import { cn } from "@/lib/utils"

type Activity = {
    id: string
    user: { name: string, avatar?: string, initials: string }
    workout: string
    result: string
    timeAgo: string
    fistbumps: number
    hasFistbumped: boolean
}

export function CommunityFeed({ initialActivities, gymId }: { initialActivities: Activity[], gymId: string }) {
    const { trigger } = useHaptic()
    const [activities, setActivities] = useState(initialActivities)

    const handleFistbump = async (id: string) => {
        trigger('success')

        // Optimistic update
        setActivities(prev => prev.map(activity => {
            if (activity.id === id) {
                const isAdding = !activity.hasFistbumped
                return {
                    ...activity,
                    fistbumps: activity.fistbumps + (isAdding ? 1 : -1),
                    hasFistbumped: isAdding
                }
            }
            return activity
        }))

        try {
            await toggleFistbump(id)
        } catch (error) {
            // Revert on error
            console.error("Failed to toggle fistbump", error)
            setActivities(prev => prev.map(activity => {
                if (activity.id === id) {
                    const isRevertingToAdd = !activity.hasFistbumped
                    return {
                        ...activity,
                        fistbumps: activity.fistbumps + (isRevertingToAdd ? 1 : -1),
                        hasFistbumped: isRevertingToAdd
                    }
                }
                return activity
            }))
        }
    }

    if (activities.length === 0) {
        return (
            <div className="space-y-4 mt-8">
                <h2 className="text-lg font-semibold">Community Feed</h2>
                <div className="text-sm text-muted-foreground text-center py-8 border rounded-md border-dashed">
                    No recent activity. Be the first to log a workout!
                </div>
            </div>
        )
    }

    return (
        <div className="space-y-4 mt-8">
            <div className="flex items-center justify-between">
                <h2 className="text-lg font-semibold">Community Feed</h2>
                <span className="text-xs text-muted-foreground bg-muted px-2 py-1 rounded-full">Live</span>
            </div>

            <div className="space-y-3">
                {activities.map((activity) => (
                    <Card key={activity.id} className="overflow-hidden">
                        <CardContent className="p-4 flex gap-3">
                            <Avatar className="h-10 w-10 border-2 border-background">
                                <AvatarImage src={activity.user.avatar} />
                                <AvatarFallback>{activity.user.initials}</AvatarFallback>
                            </Avatar>

                            <div className="flex-1 min-w-0">
                                <div className="flex justify-between items-start">
                                    <p className="text-sm font-medium truncate">
                                        {activity.user.name}
                                    </p>
                                    <span className="text-xs text-muted-foreground flex items-center gap-1">
                                        <Clock className="h-3 w-3" />
                                        {activity.timeAgo}
                                    </span>
                                </div>

                                <p className="text-xs text-muted-foreground mt-0.5">
                                    Completed <span className="font-medium text-foreground">{activity.workout}</span>
                                </p>

                                <div className="mt-2 flex items-center justify-between">
                                    <span className="text-sm font-bold font-mono bg-muted/50 px-2 py-0.5 rounded">
                                        {activity.result}
                                    </span>

                                    <Button
                                        variant="ghost"
                                        size="sm"
                                        className={cn(
                                            "h-8 px-2 gap-1.5 transition-colors",
                                            activity.hasFistbumped ? "text-primary hover:text-primary/80" : "text-muted-foreground hover:text-primary"
                                        )}
                                        onClick={() => handleFistbump(activity.id)}
                                    >
                                        <ThumbsUp className={cn("h-3.5 w-3.5", activity.hasFistbumped && "fill-current")} />
                                        <span className="text-xs">{activity.fistbumps}</span>
                                    </Button>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                ))}
            </div>
        </div>
    )
}

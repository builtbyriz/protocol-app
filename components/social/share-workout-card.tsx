import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { Dumbbell, Flame, Timer } from "lucide-react"

interface ShareWorkoutCardProps {
    workoutTitle: string
    duration: string
    calories: number
    memberName: string
    memberAvatar: string
    date: Date
}

export function ShareWorkoutCard({
    workoutTitle,
    duration,
    calories,
    memberName,
    memberAvatar,
    date
}: ShareWorkoutCardProps) {
    return (
        <div className="w-[375px] h-[667px] bg-black relative overflow-hidden flex flex-col items-center justify-between p-8 text-white" id="share-card">
            {/* Background Gradient */}
            <div className="absolute inset-0 bg-gradient-to-br from-indigo-900 via-purple-900 to-pink-900 opacity-80" />
            <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20" />

            {/* Header */}
            <div className="relative z-10 w-full flex justify-between items-center">
                <div className="flex items-center gap-2">
                    <Dumbbell className="h-6 w-6 text-yellow-400" />
                    <span className="font-bold tracking-wider text-sm">PROTOCOL</span>
                </div>
                <span className="text-xs font-mono opacity-70">{date.toLocaleDateString()}</span>
            </div>

            {/* Main Content */}
            <div className="relative z-10 flex flex-col items-center gap-8 text-center">
                <div className="space-y-2">
                    <h3 className="text-sm font-medium uppercase tracking-widest text-white/60">Workout Complete</h3>
                    <h1 className="text-5xl font-black italic leading-tight tracking-tighter">
                        {workoutTitle}
                    </h1>
                </div>

                <div className="grid grid-cols-2 gap-8 w-full">
                    <div className="flex flex-col items-center gap-1">
                        <Timer className="h-8 w-8 text-blue-400 mb-2" />
                        <span className="text-3xl font-bold">{duration}</span>
                        <span className="text-xs uppercase tracking-wider opacity-60">Time</span>
                    </div>
                    <div className="flex flex-col items-center gap-1">
                        <Flame className="h-8 w-8 text-orange-400 mb-2" />
                        <span className="text-3xl font-bold">{calories}</span>
                        <span className="text-xs uppercase tracking-wider opacity-60">Cals</span>
                    </div>
                </div>
            </div>

            {/* Footer */}
            <div className="relative z-10 w-full flex items-center gap-4 bg-white/10 backdrop-blur-md p-4 rounded-2xl border border-white/10">
                <Avatar className="h-12 w-12 border-2 border-white/20">
                    <AvatarImage src={memberAvatar} />
                    <AvatarFallback>{memberName[0]}</AvatarFallback>
                </Avatar>
                <div className="flex flex-col">
                    <span className="font-bold text-lg">{memberName}</span>
                    <span className="text-xs opacity-70">Crushed it today! 🚀</span>
                </div>
            </div>
        </div>
    )
}

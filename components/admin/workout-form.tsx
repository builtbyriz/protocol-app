'use client'

import { createWorkout } from "@/app/actions/admin"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { ArrowLeft, Loader2 } from "lucide-react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { useState } from "react"

interface WorkoutFormProps {
    gymId: string
    slug: string
}

export function WorkoutForm({ gymId, slug }: WorkoutFormProps) {
    const router = useRouter()
    const [isLoading, setIsLoading] = useState(false)
    const [error, setError] = useState("")

    async function handleSubmit(formData: FormData) {
        setIsLoading(true)
        setError("")

        const title = formData.get("title") as string
        const description = formData.get("description") as string
        const workoutType = formData.get("workoutType") as string
        const movements = formData.get("movements") as string
        const dateStr = formData.get("date") as string

        try {
            await createWorkout(gymId, {
                title,
                description,
                workoutType,
                movements,
                date: new Date(dateStr)
            })
            router.push(`/${slug}/admin/workouts`)
            router.refresh()
        } catch (e) {
            console.error(e)
            setError("Failed to create workout")
        } finally {
            setIsLoading(false)
        }
    }

    return (
        <div className="space-y-6">
            <div className="flex items-center space-x-4">
                <Link href={`/${slug}/admin/workouts`}>
                    <Button variant="ghost" size="icon">
                        <ArrowLeft className="h-4 w-4" />
                    </Button>
                </Link>
                <h1 className="text-3xl font-bold tracking-tight">New Workout</h1>
            </div>

            <Card>
                <CardHeader>
                    <CardTitle>Workout Details</CardTitle>
                </CardHeader>
                <CardContent>
                    <form action={handleSubmit} className="space-y-6">
                        <div className="grid gap-4 md:grid-cols-2">
                            <div className="space-y-2">
                                <Label htmlFor="title">Title</Label>
                                <Input id="title" name="title" placeholder="e.g. Murph" required />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="date">Date</Label>
                                <Input id="date" name="date" type="date" required defaultValue={new Date().toISOString().split('T')[0]} />
                            </div>
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="workoutType">Type</Label>
                            <Select name="workoutType" required defaultValue="For Time">
                                <SelectTrigger>
                                    <SelectValue placeholder="Select type" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="For Time">For Time</SelectItem>
                                    <SelectItem value="AMRAP">AMRAP</SelectItem>
                                    <SelectItem value="EMOM">EMOM</SelectItem>
                                    <SelectItem value="Weight">Weight</SelectItem>
                                    <SelectItem value="Rounds">Rounds</SelectItem>
                                    <SelectItem value="Custom">Custom</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="description">Description</Label>
                            <Textarea id="description" name="description" placeholder="Workout description..." />
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="movements">Movements (one per line)</Label>
                            <Textarea
                                id="movements"
                                name="movements"
                                placeholder="Pull-ups&#10;Push-ups&#10;Squats"
                                className="min-h-[150px] font-mono"
                                required
                            />
                        </div>

                        {error && (
                            <div className="text-sm text-red-500 font-medium">
                                {error}
                            </div>
                        )}

                        <div className="flex justify-end">
                            <Button type="submit" disabled={isLoading}>
                                {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                                Create Workout
                            </Button>
                        </div>
                    </form>
                </CardContent>
            </Card>
        </div>
    )
}

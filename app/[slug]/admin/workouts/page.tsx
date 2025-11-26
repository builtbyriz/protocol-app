import { getWorkouts } from "@/app/actions/admin"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Plus, Calendar, Dumbbell, Users } from "lucide-react"
import Link from "next/link"

export default async function WorkoutsPage({
    params,
}: {
    params: Promise<{ slug: string }>
}) {
    const { slug } = await params

    const { prisma } = await import("@/lib/db")
    const gym = await prisma.gym.findUnique({
        where: { slug },
        select: { id: true }
    })

    if (!gym) return <div>Gym not found</div>

    const workouts = await getWorkouts(gym.id)

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <h1 className="text-3xl font-bold tracking-tight">Workouts</h1>
                <Link href={`/${slug}/admin/workouts/new`}>
                    <Button>
                        <Plus className="mr-2 h-4 w-4" />
                        Create Workout
                    </Button>
                </Link>
            </div>

            <Card>
                <CardHeader>
                    <CardTitle>Workout Library</CardTitle>
                </CardHeader>
                <CardContent>
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Date</TableHead>
                                <TableHead>Title</TableHead>
                                <TableHead>Type</TableHead>
                                <TableHead className="text-right">Completions</TableHead>
                                <TableHead className="w-[50px]"></TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {workouts.length === 0 ? (
                                <TableRow>
                                    <TableCell colSpan={5} className="text-center py-8 text-muted-foreground">
                                        No workouts found
                                    </TableCell>
                                </TableRow>
                            ) : (
                                workouts.map((workout) => (
                                    <TableRow key={workout.id}>
                                        <TableCell>
                                            <div className="flex items-center">
                                                <Calendar className="mr-2 h-4 w-4 text-muted-foreground" />
                                                {new Date(workout.date).toLocaleDateString()}
                                            </div>
                                        </TableCell>
                                        <TableCell className="font-medium">{workout.title}</TableCell>
                                        <TableCell>
                                            <div className="flex items-center">
                                                <Dumbbell className="mr-2 h-4 w-4 text-muted-foreground" />
                                                {workout.type}
                                            </div>
                                        </TableCell>
                                        <TableCell className="text-right">
                                            <div className="flex items-center justify-end">
                                                <Users className="mr-2 h-4 w-4 text-muted-foreground" />
                                                {workout.completions}
                                            </div>
                                        </TableCell>
                                        <TableCell>
                                            <Button variant="ghost" size="sm">Edit</Button>
                                        </TableCell>
                                    </TableRow>
                                ))
                            )}
                        </TableBody>
                    </Table>
                </CardContent>
            </Card>
        </div>
    )
}

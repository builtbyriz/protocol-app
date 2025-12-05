import { getMemberDetails } from "@/app/actions/admin"
import { MemberRoleSelect } from "@/components/admin/member-role-select"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { ArrowLeft, Calendar, Dumbbell, Mail, User } from "lucide-react"
import Link from "next/link"


export default async function MemberDetailsPage({
    params,
}: {
    params: Promise<{ slug: string; memberId: string }>
}) {
    const { slug, memberId } = await params
    const member = await getMemberDetails(memberId)

    if (!member) return <div>Member not found</div>

    return (
        <div className="space-y-6">
            <div className="flex items-center space-x-4">
                <Link href={`/${slug}/admin/members`}>
                    <Button variant="ghost" size="icon">
                        <ArrowLeft className="h-4 w-4" />
                    </Button>
                </Link>
                <h1 className="text-3xl font-bold tracking-tight">Member Details</h1>
            </div>

            <div className="grid gap-6 md:grid-cols-2">
                <Card>
                    <CardHeader>
                        <CardTitle>Profile</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-6">
                        <div className="flex items-center space-x-4">
                            <Avatar className="h-20 w-20">
                                <AvatarImage src={member.avatar} alt={member.name} />
                                <AvatarFallback>{member.name[0]}</AvatarFallback>
                            </Avatar>
                            <div>
                                <h2 className="text-xl font-semibold">{member.name}</h2>
                                <p className="text-sm text-muted-foreground">{member.email}</p>
                            </div>
                        </div>

                        <div className="space-y-4">
                            <div className="flex items-center justify-between">
                                <div className="flex items-center text-sm text-muted-foreground">
                                    <User className="mr-2 h-4 w-4" />
                                    Role
                                </div>
                                <MemberRoleSelect memberId={member.id} currentRole={member.role} />
                            </div>
                            <div className="flex items-center justify-between">
                                <div className="flex items-center text-sm text-muted-foreground">
                                    <Calendar className="mr-2 h-4 w-4" />
                                    Joined
                                </div>
                                <span className="font-medium">{new Date(member.joinDate).toLocaleDateString()}</span>
                            </div>
                            <div className="flex items-center justify-between">
                                <div className="flex items-center text-sm text-muted-foreground">
                                    <Dumbbell className="mr-2 h-4 w-4" />
                                    Workouts Logged
                                </div>
                                <span className="font-medium">{member.workoutsLogged}</span>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader>
                        <CardTitle>Recent Activity</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-4">
                            {member.recentActivity.length === 0 ? (
                                <p className="text-sm text-muted-foreground">No recent activity</p>
                            ) : (
                                member.recentActivity.map((activity) => (
                                    <div key={activity.id} className="flex items-center justify-between border-b pb-4 last:border-0 last:pb-0">
                                        <div>
                                            <p className="font-medium">{activity.workoutTitle}</p>
                                            <p className="text-sm text-muted-foreground">{new Date(activity.date).toLocaleDateString()}</p>
                                        </div>
                                        <div className="text-sm font-medium">
                                            {activity.result}
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

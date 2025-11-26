import { getMembers } from "@/app/actions/admin"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Search, MoreHorizontal, Mail } from "lucide-react"
import Link from "next/link"
import { redirect } from "next/navigation"

export default async function MembersPage({
    params,
    searchParams,
}: {
    params: Promise<{ slug: string }>
    searchParams: Promise<{ query?: string }>
}) {
    const { slug } = await params
    const { query } = await searchParams

    const { prisma } = await import("@/lib/db")
    const gym = await prisma.gym.findUnique({
        where: { slug },
        select: { id: true }
    })

    if (!gym) return <div>Gym not found</div>

    let members = []
    try {
        members = await getMembers(gym.id, query || "")
    } catch (error) {
        console.error("Error fetching members:", error)
        return <div>Error loading members. Please check logs.</div>
    }

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <h1 className="text-3xl font-bold tracking-tight">Members</h1>
                <Button>Add Member</Button>
            </div>

            <Card>
                <CardHeader>
                    <CardTitle>Member Management</CardTitle>
                    <div className="flex items-center space-x-2">
                        <form className="flex w-full max-w-sm items-center space-x-2">
                            <Input
                                type="search"
                                placeholder="Search members..."
                                name="query"
                                defaultValue={query}
                            />
                            <Button type="submit" size="icon" variant="ghost">
                                <Search className="h-4 w-4" />
                            </Button>
                        </form>
                    </div>
                </CardHeader>
                <CardContent>
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead className="w-[80px]">Avatar</TableHead>
                                <TableHead>Name</TableHead>
                                <TableHead>Status</TableHead>
                                <TableHead>Joined</TableHead>
                                <TableHead>Last Active</TableHead>
                                <TableHead className="text-right">Workouts</TableHead>
                                <TableHead className="w-[50px]"></TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {members.length === 0 ? (
                                <TableRow>
                                    <TableCell colSpan={7} className="text-center py-8 text-muted-foreground">
                                        No members found
                                    </TableCell>
                                </TableRow>
                            ) : (
                                members.map((member) => (
                                    <TableRow key={member.id}>
                                        <TableCell>
                                            <Avatar>
                                                <AvatarImage src={member.avatar} alt={member.name} />
                                                <AvatarFallback>{member.name[0]}</AvatarFallback>
                                            </Avatar>
                                        </TableCell>
                                        <TableCell>
                                            <div className="flex flex-col">
                                                <Link href={`/${slug}/admin/members/${member.id}`} className="font-medium hover:underline">
                                                    {member.name}
                                                </Link>
                                                <span className="text-xs text-muted-foreground">{member.email}</span>
                                            </div>
                                        </TableCell>
                                        <TableCell>
                                            <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${member.role === 'admin' ? 'bg-purple-100 text-purple-800' : 'bg-green-100 text-green-800'
                                                }`}>
                                                {member.role}
                                            </span>
                                        </TableCell>
                                        <TableCell>{new Date(member.joinDate).toLocaleDateString()}</TableCell>
                                        <TableCell>{new Date(member.lastActive).toLocaleDateString()}</TableCell>
                                        <TableCell className="text-right">{member.workoutsLogged}</TableCell>
                                        <TableCell>
                                            <Button variant="ghost" size="icon">
                                                <MoreHorizontal className="h-4 w-4" />
                                            </Button>
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

import { auth } from "@/lib/auth"
import { redirect } from "next/navigation"
import Link from "next/link"

export const runtime = 'edge'

export default async function AdminLayout({
    children,
    params,
}: {
    children: React.ReactNode
    params: Promise<{ slug: string }>
}) {
    const session = await auth()
    const { slug } = await params

    if (!session?.user?.email) {
        redirect(`/login?callbackUrl=/${slug}/admin/dashboard`)
    }

    const { prisma } = await import("@/lib/db")
    const member = await prisma.member.findUnique({
        where: { email: session.user.email },
        include: { gym: true }
    })

    if (!member || member.gym.slug !== slug || member.role !== 'admin') {
        redirect(`/${slug}/member`)
    }

    return (
        <div className="flex min-h-screen flex-col">
            <header className="sticky top-0 z-10 flex h-14 items-center gap-4 border-b bg-background px-6">
                <Link href={`/${slug}/admin/dashboard`} className="flex items-center gap-2 font-semibold">
                    <span className="">{member.gym.name} Admin</span>
                </Link>
                <nav className="flex items-center gap-4 text-sm font-medium">
                    <Link href={`/${slug}/admin/dashboard`}>Dashboard</Link>
                    <Link href={`/${slug}/admin/workouts`}>Workouts</Link>
                    <Link href={`/${slug}/admin/members`}>Members</Link>
                    <Link href={`/${slug}/admin/settings`}>Settings</Link>
                    <Link href={`/${slug}/admin/knowledge`}>Knowledge</Link>
                </nav>
                <div className="ml-auto flex items-center gap-4">
                    <span className="text-sm text-muted-foreground">
                        {session.user.name}
                    </span>
                </div>
            </header>
            <main className="flex-1 p-6">
                {children}
            </main>
        </div>
    )
}

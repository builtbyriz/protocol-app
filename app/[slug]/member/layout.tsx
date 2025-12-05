import { auth } from "@/lib/auth"
import { redirect } from "next/navigation"
import Link from "next/link"
import { Home, History, Trophy, MessageSquare, User, Eye } from "lucide-react"

import { ConfettiCelebration } from "@/components/confetti-celebration"
import { OnboardingTour } from "@/components/member/onboarding-tour"



export default async function MemberLayout({
    children,
    params,
}: {
    children: React.ReactNode
    params: Promise<{ slug: string }>
}) {
    const session = await auth()
    const { slug } = await params

    if (!session?.user) {
        redirect(`/login?callbackUrl=/${slug}/member`)
    }

    return (
        <div className="flex min-h-screen flex-col pb-16">
            <ConfettiCelebration />
            <OnboardingTour />
            <main className="flex-1 p-4">
                {children}
            </main>
            <nav className="fixed bottom-0 left-0 right-0 border-t bg-background/80 backdrop-blur-md h-16 flex items-center justify-around px-4 z-50">
                <Link href={`/${slug}/member`} className="flex flex-col items-center gap-1 text-xs text-muted-foreground hover:text-primary">
                    <Home className="h-5 w-5" />
                    <span>Home</span>
                </Link>
                <Link href={`/${slug}/member/history`} id="nav-workouts" className="flex flex-col items-center gap-1 text-xs text-muted-foreground hover:text-primary">
                    <History className="h-5 w-5" />
                    <span>History</span>
                </Link>
                <Link href={`/${slug}/member/prs`} className="flex flex-col items-center gap-1 text-xs text-muted-foreground hover:text-primary">
                    <Trophy className="h-5 w-5" />
                    <span>PRs</span>
                </Link>
                <Link href={`/${slug}/member/chat`} id="nav-coach" className="flex flex-col items-center gap-1 text-xs text-muted-foreground hover:text-primary">
                    <MessageSquare className="h-5 w-5" />
                    <span>Coach</span>
                </Link>
                <Link href={`/${slug}/member/analysis`} className="flex flex-col items-center gap-1 text-xs text-muted-foreground hover:text-primary">
                    <Eye className="h-5 w-5" />
                    <span>Form Check</span>
                </Link>
                <Link href={`/${slug}/member/profile`} className="flex flex-col items-center gap-1 text-xs text-muted-foreground hover:text-primary">
                    <User className="h-5 w-5" />
                    <span>Profile</span>
                </Link>
            </nav>
        </div >
    )
}

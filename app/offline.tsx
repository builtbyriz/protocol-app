import { WifiOff } from "lucide-react"
import { Button } from "@/components/ui/button"
import Link from "next/link"

export default function OfflinePage() {
    return (
        <div className="flex h-screen w-full flex-col items-center justify-center p-4 text-center">
            <div className="glass-card p-8 rounded-2xl flex flex-col items-center gap-4 max-w-md">
                <div className="bg-muted/20 p-4 rounded-full">
                    <WifiOff className="h-12 w-12 text-muted-foreground" />
                </div>
                <h1 className="text-2xl font-bold">You're Offline</h1>
                <p className="text-muted-foreground">
                    Protocol needs an internet connection to sync your workouts.
                    Check your connection and try again.
                </p>
                <Button asChild className="w-full">
                    <Link href="/demo-gym/member">Retry</Link>
                </Button>
            </div>
        </div>
    )
}

'use client'

import { useEffect } from 'react'
import { Button } from "@/components/ui/button"

export default function GlobalError({
    error,
    reset,
}: {
    error: Error & { digest?: string }
    reset: () => void
}) {
    useEffect(() => {
        console.error(error)
    }, [error])

    return (
        <html>
            <body>
                <div className="flex h-screen w-full flex-col items-center justify-center gap-4 bg-background text-foreground">
                    <h2 className="text-2xl font-bold">Something went wrong!</h2>
                    <p className="text-red-500 font-mono text-sm whitespace-pre-wrap">{error.message}</p>
                    <pre className="text-xs text-muted-foreground overflow-auto max-w-full p-4 bg-gray-100 rounded">{error.stack}</pre>
                    <Button onClick={() => reset()}>Try again</Button>
                </div>
            </body>
        </html>
    )
}

'use client'

'use client'

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { signIn } from "next-auth/react"
import { useRouter, useSearchParams } from "next/navigation"
import { Suspense, useState } from "react"

function LoginForm() {
    const router = useRouter()
    const searchParams = useSearchParams()
    const callbackUrl = searchParams.get("callbackUrl") || "/"
    const [email, setEmail] = useState("")
    const [password, setPassword] = useState("")
    const [isLoading, setIsLoading] = useState(false)

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setIsLoading(true)

        try {
            const result = await signIn("credentials", {
                email,
                password,
                redirect: false,
            })

            if (result?.error) {
                alert("Invalid credentials")
            } else {
                // If callbackUrl is just "/", try to redirect to the correct dashboard
                if (callbackUrl === "/") {
                    // We need to fetch the session to know the role/slug
                    // Since we just logged in, we can try to fetch the session endpoint
                    try {
                        const sessionRes = await fetch("/api/auth/session")
                        const session = await sessionRes.json()

                        if (session?.user) {
                            // @ts-ignore
                            const slug = session.user.gymSlug || "demo-gym"
                            const role = session.user.role // Assuming role is in session, if not we default to member

                            if (role === "admin") {
                                router.push(`/${slug}/admin/dashboard`)
                            } else {
                                router.push(`/${slug}/member`)
                            }
                            router.refresh()
                            return
                        }
                    } catch (e) {
                        console.error("Failed to fetch session for redirect", e)
                    }
                }

                router.push(callbackUrl)
                router.refresh()
            }
        } catch (error) {
            console.error(error)
        } finally {
            setIsLoading(false)
        }
    }

    return (
        <Card className="w-full max-w-sm">
            <CardHeader>
                <CardTitle className="text-2xl">Login</CardTitle>
                <CardDescription>
                    Enter your email below to login to your account.
                </CardDescription>
            </CardHeader>
            <CardContent>
                <form onSubmit={handleSubmit} className="space-y-4">
                    <div className="space-y-2">
                        <Label htmlFor="email">Email</Label>
                        <Input
                            id="email"
                            type="email"
                            placeholder="m@example.com"
                            required
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                        />
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="password">Password</Label>
                        <Input
                            id="password"
                            type="password"
                            required
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                        />
                    </div>
                    <Button type="submit" className="w-full" disabled={isLoading}>
                        {isLoading ? "Signing in..." : "Sign in"}
                    </Button>
                </form>
                <div className="mt-4 text-center text-sm text-muted-foreground">
                    <p>Demo Member: member@demo.com / password123</p>
                    <p>Demo Admin: admin@demo.com / password123</p>
                </div>
            </CardContent>
        </Card>
    )
}

export default function LoginPage() {
    return (
        <div className="flex min-h-screen items-center justify-center bg-muted/40 p-4">
            <Suspense fallback={<div>Loading...</div>}>
                <LoginForm />
            </Suspense>
        </div>
    )
}

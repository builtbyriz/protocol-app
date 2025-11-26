'use client'

import { useSession } from "next-auth/react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

export default function ProfilePage() {
    const { data: session } = useSession()

    return (
        <div className="container mx-auto p-6 max-w-2xl">
            <h1 className="text-3xl font-bold mb-6">My Profile</h1>

            <Card>
                <CardHeader>
                    <CardTitle>Personal Information</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div className="space-y-2">
                        <Label htmlFor="name">Name</Label>
                        <Input id="name" defaultValue={session?.user?.name || ''} disabled />
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="email">Email</Label>
                        <Input id="email" defaultValue={session?.user?.email || ''} disabled />
                    </div>
                    <div className="pt-4">
                        <Button variant="outline" onClick={() => alert('Edit profile coming soon!')}>
                            Edit Profile
                        </Button>
                    </div>
                </CardContent>
            </Card>
        </div>
    )
}

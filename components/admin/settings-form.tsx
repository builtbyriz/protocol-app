'use client'

import { updateGym } from "@/app/actions/admin"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Loader2 } from "lucide-react"
import { useRouter } from "next/navigation"
import { useState } from "react"
import { toast } from "sonner"

interface SettingsFormProps {
    gym: {
        id: string
        name: string
        primaryColor: string
        aiTone: string
    }
}

export function SettingsForm({ gym }: SettingsFormProps) {
    const router = useRouter()
    const [isLoading, setIsLoading] = useState(false)

    async function handleSubmit(formData: FormData) {
        setIsLoading(true)

        const name = formData.get("name") as string
        const primaryColor = formData.get("primaryColor") as string
        const aiTone = formData.get("aiTone") as string

        try {
            await updateGym(gym.id, {
                name,
                primaryColor,
                aiTone
            })
            toast.success("Settings updated successfully")
            router.refresh()
        } catch (e) {
            console.error(e)
            toast.error("Failed to update settings")
        } finally {
            setIsLoading(false)
        }
    }

    return (
        <Card>
            <CardHeader>
                <CardTitle>General Settings</CardTitle>
            </CardHeader>
            <CardContent>
                <form action={handleSubmit} className="space-y-6">
                    <div className="space-y-2">
                        <Label htmlFor="name">Gym Name</Label>
                        <Input id="name" name="name" defaultValue={gym.name} required />
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="primaryColor">Primary Color</Label>
                        <div className="flex gap-2">
                            <Input
                                id="primaryColor"
                                name="primaryColor"
                                type="color"
                                defaultValue={gym.primaryColor}
                                className="w-12 p-1 h-10"
                            />
                            <Input
                                name="primaryColorText"
                                defaultValue={gym.primaryColor}
                                className="flex-1"
                                onChange={(e) => {
                                    const val = e.target.value;
                                    const colorInput = document.getElementById('primaryColor') as HTMLInputElement;
                                    if (colorInput) colorInput.value = val;
                                }}
                            />
                        </div>
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="aiTone">AI Coach Personality</Label>
                        <Select name="aiTone" defaultValue={gym.aiTone}>
                            <SelectTrigger>
                                <SelectValue placeholder="Select tone" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="motivational">Motivational</SelectItem>
                                <SelectItem value="strict">Strict Drill Sergeant</SelectItem>
                                <SelectItem value="analytical">Analytical & Technical</SelectItem>
                                <SelectItem value="friendly">Friendly & Casual</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>

                    <div className="flex justify-end">
                        <Button type="submit" disabled={isLoading}>
                            {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                            Save Changes
                        </Button>
                    </div>
                </form>
            </CardContent>
        </Card>
    )
}

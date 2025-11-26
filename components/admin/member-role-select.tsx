'use client'

import { updateMemberRole } from "@/app/actions/admin"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useState } from "react"
import { toast } from "sonner"

interface MemberRoleSelectProps {
    memberId: string
    currentRole: string
}

export function MemberRoleSelect({ memberId, currentRole }: MemberRoleSelectProps) {
    const [role, setRole] = useState(currentRole)
    const [isLoading, setIsLoading] = useState(false)

    async function handleRoleChange(newRole: string) {
        setIsLoading(true)
        try {
            await updateMemberRole(memberId, newRole)
            setRole(newRole)
            toast.success("Member role updated")
        } catch (error) {
            console.error(error)
            toast.error("Failed to update role")
            // Revert on error if needed, but state update happens after success here (mostly)
            // Actually, for optimistic UI, we could set it first, but let's keep it simple.
        } finally {
            setIsLoading(false)
        }
    }

    return (
        <Select value={role} onValueChange={handleRoleChange} disabled={isLoading}>
            <SelectTrigger className="w-[140px]">
                <SelectValue placeholder="Select role" />
            </SelectTrigger>
            <SelectContent>
                <SelectItem value="member">Member</SelectItem>
                <SelectItem value="admin">Admin</SelectItem>
                <SelectItem value="coach">Coach</SelectItem>
            </SelectContent>
        </Select>
    )
}

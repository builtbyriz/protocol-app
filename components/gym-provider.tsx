'use client'

import { createContext, useContext, useEffect } from 'react'
import { usePathname } from 'next/navigation'

interface GymContextType {
    id: string
    name: string
    primaryColor: string
    logoUrl: string | null
}

const GymContext = createContext<GymContextType | null>(null)

export function useGym() {
    return useContext(GymContext)
}

export function GymProvider({
    children,
    gym
}: {
    children: React.ReactNode
    gym: GymContextType
}) {
    useEffect(() => {
        if (gym.primaryColor) {
            // Convert hex to oklch or just use hex if tailwind config allows
            // For now, assuming we can set it as a hex value and update the variable
            // But shadcn uses oklch. We might need a helper to convert or just set the hex
            // if we modify the tailwind config to use the variable directly.

            // Actually, with Tailwind v4, we can just set the variable.
            // However, shadcn uses --primary: oklch(...).
            // If we want to use hex, we should probably update the variable to be a hex value
            // or convert it.

            // Simpler approach for now: Set a style attribute on the body or root
            document.documentElement.style.setProperty('--primary', gym.primaryColor)

            // We might need to handle the foreground color too for contrast
        }
    }, [gym.primaryColor])

    return (
        <GymContext.Provider value={gym}>
            {children}
        </GymContext.Provider>
    )
}

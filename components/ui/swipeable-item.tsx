'use client'

import { motion, useAnimation, PanInfo } from 'framer-motion'
import { Check } from 'lucide-react'
import { useState } from 'react'
import { useHaptic } from '@/hooks/use-haptic'
import { cn } from '@/lib/utils'

interface SwipeableItemProps {
    children: React.ReactNode
    onComplete?: () => void
    className?: string
}

export function SwipeableItem({ children, onComplete, className }: SwipeableItemProps) {
    const [isCompleted, setIsCompleted] = useState(false)
    const controls = useAnimation()
    const { trigger } = useHaptic()

    const handleDragEnd = async (event: any, info: PanInfo) => {
        const threshold = 100 // px to trigger completion

        if (info.offset.x > threshold && !isCompleted) {
            // Success swipe
            setIsCompleted(true)
            trigger('success')
            if (onComplete) onComplete()
            await controls.start({ x: 0 }) // Snap back but keep completed state visual
        } else {
            // Reset
            controls.start({ x: 0 })
        }
    }

    return (
        <div className={cn("relative overflow-hidden rounded-md", className)}>
            {/* Background Success State */}
            <div
                className={cn(
                    "absolute inset-0 flex items-center px-4 transition-colors duration-300",
                    isCompleted ? "bg-green-500/20" : "bg-green-500"
                )}
            >
                <Check className="text-white h-5 w-5" />
            </div>

            {/* Foreground Content */}
            <motion.div
                drag="x"
                dragConstraints={{ left: 0, right: 0 }} // Only allow dragging, but snap back
                dragElastic={{ right: 0.5, left: 0.1 }} // Easier to drag right
                onDragEnd={handleDragEnd}
                animate={controls}
                className={cn(
                    "relative bg-card border rounded-md p-3 transition-colors",
                    isCompleted && "bg-green-500/10 border-green-500/20"
                )}
                style={{ x: 0 }}
            >
                <div className={cn("transition-opacity", isCompleted && "opacity-50")}>
                    {children}
                </div>
            </motion.div>
        </div>
    )
}

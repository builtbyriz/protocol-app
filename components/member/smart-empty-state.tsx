'use client'

import { motion } from "framer-motion"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import { LucideIcon } from "lucide-react"

interface SmartEmptyStateProps {
    icon: LucideIcon
    title: string
    description: string
    actionLabel: string
    actionHref: string
}

export function SmartEmptyState({ icon: Icon, title, description, actionLabel, actionHref }: SmartEmptyStateProps) {
    return (
        <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5 }}
            className="flex flex-col items-center justify-center text-center p-8 border border-dashed rounded-xl bg-muted/5 space-y-4"
        >
            <div className="p-4 bg-background rounded-full shadow-sm">
                <Icon className="h-8 w-8 text-primary" />
            </div>
            <div className="space-y-1 max-w-xs">
                <h3 className="font-semibold text-lg">{title}</h3>
                <p className="text-sm text-muted-foreground">{description}</p>
            </div>
            <Button asChild variant="default" size="sm" className="mt-2">
                <Link href={actionHref}>
                    {actionLabel}
                </Link>
            </Button>
        </motion.div>
    )
}

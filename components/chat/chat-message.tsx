import { cn } from "@/lib/utils"
import { User, Bot } from "lucide-react"

interface ChatMessageProps {
    role: 'user' | 'assistant' | 'system'
    content: string
}

import { motion } from "framer-motion"

export function ChatMessage({ role, content }: ChatMessageProps) {
    if (role === 'system') return null

    return (
        <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
            className={cn(
                "flex w-full items-start gap-4 p-4",
                role === 'user' ? "flex-row-reverse bg-muted/50" : "bg-background"
            )}
        >
            <div
                className={cn(
                    "flex h-8 w-8 shrink-0 select-none items-center justify-center rounded-md border shadow",
                    role === 'user' ? "bg-primary text-primary-foreground" : "bg-background"
                )}
            >
                {role === 'user' ? <User className="h-4 w-4" /> : <Bot className="h-4 w-4" />}
            </div>
            <div className={cn("flex-1 space-y-2 overflow-hidden", role === 'user' ? "text-right" : "text-left")}>
                <div className="prose break-words dark:prose-invert">
                    {content.split('\n').map((line, i) => (
                        <p key={i} className="mb-1 last:mb-0">{line}</p>
                    ))}
                </div>
            </div>
        </motion.div>
    )
}

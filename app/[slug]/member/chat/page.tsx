
'use client'

import { useChat } from '@ai-sdk/react'
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card } from "@/components/ui/card"
import { ChatMessage } from "@/components/chat/chat-message"
import { Send, Bot } from "lucide-react"
import { useEffect, useRef, useState, Suspense } from "react"
import { useGym } from "@/components/gym-provider"
import { useSearchParams } from "next/navigation"

export const runtime = 'edge';

function ChatInterface({ gymId }: { gymId: string }) {
    const searchParams = useSearchParams()
    const initialPrompt = searchParams.get('initialPrompt')

    const [messages, setMessages] = useState<any[]>([])
    const [input, setInput] = useState(initialPrompt || '')
    const [isLoading, setIsLoading] = useState(false)
    const [error, setError] = useState<any>(null)
    const scrollRef = useRef<HTMLDivElement>(null)

    useEffect(() => {
        if (initialPrompt) {
            setInput(initialPrompt)
        }
    }, [initialPrompt])

    useEffect(() => {
        if (scrollRef.current) {
            scrollRef.current.scrollTop = scrollRef.current.scrollHeight
        }
    }, [messages])

    const handleSend = async (e?: React.FormEvent) => {
        if (e) e.preventDefault()
        if (!input.trim() || isLoading) return

        const userMessage = { id: Date.now().toString(), role: 'user', content: input }
        setMessages(prev => [...prev, userMessage])
        setInput('')
        setIsLoading(true)
        setError(null)

        try {
            const response = await fetch(`/api/chat/${gymId}`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ messages: [...messages, userMessage] })
            })

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`)
            }

            const reader = response.body?.getReader()
            const decoder = new TextDecoder()
            let assistantMessage = { id: (Date.now() + 1).toString(), role: 'assistant', content: '' }
            setMessages(prev => [...prev, assistantMessage])

            if (reader) {
                while (true) {
                    const { done, value } = await reader.read()
                    if (done) break
                    const chunk = decoder.decode(value, { stream: true })
                    assistantMessage.content += chunk
                    setMessages(prev => {
                        const newMessages = [...prev]
                        newMessages[newMessages.length - 1] = { ...assistantMessage }
                        return newMessages
                    })
                }
            }
        } catch (err: any) {
            console.error('Chat error:', err)
            setError(err)
        } finally {
            setIsLoading(false)
        }
    }

    const suggestedQuestions = [
        "What's the workout for today?",
        "How do I scale the WOD?",
        "What's a good warm-up for squats?",
        "Track my result for today."
    ]

    return (
        <div className="flex h-[calc(100vh-8rem)] flex-col space-y-4 p-4 md:p-8">
            <Card className="flex flex-1 flex-col overflow-hidden">
                <div className="flex-1 overflow-y-auto p-4" ref={scrollRef}>
                    {messages.length === 0 && (
                        <div className="flex h-full flex-col items-center justify-center text-center text-muted-foreground space-y-6">
                            <div className="flex flex-col items-center space-y-2">
                                <Bot className="h-12 w-12 opacity-20" />
                                <h3 className="text-lg font-semibold">AI Coach</h3>
                                <p>Ask me anything about your workouts, nutrition, or the gym.</p>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-2 w-full max-w-md">
                                {suggestedQuestions.map((q, i) => (
                                    <Button
                                        key={i}
                                        variant="outline"
                                        className="text-sm h-auto py-2 px-3 whitespace-normal text-left justify-start"
                                        onClick={() => {
                                            setInput(q)
                                        }}
                                    >
                                        {q}
                                    </Button>
                                ))}
                            </div>
                        </div>
                    )}
                    {messages.map((m: any) => (
                        <ChatMessage key={m.id} role={m.role as 'user' | 'assistant'} content={m.content} />
                    ))}
                    {isLoading && messages[messages.length - 1]?.role === 'user' && (
                        <div className="flex w-full items-start gap-4 p-4 bg-background">
                            <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-md border shadow bg-background">
                                <Bot className="h-4 w-4 animate-pulse" />
                            </div>
                            <div className="flex items-center gap-1 h-8">
                                <span className="h-2 w-2 rounded-full bg-muted-foreground/40 animate-bounce [animation-delay:-0.3s]"></span>
                                <span className="h-2 w-2 rounded-full bg-muted-foreground/40 animate-bounce [animation-delay:-0.15s]"></span>
                                <span className="h-2 w-2 rounded-full bg-muted-foreground/40 animate-bounce"></span>
                            </div>
                        </div>
                    )}
                    {error && (
                        <div className="p-4 text-red-500 bg-red-50 rounded-md m-4 text-sm">
                            Error: {error.message}
                        </div>
                    )}
                </div>
                <div className="border-t p-4 bg-background">
                    <div className="flex gap-2">
                        <Input
                            value={input}
                            onChange={(e) => setInput(e.target.value)}
                            onKeyDown={(e) => {
                                if (e.key === 'Enter') {
                                    handleSend()
                                }
                            }}
                            placeholder="Ask your coach..."
                            className="flex-1"
                            disabled={isLoading}
                        />
                        <Button
                            type="button"
                            size="icon"
                            onClick={() => handleSend()}
                            disabled={isLoading || !input.trim()}
                        >
                            <Send className="h-4 w-4" />
                            <span className="sr-only">Send</span>
                        </Button>
                    </div>
                </div>
            </Card>
        </div>
    )
}

export default function ChatPage() {
    const gym = useGym()

    if (!gym) {
        return <div className="p-8 text-center">Loading gym context...</div>
    }

    return (
        <Suspense fallback={<div className="p-8 text-center">Loading chat...</div>}>
            <ChatInterface gymId={gym.id} />
        </Suspense>
    )
}

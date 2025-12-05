import { auth } from '@/lib/auth'
import { prisma } from '@/lib/db'
import { askGymCoach } from '@/lib/ai/gym-coach'
import { NextResponse } from 'next/server'

export const maxDuration = 30
export const dynamic = 'force-dynamic'


export async function POST(req: Request, { params }: { params: Promise<{ gymId: string }> }) {
    try {
        const session = await auth()
        const { gymId } = await params
        const body = await req.json()
        const { messages } = body

        if (!session?.user?.id) {
            return new NextResponse('Unauthorized', { status: 401 })
        }

        if (!messages || !Array.isArray(messages) || !gymId) {
            return new NextResponse('Invalid request', { status: 400 })
        }

        const lastMessage = messages[messages.length - 1]

        // Use the new RAG-based AI Coach
        const responseText = await askGymCoach(gymId, session.user.id, lastMessage.content)

        // Record usage
        try {
            await prisma.aIUsage.create({
                data: {
                    gymId,
                    memberId: session.user.id,
                    feature: 'chat',
                    tokensUsed: 0, // TODO: Get token usage from Gemini response if possible
                    cost: 0,
                    model: 'gemini-2.0-flash',
                }
            })
        } catch (error) {
            console.error('Failed to record usage:', error)
        }

        return new NextResponse(responseText)

    } catch (error: any) {
        console.error('Chat error:', error)
        return new NextResponse(`Internal Error: ${error.message}`, { status: 500 })
    }
}

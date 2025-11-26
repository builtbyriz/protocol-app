import { google } from '@ai-sdk/google'
import { generateText } from 'ai'
import { queryGymKnowledge } from '@/lib/rag/gym-knowledge'

export async function askGymCoach(
    gymId: string,
    userId: string,
    question: string
): Promise<string> {
    // Get relevant context from gym's methodology
    const relevantDocs = await queryGymKnowledge(gymId, question, 5)

    const context = relevantDocs.length > 0
        ? relevantDocs.map(d => `[From ${d.fileName}]:\n${d.text}`).join('\n\n---\n\n')
        : 'No specific methodology documents found.'

    const systemPrompt = `You are an AI coach for a functional fitness gym.
You answer questions based on the gym's specific methodology and training philosophy.

IMPORTANT RULES:
1. Base your answers on the provided methodology context when available
2. If the context doesn't cover the question, use general fitness best practices but note this
3. Be encouraging and supportive
4. Keep answers practical and actionable
5. If asked about nutrition, remind them to consult a registered dietitian for personalized advice
6. Never recommend specific supplements or medications

GYM METHODOLOGY CONTEXT:
${context}
`

    const { text } = await generateText({
        model: google('gemini-2.0-flash'),
        system: systemPrompt,
        prompt: question,
    })

    return text
}

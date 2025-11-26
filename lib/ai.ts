import { google } from '@ai-sdk/google'
import { generateText } from 'ai'

export type Message = {
    role: 'system' | 'user' | 'assistant'
    content: string
}

export async function generateResponse(messages: Message[], context: string) {
    const systemPrompt = `You are an expert gym coach and assistant for "Protocol", a high-performance gym management platform.
  
  Your goal is to help members with their workouts, nutrition, and gym-related questions.
  
  Use the following context (retrieved from the gym's knowledge base) to answer the user's question.
  If the answer is not in the context, use your general fitness knowledge but mention that it's general advice.
  Always be encouraging, professional, and concise.
  
  CONTEXT:
  ${context}
  `

    const response = await generateText({
        model: google('gemini-2.0-flash-exp'), // Using latest experimental as proxy for "3 Pro" until available
        system: systemPrompt,
        messages: messages.map(m => ({ role: m.role, content: m.content })),
    })

    return response
}

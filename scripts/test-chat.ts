import { google } from '@ai-sdk/google'
import { generateText } from 'ai'
import { prisma } from '../lib/db'
import { retrieveContext } from '../lib/rag'
import * as dotenv from 'dotenv'

dotenv.config()

async function main() {
    const gym = await prisma.gym.findUnique({ where: { slug: 'demo-gym' } })
    if (!gym) {
        console.error('Demo gym not found')
        return
    }

    const questions = [
        "What is the workout for Week 8 Day 3?",
        "How long should I warm up?",
        "What's the best diet for muscle gain?"
    ]

    for (const query of questions) {
        console.log(`\n-----------------------------------`)
        console.log(`Question: "${query}"`)

        // 1. Retrieve Context
        console.log('Retrieving context...')
        const context = await retrieveContext(gym.id, query)
        console.log('Context retrieved (first 100 chars):', context.substring(0, 100).replace(/\n/g, ' ') + '...')

        // 2. Generate Response
        const systemPrompt = `You are an expert gym coach and assistant for "Protocol", a high-performance gym management platform.
        
        Your goal is to help members with their workouts, nutrition, and gym-related questions.
        
        Use the following context (retrieved from the gym's knowledge base) to answer the user's question.
        If the answer is not in the context, use your general fitness knowledge but mention that it's general advice.
        Always be encouraging, professional, and concise.
        
        CONTEXT:
        ${context}
        `

        console.log('Generating response...')
        try {
            const { text } = await generateText({
                model: google('gemini-2.0-flash-exp'),
                system: systemPrompt,
                messages: [{ role: 'user', content: query }],
            })

            console.log('\nAI Response:')
            console.log(text)
        } catch (error) {
            console.error('Error generating response:', error)
        }
    }
}

main()

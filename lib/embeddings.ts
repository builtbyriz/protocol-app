import { openai } from '@ai-sdk/openai'
import { embed } from 'ai'

export async function generateEmbedding(text: string): Promise<number[]> {
    try {
        // OpenAI recommends replacing newlines with spaces for best results
        const input = text.replace(/\n/g, ' ')

        const { embedding } = await embed({
            model: openai.embedding('text-embedding-3-small'),
            value: input,
        })

        return embedding
    } catch (error) {
        console.error('Error generating embedding:', error)
        throw error
    }
}

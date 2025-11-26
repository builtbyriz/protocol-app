import { generateEmbedding } from '../lib/embeddings'
import * as dotenv from 'dotenv'

dotenv.config()

async function main() {
    const text = "This is a test sentence to generate an embedding."
    console.log(`Generating embedding for: "${text}"...`)

    try {
        const vector = await generateEmbedding(text)
        console.log('Embedding generated successfully!')
        console.log(`Vector length: ${vector.length}`)
        console.log(`First 5 dimensions: ${vector.slice(0, 5)}...`)
    } catch (error) {
        console.error('Error:', error)
    }
}

main()

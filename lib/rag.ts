import { generateEmbedding } from './embeddings'
import { prisma } from './db'

export async function retrieveContext(gymId: string, query: string, limit: number = 10): Promise<string> {
    try {
        const embedding = await generateEmbedding(query)
        const vectorString = `[${embedding.join(',')}]`

        // Query for similar documents
        // Note: We need to cast the vector to the correct type for the operator
        // The <-> operator is for Euclidean distance, <=> is for Cosine distance (usually preferred for embeddings)
        // But pgvector often uses <-> by default for indexing. Let's use <=> for cosine distance if available, or <->.
        // Prisma raw query returns unknown[], so we need to cast or map.

        const results = await prisma.$queryRaw`
      SELECT content, 1 - (embedding <=> ${vectorString}::vector) as similarity
      FROM "GymKnowledge"
      WHERE "gymId" = ${gymId}
      ORDER BY embedding <=> ${vectorString}::vector
      LIMIT ${limit}
    ` as { content: string, similarity: number }[]

        if (!results || results.length === 0) {
            return ''
        }

        // Combine chunks into a single context string
        return results.map(r => r.content).join('\n\n---\n\n')
    } catch (error) {
        console.error('Error retrieving context:', error)
        // Fallback: return empty context so chat can still proceed (just without specific knowledge)
        return ''
    }
}

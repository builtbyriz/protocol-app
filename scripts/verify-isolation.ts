import { prisma } from '@/lib/db'
import { generateEmbedding } from '@/lib/embeddings'

async function main() {
    console.log('--- Starting Multi-Tenancy Verification ---')

    // 1. Setup: Get Gym A (Demo Gym)
    const gymA = await prisma.gym.findUnique({ where: { slug: 'demo-gym' } })
    if (!gymA) return console.error('Gym A (demo-gym) not found')

    // 2. Setup: Create Gym B
    const gymBSlug = 'test-gym-b'
    let gymB = await prisma.gym.findUnique({ where: { slug: gymBSlug } })
    if (!gymB) {
        console.log('Creating Gym B...')
        gymB = await prisma.gym.create({
            data: {
                name: 'Test Gym B',
                slug: gymBSlug,
                primaryColor: '#0000FF',
                aiTone: 'analytical',
            }
        })
    }

    // 3. Ingest Unique Content for Gym B
    const uniqueContent = "Gym B Secret Protocol: Always do 100 burpees before entering."
    const embedding = await generateEmbedding(uniqueContent)
    const vectorString = `[${embedding.join(',')}]`

    // Clean up previous test data for Gym B
    await prisma.$executeRaw`DELETE FROM "GymKnowledge" WHERE "gymId" = ${gymB.id}`

    await prisma.$executeRaw`
      INSERT INTO "GymKnowledge" ("gymId", "content", "embedding", "sourceFile", "createdAt")
      VALUES (${gymB.id}, ${uniqueContent}, ${vectorString}::vector, 'secret-doc.txt', NOW())
    `
    console.log('Ingested unique content for Gym B.')

    // 4. Test Leakage: Search Gym A for Gym B's content
    const query = "What is the secret protocol?"
    const queryEmbedding = await generateEmbedding(query)
    const queryVectorString = `[${queryEmbedding.join(',')}]`

    console.log(`\nSearching Gym A (${gymA.name}) for: "${query}"`)
    const resultsA = await prisma.$queryRaw`
      SELECT content, 1 - (embedding <=> ${queryVectorString}::vector) as similarity
      FROM "GymKnowledge"
      WHERE "gymId" = ${gymA.id}
      ORDER BY similarity DESC
      LIMIT 3
    ` as { content: string, similarity: number }[]

    if (resultsA.length === 0) {
        console.log('SUCCESS: No results found in Gym A (Expected).')
    } else {
        console.log('Results in Gym A:')
        resultsA.forEach(r => console.log(`- ${r.content.substring(0, 50)}... (${r.similarity.toFixed(4)})`))

        const leaked = resultsA.some(r => r.content.includes("Gym B Secret Protocol"))
        if (leaked) {
            console.error('FAILURE: Gym B content leaked into Gym A search!')
        } else {
            console.log('SUCCESS: Gym B content NOT found in Gym A results.')
        }
    }

    // 5. Verify Access: Search Gym B for Gym B's content
    console.log(`\nSearching Gym B (${gymB.name}) for: "${query}"`)
    const resultsB = await prisma.$queryRaw`
      SELECT content, 1 - (embedding <=> ${queryVectorString}::vector) as similarity
      FROM "GymKnowledge"
      WHERE "gymId" = ${gymB.id}
      ORDER BY similarity DESC
      LIMIT 3
    ` as { content: string, similarity: number }[]

    if (resultsB.length > 0 && resultsB[0].content.includes("Gym B Secret Protocol")) {
        console.log('SUCCESS: Gym B content found in Gym B search.')
    } else {
        console.error('FAILURE: Gym B content NOT found in Gym B search.')
    }

    // Cleanup
    await prisma.gymKnowledge.deleteMany({ where: { gymId: gymB.id } })
    await prisma.gym.delete({ where: { id: gymB.id } })
    console.log('\nCleanup complete.')
}

main()

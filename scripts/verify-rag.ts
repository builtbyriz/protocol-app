import { prisma } from '../lib/db'
import { generateEmbedding } from '../lib/embeddings'

async function main() {
    const gym = await prisma.gym.findUnique({ where: { slug: 'demo-gym' } })
    if (!gym) return

    // 1. Check counts
    const count = await prisma.gymKnowledge.count({
        where: { gymId: gym.id }
    })
    console.log(`Total Knowledge Chunks: ${count}`)

    if (count === 0) return

    // 2. Test Vector Search
    const query = "What is the workout for Week 8 Day 3?"
    console.log(`\nTesting vector search for: "${query}"...`)

    const embedding = await generateEmbedding(query)
    const vectorString = `[${embedding.join(',')}]`

    const results = await prisma.$queryRaw`
        SELECT content, 1 - (embedding <=> ${vectorString}::vector) as similarity
        FROM "GymKnowledge"
        WHERE "gymId" = ${gym.id}
        ORDER BY similarity DESC
        LIMIT 10
    `

    console.log('\nTop 3 Results:')
    // @ts-ignore
    results.forEach((r: any, i: number) => {
        console.log(`\n--- Result ${i + 1} (Similarity: ${r.similarity.toFixed(4)}) ---`)
        console.log(r.content.substring(0, 200) + '...')
    })
}

main()

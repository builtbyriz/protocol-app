import { google } from '@ai-sdk/google'
import { embed, embedMany } from 'ai'
import { prisma } from '@/lib/db'
import { listFilesInFolder, getFileContent } from '@/lib/google-drive'


const CHUNK_SIZE = 1000
const CHUNK_OVERLAP = 200

export async function syncGymDocuments(gymId: string, folderId: string) {
    // Get files from Google Drive
    const files = await listFilesInFolder(folderId)

    for (const file of files) {
        try {
            // Check if already synced and unchanged
            const existing = await prisma.gymDocument.findUnique({
                where: {
                    gymId_driveFileId: { gymId, driveFileId: file.id }
                }
            })

            const lastModified = new Date(file.modifiedTime)
            if (existing && existing.lastSyncedAt >= lastModified) {
                continue // Skip unchanged files
            }

            // Fetch content
            const contentStream = await getFileContent(file.id)
            const content = await streamToText(contentStream, file.mimeType)

            if (!content) {
                console.warn(`Could not extract text from ${file.name}`)
                continue
            }

            // Upsert document
            const doc = await prisma.gymDocument.upsert({
                where: {
                    gymId_driveFileId: { gymId, driveFileId: file.id }
                },
                create: {
                    gymId,
                    driveFileId: file.id,
                    fileName: file.name,
                    mimeType: file.mimeType,
                    content,
                    lastSyncedAt: new Date(),
                },
                update: {
                    content,
                    lastSyncedAt: new Date(),
                }
            })

            // Delete old embeddings
            await prisma.gymEmbedding.deleteMany({
                where: { documentId: doc.id }
            })

            // Chunk and embed
            await chunkAndEmbed(gymId, doc.id, content)

        } catch (error) {
            console.error(`Error syncing ${file.name}:`, error)
        }
    }
}

import { splitForEmbedding } from '@/lib/text-splitter'

async function chunkAndEmbed(gymId: string, documentId: string, content: string) {
    const chunks = splitForEmbedding(content, {
        chunkSize: CHUNK_SIZE,
        chunkOverlap: CHUNK_OVERLAP,
    })

    // Embed in batches
    const batchSize = 20
    for (let i = 0; i < chunks.length; i += batchSize) {
        const batch = chunks.slice(i, i + batchSize)
        const batchTexts = batch.map(c => c.text)

        const { embeddings } = await embedMany({
            model: google.textEmbeddingModel('text-embedding-004'),
            values: batchTexts,
        })

        // Insert embeddings
        for (let j = 0; j < batch.length; j++) {
            const chunk = batch[j]
            const embedding = embeddings[j]

            // Use raw SQL for vector insert
            await prisma.$executeRaw`
                INSERT INTO "GymEmbedding" (id, "gymId", "documentId", "chunkIndex", "chunkText", embedding, "createdAt")
                VALUES (
                    ${`emb_${gymId}_${documentId}_${chunk.index}`},
                    ${gymId},
                    ${documentId},
                    ${chunk.index},
                    ${chunk.text},
                    ${embedding}::vector,
                    NOW()
                )
            `
        }
    }
}

export async function queryGymKnowledge(
    gymId: string,
    query: string,
    topK = 5
): Promise<{ text: string; fileName: string; score: number }[]> {
    // Embed the query
    const { embedding } = await embed({
        model: google.textEmbeddingModel('text-embedding-004'),
        value: query,
    })

    // Vector similarity search
    const results = await prisma.$queryRaw<Array<{
        chunkText: string
        fileName: string
        score: number
    }>>`
        SELECT
            e."chunkText",
            d."fileName",
            1 - (e.embedding <=> ${embedding}::vector) as score
        FROM "GymEmbedding" e
        JOIN "GymDocument" d ON e."documentId" = d.id
        WHERE e."gymId" = ${gymId}
        ORDER BY e.embedding <=> ${embedding}::vector
        LIMIT ${topK}
    `

    return results.map(r => ({
        text: r.chunkText,
        fileName: r.fileName,
        score: r.score,
    }))
}

async function streamToText(stream: ReadableStream, mimeType: string): Promise<string | null> {
    const reader = stream.getReader()
    const chunks: Uint8Array[] = []

    while (true) {
        const { done, value } = await reader.read()
        if (done) break
        chunks.push(value)
    }

    const buffer = new Uint8Array(chunks.reduce((acc, chunk) => acc + chunk.length, 0))
    let offset = 0
    for (const chunk of chunks) {
        buffer.set(chunk, offset)
        offset += chunk.length
    }

    // For PDFs, we need server-side extraction
    // For now, handle text-based formats
    if (mimeType === 'application/pdf') {
        // TODO: Use external PDF extraction service or Cloudflare Workers AI
        // For MVP, skip PDFs or use a webhook to process them
        return null
    }

    // Word docs via Google Drive export
    if (mimeType === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document') {
        // Google Drive can export as plain text
        // Modify getFileContent to use export endpoint
        return null
    }

    // Plain text
    return new TextDecoder().decode(buffer)
}

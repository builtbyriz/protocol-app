// lib/text-splitter.ts
// Lightweight text splitter for Edge Runtime
// Replaces @langchain/textsplitters which has Node.js dependencies

export interface TextChunk {
    text: string
    index: number
}

export interface SplitterOptions {
    chunkSize?: number
    chunkOverlap?: number
    separators?: string[]
}

const DEFAULT_SEPARATORS = ['\n\n', '\n', '. ', ' ', '']

export function splitText(
    text: string,
    options: SplitterOptions = {}
): TextChunk[] {
    const {
        chunkSize = 1000,
        chunkOverlap = 200,
        separators = DEFAULT_SEPARATORS
    } = options

    const chunks: string[] = []

    function splitRecursively(text: string, separatorIndex: number): string[] {
        if (text.length <= chunkSize) {
            return [text]
        }

        if (separatorIndex >= separators.length) {
            return splitBySize(text, chunkSize, chunkOverlap)
        }

        const separator = separators[separatorIndex]
        const parts = text.split(separator)

        const result: string[] = []
        let currentChunk = ''

        for (const part of parts) {
            const potentialChunk = currentChunk
                ? currentChunk + separator + part
                : part

            if (potentialChunk.length <= chunkSize) {
                currentChunk = potentialChunk
            } else {
                if (currentChunk) {
                    result.push(currentChunk)
                }

                if (part.length > chunkSize) {
                    const subChunks = splitRecursively(part, separatorIndex + 1)
                    result.push(...subChunks.slice(0, -1))
                    currentChunk = subChunks[subChunks.length - 1] || ''
                } else {
                    currentChunk = part
                }
            }
        }

        if (currentChunk) {
            result.push(currentChunk)
        }

        return result
    }

    function splitBySize(text: string, size: number, overlap: number): string[] {
        const result: string[] = []
        let start = 0

        while (start < text.length) {
            const end = Math.min(start + size, text.length)
            result.push(text.slice(start, end))
            start = end - overlap

            if (start + overlap >= text.length) break
        }

        return result
    }

    const rawChunks = splitRecursively(text, 0)

    for (let i = 0; i < rawChunks.length; i++) {
        let chunk = rawChunks[i]

        if (i > 0 && chunkOverlap > 0) {
            const prevChunk = rawChunks[i - 1]
            const overlapText = prevChunk.slice(-chunkOverlap)

            if (chunk.length + overlapText.length <= chunkSize * 1.2) {
                const breakIndex = overlapText.lastIndexOf(' ')
                if (breakIndex > 0) {
                    chunk = overlapText.slice(breakIndex + 1) + ' ' + chunk
                }
            }
        }

        chunks.push(chunk.trim())
    }

    return chunks
        .filter(chunk => chunk.length > 0)
        .map((text, index) => ({ text, index }))
}

export function splitForEmbedding(
    text: string,
    options: SplitterOptions = {}
): TextChunk[] {
    const cleaned = text
        .replace(/\r\n/g, '\n')
        .replace(/\n{3,}/g, '\n\n')
        .replace(/[ \t]+/g, ' ')
        .trim()

    return splitText(cleaned, {
        chunkSize: 1000,
        chunkOverlap: 200,
        ...options
    })
}

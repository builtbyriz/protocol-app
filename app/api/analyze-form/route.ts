import { NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { prisma } from '@/lib/db'
import { analyzeMovement } from '@/lib/ai/movement-analyzer'
import { uploadToR2, getSignedUrl } from '@/lib/storage/r2'



export async function POST(req: Request) {
    try {
        const session = await auth()
        if (!session?.user?.id) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
        }

        const formData = await req.formData()
        const file = formData.get('video') as File
        const exerciseType = formData.get('exerciseType') as string || 'squat'

        if (!file) {
            return NextResponse.json({ error: 'No file uploaded' }, { status: 400 })
        }

        // Validate file type and size
        const validTypes = ['video/mp4', 'video/quicktime', 'video/webm']
        if (!validTypes.includes(file.type)) {
            return NextResponse.json({ error: 'Invalid file type. Use MP4, MOV, or WebM' }, { status: 400 })
        }

        const maxSize = 50 * 1024 * 1024 // 50MB
        if (file.size > maxSize) {
            return NextResponse.json({ error: 'File too large. Max 50MB' }, { status: 400 })
        }

        // Upload to R2
        const fileName = `analyses/${session.user.id}/${Date.now()}-${file.name}`
        const arrayBuffer = await file.arrayBuffer()
        const uploadResult = await uploadToR2(fileName, arrayBuffer, file.type)

        if (!uploadResult.success) {
            return NextResponse.json({ error: 'Upload failed' }, { status: 500 })
        }

        // Get signed URL for AI to access
        const videoUrl = await getSignedUrl(fileName)

        // Analyze with Gemini
        const analysis = await analyzeMovement(videoUrl, exerciseType)

        // Store in database
        const savedAnalysis = await prisma.formAnalysis.create({
            data: {
                userId: session.user.id,
                exerciseType,
                videoKey: fileName,
                score: analysis.score,
                summary: analysis.summary,
                corrections: analysis.corrections,
                praise: analysis.praise,
                rawResponse: analysis.rawResponse,
            }
        })

        return NextResponse.json({
            id: savedAnalysis.id,
            score: analysis.score,
            summary: analysis.summary,
            corrections: analysis.corrections,
            praise: analysis.praise,
        })

    } catch (error) {
        console.error('Analysis error:', error)
        return NextResponse.json(
            { error: 'Analysis failed. Please try again.' },
            { status: 500 }
        )
    }
}

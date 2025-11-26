import { google } from '@ai-sdk/google'
import { generateObject } from 'ai'
import { z } from 'zod'

const analysisSchema = z.object({
    score: z.number().min(0).max(100),
    summary: z.string(),
    corrections: z.array(z.string()),
    praise: z.array(z.string()),
})

const exercisePrompts: Record<string, string> = {
    squat: `Analyze this squat video for form. Focus on:
- Depth (hip crease below knee at bottom)
- Knee tracking (knees over toes, not caving)
- Back position (neutral spine, chest up)
- Weight distribution (midfoot, heels not lifting)
- Bar path (vertical, not drifting forward)`,

    deadlift: `Analyze this deadlift video for form. Focus on:
- Starting position (hips, shoulders, bar over midfoot)
- Back position (neutral spine throughout)
- Bar path (staying close to body)
- Hip hinge pattern (hips and shoulders rising together)
- Lockout (full hip extension, not hyperextending)`,

    bench: `Analyze this bench press video for form. Focus on:
- Setup (arch, shoulder blade retraction, foot position)
- Bar path (diagonal from chest to lockout)
- Elbow angle (45-75 degrees from torso)
- Touch point (lower chest)
- Leg drive (consistent through lift)`,

    default: `Analyze this exercise video for form. Focus on:
- Range of motion
- Control and tempo
- Joint alignment
- Core engagement
- Overall movement quality`
}

export async function analyzeMovement(
    videoUrl: string,
    exerciseType: string
): Promise<{
    score: number
    summary: string
    corrections: string[]
    praise: string[]
    rawResponse: string
}> {
    const prompt = exercisePrompts[exerciseType] || exercisePrompts.default

    const systemPrompt = `You are an expert strength and conditioning coach with 15+ years of experience.
You analyze exercise form videos and provide actionable feedback.

Your feedback style:
- Be specific and actionable (not "watch your back" but "keep your chest up to prevent lower back rounding")
- Reference timestamps when possible ("at 0:03, your knees start caving")
- Prioritize safety-critical issues first
- Be encouraging but honest
- Limit corrections to the 3 most important issues
- Acknowledge what's being done well

Scoring guide:
- 90-100: Competition-ready form, minor optimizations only
- 80-89: Good form, 1-2 minor issues to address
- 70-79: Acceptable form, needs work on fundamentals
- 60-69: Form issues that limit progress or risk injury
- Below 60: Stop and address major form breakdown before adding weight`

    try {
        const { object } = await generateObject({
            model: google('gemini-2.0-flash'),
            schema: analysisSchema,
            system: systemPrompt,
            messages: [
                {
                    role: 'user',
                    content: [
                        { type: 'text', text: prompt },
                        { type: 'file', data: videoUrl, mimeType: 'video/mp4' } as any
                    ]
                }
            ],
        })

        return {
            score: object.score,
            summary: object.summary,
            corrections: object.corrections,
            praise: object.praise,
            rawResponse: JSON.stringify(object),
        }
    } catch (error) {
        console.error('Gemini analysis error:', error)
        throw new Error('Failed to analyze video')
    }
}

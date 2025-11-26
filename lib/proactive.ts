import { prisma } from './db'
import { google } from '@ai-sdk/google'
import { generateText } from 'ai'

type ProactiveTrigger = 'absence' | 'pr_celebration' | 'streak'

export async function generateProactiveMessage(
    memberId: string,
    gymId: string,
    trigger: ProactiveTrigger,
    contextData: any
) {
    try {
        const member = await prisma.member.findUnique({ where: { id: memberId } })
        const gym = await prisma.gym.findUnique({ where: { id: gymId } })

        if (!member || !gym) return

        let systemPrompt = `You are an expert gym coach for "${gym.name}". 
    Your tone should be ${gym.aiTone || 'motivational'}.
    The member's name is ${member.name}.`

        let userPrompt = ''

        if (trigger === 'absence') {
            systemPrompt += `\nThe member has been absent for ${contextData.daysAbsent} days. Write a short, encouraging message to get them back in the gym. Do not be guilt-tripping.`
            userPrompt = "Write the message."
        } else if (trigger === 'pr_celebration') {
            systemPrompt += `\nThe member just hit a new PR on ${contextData.movement}: ${contextData.result}. Write a short, high-energy congratulatory message.`
            userPrompt = "Write the message."
        } else if (trigger === 'streak') {
            systemPrompt += `\nThe member is on a ${contextData.streak}-day workout streak! Write a short message recognizing their consistency.`
            userPrompt = "Write the message."
        }

        const { text, usage } = await generateText({
            model: google('gemini-2.0-flash-exp'),
            system: systemPrompt,
            messages: [
                { role: 'user', content: userPrompt }
            ],
        })

        const messageText = text || ''

        if (messageText) {
            // Track Usage
            if (usage) {
                const { promptTokens, completionTokens, totalTokens } = usage as any
                const cost = 0 // Placeholder for Gemini

                // @ts-ignore
                await prisma.aIUsage.create({
                    data: {
                        gymId,
                        memberId,
                        feature: `proactive_${trigger}`,
                        tokensUsed: totalTokens,
                        cost,
                        model: 'gemini-2.0-flash-exp',
                    }
                })
            }

            // Save to Message table
            await prisma.message.create({
                data: {
                    memberId,
                    direction: 'outgoing',
                    messageText,
                    aiModel: 'gemini-2.0-flash-exp',
                    isComplex: false,
                }
            })

            // Record proactive event
            await prisma.proactiveMessage.create({
                data: {
                    memberId,
                    gymId,
                    triggerType: trigger,
                    sentAt: new Date(),
                }
            })

            console.log(`Generated ${trigger} message for ${member.name}`)
        }

    } catch (error) {
        console.error('Error generating proactive message:', error)
    }
}

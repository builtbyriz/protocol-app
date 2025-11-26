import { syncGymDocuments } from '@/lib/rag/gym-knowledge'
import { prisma } from '@/lib/db'
import { NextResponse } from 'next/server'

export const dynamic = 'force-dynamic'
export const runtime = 'edge'

export async function GET() {
    try {
        // Find gyms with drive folder configured (check both new and legacy fields)
        const gyms = await prisma.gym.findMany({
            where: {
                OR: [
                    { driveFolderId: { not: null } },
                    { driveFolder: { not: null } }
                ]
            }
        })

        const results = []

        for (const gym of gyms) {
            const folderId = gym.driveFolderId || gym.driveFolder
            if (!folderId) continue

            await syncGymDocuments(gym.id, folderId)
            results.push({ gym: gym.name, status: 'Synced' })
        }

        return NextResponse.json({ success: true, results })
    } catch (error) {
        console.error('Sync error:', error)
        return NextResponse.json({ success: false, error: 'Sync failed' }, { status: 500 })
    }
}

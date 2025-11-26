'use server'

import { auth } from "@/lib/auth"
import { prisma } from "@/lib/db"
import { revalidatePath } from "next/cache"

export async function getRecentActivity(gymId: string) {
    const session = await auth()
    if (!session?.user) return []

    const results = await prisma.result.findMany({
        where: {
            workout: {
                gymId: gymId
            }
        },
        take: 20,
        orderBy: {
            loggedAt: 'desc'
        },
        include: {
            member: {
                select: {
                    id: true,
                    name: true,
                    email: true, // fallback for avatar
                }
            },
            workout: {
                select: {
                    title: true
                }
            },
            fistbumps: {
                select: {
                    memberId: true
                }
            }
        }
    })

    return results.map(result => ({
        id: result.id,
        user: {
            name: result.member.name,
            initials: result.member.name.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase(),
            avatar: undefined // We don't have avatar URL in DB yet, use initials
        },
        workout: result.workout.title,
        result: result.result,
        timeAgo: getTimeAgo(result.loggedAt),
        fistbumps: result.fistbumps.length,
        hasFistbumped: session.user?.id ? result.fistbumps.some(f => f.memberId === session.user!.id) : false
    }))
}

export async function toggleFistbump(resultId: string) {
    const session = await auth()
    if (!session?.user?.id) throw new Error("Unauthorized")

    const existing = await prisma.fistbump.findUnique({
        where: {
            memberId_resultId: {
                memberId: session.user.id,
                resultId: resultId
            }
        }
    })

    if (existing) {
        await prisma.fistbump.delete({
            where: { id: existing.id }
        })
    } else {
        await prisma.fistbump.create({
            data: {
                memberId: session.user.id,
                resultId: resultId
            }
        })
    }

    revalidatePath('/[slug]/member', 'page')
}

export async function getWorkoutLeaderboard(workoutId: string) {
    const results = await prisma.result.findMany({
        where: { workoutId },
        include: {
            member: {
                select: {
                    name: true
                }
            }
        },
        orderBy: {
            // This is a simplification. Real sorting depends on workout type (time vs reps)
            // For now, we'll sort by result string assuming it's comparable or just show recent
            result: 'desc'
        }
    })

    // In a real app, we'd parse the 'result' string based on workout type to sort correctly
    // e.g. "10:00" < "12:00" for Time, but "100kg" > "90kg" for Weight

    return results.map((r, index) => ({
        rank: index + 1,
        user: {
            name: r.member.name,
            initials: r.member.name.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase()
        },
        result: r.result,
        date: getTimeAgo(r.loggedAt)
    }))
}

function getTimeAgo(date: Date) {
    const seconds = Math.floor((new Date().getTime() - date.getTime()) / 1000)

    let interval = seconds / 31536000
    if (interval > 1) return Math.floor(interval) + "y ago"

    interval = seconds / 2592000
    if (interval > 1) return Math.floor(interval) + "mo ago"

    interval = seconds / 86400
    if (interval > 1) return Math.floor(interval) + "d ago"

    interval = seconds / 3600
    if (interval > 1) return Math.floor(interval) + "h ago"

    interval = seconds / 60
    if (interval > 1) return Math.floor(interval) + "m ago"

    return "Just now"
}

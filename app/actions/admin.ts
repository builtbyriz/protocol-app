'use server'

import { prisma } from "@/lib/db"
import { auth } from "@/lib/auth"

export interface AdminStats {
    totalMembers: number
    activeWorkouts: number
    aiMessagesCount: number
    prsThisWeek: number
}

export interface RecentActivityItem {
    id: string
    type: 'workout_log' | 'pr' | 'new_member'
    memberName: string
    memberAvatar: string
    title: string
    subtitle: string
    timestamp: Date
}

export interface AtRiskMember {
    id: string
    name: string
    daysAbsent: number
    riskLevel: 'High' | 'Medium'
}

export async function getAdminStats(gymId: string): Promise<AdminStats | null> {
    const session = await auth()
    if (!session?.user) return null

    const [
        totalMembers,
        activeWorkouts,
        aiMessagesCount,
        prsThisWeek
    ] = await Promise.all([
        prisma.member.count({
            where: { gymId }
        }),
        prisma.workout.count({
            where: { gymId }
        }),
        prisma.message.count({
            where: {
                member: { gymId },
                aiModel: { not: null }
            }
        }),
        prisma.pR.count({
            where: {
                member: { gymId },
                createdAt: {
                    gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)
                }
            }
        })
    ])

    return {
        totalMembers,
        activeWorkouts,
        aiMessagesCount,
        prsThisWeek
    }
}

export async function getRecentActivity(gymId: string): Promise<RecentActivityItem[]> {
    const session = await auth()
    if (!session?.user) return []

    const recentResults = await prisma.result.findMany({
        where: {
            workout: { gymId }
        },
        include: {
            member: true,
            workout: true
        },
        orderBy: {
            loggedAt: 'desc'
        },
        take: 10
    })

    return recentResults.map((result) => ({
        id: result.id,
        type: 'workout_log',
        memberName: result.member.name,
        memberAvatar: `https://api.dicebear.com/9.x/initials/svg?seed=${result.member.name}`,
        title: `Logged ${result.workout.title}`,
        subtitle: result.result,
        timestamp: result.loggedAt
    }))
}

export async function getMembersAtRisk(gymId: string): Promise<AtRiskMember[]> {
    const session = await auth()
    if (!session?.user) return []

    const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)

    const atRiskMembers = await prisma.member.findMany({
        where: {
            gymId,
            lastActiveAt: {
                lt: sevenDaysAgo
            }
        },
        orderBy: {
            lastActiveAt: 'asc'
        },
        take: 5
    })

    return atRiskMembers.map((member) => {
        const daysAbsent = Math.floor((Date.now() - member.lastActiveAt.getTime()) / (1000 * 60 * 60 * 24))
        return {
            id: member.id,
            name: member.name,
            daysAbsent,
            riskLevel: daysAbsent > 14 ? 'High' : 'Medium'
        }
    })
}

export async function getMembers(gymId: string, query: string = "") {
    const session = await auth()
    if (!session?.user) return []

    const members = await prisma.member.findMany({
        where: {
            gymId,
            OR: [
                { name: { contains: query, mode: 'insensitive' } },
                { email: { contains: query, mode: 'insensitive' } }
            ]
        },
        orderBy: {
            createdAt: 'desc'
        },
        include: {
            _count: {
                select: { results: true }
            }
        }
    })

    return members.map(member => ({
        id: member.id,
        name: member.name,
        email: member.email,
        role: member.role,
        joinDate: member.createdAt,
        lastActive: member.lastActiveAt,
        workoutsLogged: member._count.results,
        avatar: `https://api.dicebear.com/9.x/initials/svg?seed=${member.name}`
    }))
}

export async function getWorkouts(gymId: string) {
    const session = await auth()
    if (!session?.user) return []

    const workouts = await prisma.workout.findMany({
        where: { gymId },
        orderBy: { date: 'desc' },
        include: {
            _count: {
                select: { results: true }
            }
        }
    })

    return workouts.map(workout => ({
        id: workout.id,
        title: workout.title,
        type: workout.workoutType,
        date: workout.date,
        completions: workout._count.results
    }))
}

export async function createWorkout(gymId: string, data: {
    title: string
    description: string
    workoutType: string
    movements: string
    date: Date
}) {
    const session = await auth()
    if (!session?.user) throw new Error("Unauthorized")

    return await prisma.workout.create({
        data: {
            ...data,
            gymId
        }
    })
}

export async function updateGym(gymId: string, data: {
    name: string
    primaryColor: string
    aiTone: string
}) {
    const session = await auth()
    if (!session?.user) throw new Error("Unauthorized")

    // TODO: Check if user is admin of this gym

    return await prisma.gym.update({
        where: { id: gymId },
        data
    })
}

export async function getMemberDetails(memberId: string) {
    const session = await auth()
    if (!session?.user) return null

    const member = await prisma.member.findUnique({
        where: { id: memberId },
        include: {
            _count: {
                select: { results: true }
            },
            results: {
                orderBy: { loggedAt: 'desc' },
                take: 5,
                include: {
                    workout: true
                }
            }
        }
    })

    if (!member) return null

    return {
        id: member.id,
        name: member.name,
        email: member.email,
        role: member.role,
        joinDate: member.createdAt,
        lastActive: member.lastActiveAt,
        workoutsLogged: member._count.results,
        avatar: `https://api.dicebear.com/9.x/initials/svg?seed=${member.name}`,
        recentActivity: member.results.map(r => ({
            id: r.id,
            workoutTitle: r.workout.title,
            date: r.loggedAt,
            result: r.result
        }))
    }
}

export async function updateMemberRole(memberId: string, role: string) {
    const session = await auth()
    if (!session?.user) throw new Error("Unauthorized")

    // TODO: Check if user is admin

    return await prisma.member.update({
        where: { id: memberId },
        data: { role }
    })
}

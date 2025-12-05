import { prisma } from "@/lib/db"
import { NextResponse } from "next/server"

export const dynamic = 'force-dynamic'

export async function GET() {
    try {
        const startTime = Date.now()

        // Test 1: Simple count
        const count = await prisma.member.count()

        // Test 2: Fetch one user (public info only)
        const sample = await prisma.member.findFirst({
            select: {
                id: true,
                email: true,
                role: true
            }
        })

        const duration = Date.now() - startTime

        return NextResponse.json({
            status: 'ok',
            database: 'connected',
            latency: `${duration}ms`,
            memberCount: count,
            sampleUser: sample ? { ...sample, hasPassword: true } : null,
            env: {
                NODE_ENV: process.env.NODE_ENV,
                HAS_DB_URL: !!process.env.DATABASE_URL,
            }
        })
    } catch (error) {
        console.error('Diagnostic Error:', error)
        return NextResponse.json({
            status: 'error',
            message: error instanceof Error ? error.message : String(error),
            stack: error instanceof Error ? error.stack : undefined
        }, { status: 500 })
    }
}

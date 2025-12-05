import { prisma } from "@/lib/db"
import { NextResponse } from "next/server"

export const runtime = 'edge';
export const dynamic = 'force-dynamic'

export async function GET() {
    try {
        const startTime = Date.now()

        // Safe Environment Debugging
        const envKeys = Object.keys(process.env);
        const hasDbUrl = !!process.env.DATABASE_URL;
        const dbUrlPreview = hasDbUrl ? `${process.env.DATABASE_URL?.substring(0, 15)}...` : 'undefined';

        console.log('Health Check Analysis:', { hasDbUrl, driver: 'postgres.js' });

        // Test Connection: Simple count
        // This will FAIL if the connection string or driver is wrong
        const count = await prisma.member.count()

        const duration = Date.now() - startTime

        return NextResponse.json({
            status: 'ok',
            database: 'connected',
            latency: `${duration}ms`,
            memberCount: count,
            env: {
                hasDatabaseUrl: hasDbUrl,
                preview: dbUrlPreview
            },
            runtime: process.env.NEXT_RUNTIME || 'unknown',
        })
    } catch (error) {
        console.error('Diagnostic Error:', error)
        return NextResponse.json({
            status: 'error',
            message: error instanceof Error ? error.message : String(error),
            env: {
                hasDatabaseUrl: !!process.env.DATABASE_URL,
            },
            stack: error instanceof Error ? error.stack : undefined
        }, { status: 500 })
    }
}

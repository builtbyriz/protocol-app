import { prisma } from "@/lib/db"
import { NextResponse } from "next/server"

export const runtime = 'edge';
export const dynamic = 'force-dynamic'

export async function GET() {
    try {
        // Safe Environment Debugging
        const envKeys = Object.keys(process.env);
        const hasDbUrl = !!process.env.DATABASE_URL;
        const dbUrlType = typeof process.env.DATABASE_URL;

        // Don't log the full secret, just the start to verify it's not empty/malformed
        const dbUrlPreview = hasDbUrl ? `${process.env.DATABASE_URL?.substring(0, 15)}...` : 'undefined';

        console.log('Health Check Env Debug:', { envKeys, hasDbUrl });

        return NextResponse.json({
            status: 'debug',
            environment: {
                keys: envKeys,
                hasDatabaseUrl: hasDbUrl,
                databaseUrlType: dbUrlType,
                preview: dbUrlPreview
            },
            runtime: process.env.NEXT_RUNTIME || 'unknown',
        })
    } catch (error) {
        return NextResponse.json({
            status: 'error',
            message: error instanceof Error ? error.message : String(error),
        }, { status: 500 })
    }
}

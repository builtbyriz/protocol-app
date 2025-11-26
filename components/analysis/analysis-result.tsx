'use client'

import { Card } from '@/components/ui/card'
import { CheckCircle2, AlertCircle, Trophy } from 'lucide-react'
import { cn } from '@/lib/utils'

export interface AnalysisData {
    score: number
    summary: string
    corrections: string[]
    praise: string[]
}

interface AnalysisResultProps {
    result: AnalysisData
}

export function AnalysisResult({ result }: AnalysisResultProps) {
    return (
        <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-700">
            {/* Score Card */}
            <Card className="p-6 text-center relative overflow-hidden border-primary/20">
                <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-transparent pointer-events-none" />
                <h3 className="text-sm font-medium text-muted-foreground uppercase tracking-wider mb-2">Form Score</h3>
                <div className="flex items-center justify-center">
                    <span className={cn(
                        "text-6xl font-bold tracking-tighter",
                        result.score >= 90 ? "text-green-500" :
                            result.score >= 70 ? "text-yellow-500" : "text-red-500"
                    )}>
                        {result.score}
                    </span>
                    <span className="text-2xl text-muted-foreground ml-1">/100</span>
                </div>
                <p className="mt-4 text-lg font-medium">{result.summary}</p>
            </Card>

            <div className="grid gap-4 md:grid-cols-2">
                {/* Corrections */}
                <Card className="p-6 border-red-500/20 bg-red-500/5">
                    <div className="flex items-center gap-2 mb-4">
                        <AlertCircle className="h-5 w-5 text-red-500" />
                        <h3 className="font-semibold text-red-700 dark:text-red-400">Corrections</h3>
                    </div>
                    <ul className="space-y-3">
                        {result.corrections.map((item, i) => (
                            <li key={i} className="flex gap-3 text-sm">
                                <span className="flex-shrink-0 w-1.5 h-1.5 rounded-full bg-red-500 mt-2" />
                                <span className="text-muted-foreground">{item}</span>
                            </li>
                        ))}
                    </ul>
                </Card>

                {/* Praise */}
                <Card className="p-6 border-green-500/20 bg-green-500/5">
                    <div className="flex items-center gap-2 mb-4">
                        <Trophy className="h-5 w-5 text-green-500" />
                        <h3 className="font-semibold text-green-700 dark:text-green-400">What You Did Well</h3>
                    </div>
                    <ul className="space-y-3">
                        {result.praise.map((item, i) => (
                            <li key={i} className="flex gap-3 text-sm">
                                <span className="flex-shrink-0 w-1.5 h-1.5 rounded-full bg-green-500 mt-2" />
                                <span className="text-muted-foreground">{item}</span>
                            </li>
                        ))}
                    </ul>
                </Card>
            </div>
        </div>
    )
}

'use client'

import { useState } from 'react'
import { VideoUpload } from '@/components/analysis/video-upload'
import { AnalysisResult, AnalysisData } from '@/components/analysis/analysis-result'
import { Button } from '@/components/ui/button'
import { Loader2, Sparkles } from 'lucide-react'
import { toast } from 'sonner'

export default function AnalysisPage() {
    const [file, setFile] = useState<File | null>(null)
    const [isAnalyzing, setIsAnalyzing] = useState(false)
    const [result, setResult] = useState<AnalysisData | null>(null)

    const handleAnalyze = async () => {
        if (!file) return

        setIsAnalyzing(true)

        // Create FormData
        const formData = new FormData()
        formData.append('video', file)

        try {
            const response = await fetch('/api/analyze-form', {
                method: 'POST',
                body: formData,
            })

            if (!response.ok) throw new Error('Analysis failed')

            const data = await response.json()
            setResult(data)
            toast.success('Analysis complete!')
        } catch (error) {
            console.error(error)
            toast.error('Failed to analyze video. Please try again.')
        } finally {
            setIsAnalyzing(false)
        }
    }

    return (
        <div className="container max-w-2xl mx-auto py-8 px-4 space-y-8">
            <div className="text-center space-y-2">
                <h1 className="text-3xl font-bold tracking-tight">AI Form Analysis</h1>
                <p className="text-muted-foreground">
                    Upload a video of your lift. Our AI Coach will analyze your form,
                    give you a score, and suggest corrections.
                </p>
            </div>

            {!result ? (
                <div className="space-y-8">
                    <VideoUpload
                        onFileSelect={setFile}
                        isAnalyzing={isAnalyzing}
                    />

                    {file && (
                        <div className="flex justify-center">
                            <Button
                                size="lg"
                                className="w-full max-w-md font-semibold text-lg h-12"
                                onClick={handleAnalyze}
                                disabled={isAnalyzing}
                            >
                                {isAnalyzing ? (
                                    <>
                                        <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                                        Analyzing Form...
                                    </>
                                ) : (
                                    <>
                                        <Sparkles className="mr-2 h-5 w-5" />
                                        Analyze My Form
                                    </>
                                )}
                            </Button>
                        </div>
                    )}
                </div>
            ) : (
                <div className="space-y-8">
                    <AnalysisResult result={result} />
                    <div className="flex justify-center">
                        <Button
                            variant="outline"
                            onClick={() => {
                                setFile(null)
                                setResult(null)
                            }}
                        >
                            Analyze Another Video
                        </Button>
                    </div>
                </div>
            )}
        </div>
    )
}

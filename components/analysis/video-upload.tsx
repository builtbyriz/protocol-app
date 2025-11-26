'use client'

import { useState, useRef } from 'react'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Upload, X, Play, Pause } from 'lucide-react'
import { cn } from '@/lib/utils'

interface VideoUploadProps {
    onFileSelect: (file: File) => void
    isAnalyzing: boolean
}

export function VideoUpload({ onFileSelect, isAnalyzing }: VideoUploadProps) {
    const [previewUrl, setPreviewUrl] = useState<string | null>(null)
    const [isPlaying, setIsPlaying] = useState(false)
    const videoRef = useRef<HTMLVideoElement>(null)
    const inputRef = useRef<HTMLInputElement>(null)

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0]
        if (file) {
            const url = URL.createObjectURL(file)
            setPreviewUrl(url)
            onFileSelect(file)
        }
    }

    const clearFile = () => {
        setPreviewUrl(null)
        if (inputRef.current) inputRef.current.value = ''
    }

    const togglePlay = () => {
        if (videoRef.current) {
            if (isPlaying) {
                videoRef.current.pause()
            } else {
                videoRef.current.play()
            }
            setIsPlaying(!isPlaying)
        }
    }

    return (
        <div className="w-full max-w-md mx-auto">
            <input
                type="file"
                accept="video/*"
                className="hidden"
                ref={inputRef}
                onChange={handleFileChange}
            />

            {!previewUrl ? (
                <Card
                    className="border-2 border-dashed border-border p-12 flex flex-col items-center justify-center cursor-pointer hover:bg-muted/50 transition-colors"
                    onClick={() => inputRef.current?.click()}
                >
                    <div className="h-16 w-16 bg-primary/10 rounded-full flex items-center justify-center mb-4">
                        <Upload className="h-8 w-8 text-primary" />
                    </div>
                    <h3 className="text-lg font-semibold mb-2">Upload Video</h3>
                    <p className="text-sm text-muted-foreground text-center">
                        Select a video of your exercise for AI analysis.
                        <br />
                        (Max 15 seconds recommended)
                    </p>
                </Card>
            ) : (
                <div className="relative rounded-xl overflow-hidden bg-black aspect-[9/16] max-h-[600px] mx-auto shadow-2xl">
                    <video
                        ref={videoRef}
                        src={previewUrl}
                        className="w-full h-full object-contain"
                        playsInline
                        onEnded={() => setIsPlaying(false)}
                    />

                    {/* Overlay Controls */}
                    <div className="absolute inset-0 flex items-center justify-center bg-black/20 opacity-0 hover:opacity-100 transition-opacity" onClick={togglePlay}>
                        <button className="p-4 bg-white/20 backdrop-blur-md rounded-full hover:bg-white/30 transition-all">
                            {isPlaying ? (
                                <Pause className="h-8 w-8 text-white fill-current" />
                            ) : (
                                <Play className="h-8 w-8 text-white fill-current ml-1" />
                            )}
                        </button>
                    </div>

                    <Button
                        variant="destructive"
                        size="icon"
                        className="absolute top-4 right-4 rounded-full h-8 w-8"
                        onClick={clearFile}
                        disabled={isAnalyzing}
                    >
                        <X className="h-4 w-4" />
                    </Button>
                </div>
            )}
        </div>
    )
}

'use client'

import { useState } from 'react'
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Upload, FileText, Trash2 } from "lucide-react"

import { useParams } from "next/navigation"


export default function KnowledgeBasePage() {
    const params = useParams()
    const slug = params.slug as string


    return (
        <div className="container mx-auto p-6">
            <h1 className="text-3xl font-bold mb-6">Knowledge Base</h1>

            <div className="grid gap-6">
                <Card>
                    <CardHeader>
                        <CardTitle>Upload Documents</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="flex items-center gap-4 border-2 border-dashed rounded-lg p-8 justify-center bg-muted/50">
                            <div className="text-center space-y-2">
                                <Upload className="h-10 w-10 mx-auto text-muted-foreground" />
                                <p className="text-sm text-muted-foreground">
                                    Drag and drop PDF files here, or click to select
                                </p>
                                <Input type="file" accept=".pdf" className="hidden" id="file-upload" />
                                <Button variant="secondary" onClick={() => document.getElementById('file-upload')?.click()}>
                                    Select Files
                                </Button>
                            </div>
                        </div>
                        <p className="text-xs text-muted-foreground mt-4">
                            Supported formats: PDF. Max size: 10MB.
                            These documents will be used by the AI Coach to answer member questions.
                        </p>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader>
                        <CardTitle>Active Documents</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-4">
                            {/* Placeholder list */}
                            <div className="flex items-center justify-between p-3 border rounded-md bg-card">
                                <div className="flex items-center gap-3">
                                    <FileText className="h-5 w-5 text-blue-500" />
                                    <div>
                                        <p className="font-medium">Squat_Progression_Cycle_1.pdf</p>
                                        <p className="text-xs text-muted-foreground">Uploaded 2 days ago</p>
                                    </div>
                                </div>
                                <Button variant="ghost" size="icon" className="text-red-500 hover:text-red-700">
                                    <Trash2 className="h-4 w-4" />
                                </Button>
                            </div>
                            <div className="flex items-center justify-between p-3 border rounded-md bg-card">
                                <div className="flex items-center gap-3">
                                    <FileText className="h-5 w-5 text-blue-500" />
                                    <div>
                                        <p className="font-medium">Nutrition_Guide_v2.pdf</p>
                                        <p className="text-xs text-muted-foreground">Uploaded 5 days ago</p>
                                    </div>
                                </div>
                                <Button variant="ghost" size="icon" className="text-red-500 hover:text-red-700">
                                    <Trash2 className="h-4 w-4" />
                                </Button>
                            </div>
                        </div>
                    </CardContent>
                </Card>
            </div>
        </div>
    )
}

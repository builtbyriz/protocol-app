"use client"

import { useState, useEffect, useCallback } from "react"

export function useVoiceCoach() {
    const [isSupported, setIsSupported] = useState(false)
    const [isSpeaking, setIsSpeaking] = useState(false)
    const [voice, setVoice] = useState<SpeechSynthesisVoice | null>(null)

    useEffect(() => {
        if (typeof window !== "undefined" && "speechSynthesis" in window) {
            setIsSupported(true)

            const loadVoices = () => {
                const voices = window.speechSynthesis.getVoices()
                // Prefer a natural sounding voice if available (e.g., Google US English)
                const preferredVoice = voices.find(v => v.name.includes("Google US English")) || voices[0]
                setVoice(preferredVoice)
            }

            loadVoices()
            window.speechSynthesis.onvoiceschanged = loadVoices
        }
    }, [])

    const speak = useCallback((text: string) => {
        if (!isSupported) return

        // Cancel any current speech
        window.speechSynthesis.cancel()

        const utterance = new SpeechSynthesisUtterance(text)
        if (voice) {
            utterance.voice = voice
        }

        // Adjust rate and pitch for a more "coach-like" tone
        utterance.rate = 1.0
        utterance.pitch = 1.0

        utterance.onstart = () => setIsSpeaking(true)
        utterance.onend = () => setIsSpeaking(false)
        utterance.onerror = () => setIsSpeaking(false)

        window.speechSynthesis.speak(utterance)
    }, [isSupported, voice])

    const cancel = useCallback(() => {
        if (isSupported) {
            window.speechSynthesis.cancel()
            setIsSpeaking(false)
        }
    }, [isSupported])

    return {
        speak,
        cancel,
        isSupported,
        isSpeaking
    }
}

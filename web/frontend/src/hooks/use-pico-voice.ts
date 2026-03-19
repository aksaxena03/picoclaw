/* eslint-disable @typescript-eslint/no-explicit-any */
import { useEffect, useRef, useState } from "react"

const SpeechRecognition =
  (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition

interface UsePicoVoiceProps {
  messages: any[]
  sendMessage: (content: string) => boolean
  connectionState: string
}

export function usePicoVoice({
  messages,
  sendMessage,
  connectionState,
}: UsePicoVoiceProps) {
  const [isVoiceEnabled, setIsVoiceEnabled] = useState(false)
  const [isMuted, setIsMuted] = useState(false)
  const isVoiceSupported = Boolean(SpeechRecognition)

  const recognitionRef = useRef<any>(null)
  const isSpeakingRef = useRef(false)
  const lastProcessedMessageIdRef = useRef<string | null>(null)

  // Setup Web Speech API Transcription
  useEffect(() => {
    if (!SpeechRecognition) return

    const recognition = new SpeechRecognition()
    recognition.continuous = true
    recognition.interimResults = false
    recognition.lang = "en-US"

    recognition.onresult = (event: any) => {
      // Prevent hearing the Assistant's TTS as user's speech
      if (isSpeakingRef.current) return

      const transcript = event.results[event.results.length - 1][0].transcript
      if (transcript.trim() && connectionState === "connected") {
        sendMessage(transcript.trim())
      }
    }

    recognition.onend = () => {
      // Auto-restart if it was enabled and we are not speaking TTS
      if (isVoiceEnabled && !isSpeakingRef.current) {
        try {
          recognition.start()
        } catch (e) {
          console.debug(e)
        }
      }
    }

    recognition.onerror = (e: any) => {
      console.debug("Speech recognition error:", e.error)
    }

    recognitionRef.current = recognition

    return () => {
      recognition.stop()
    }
  }, [connectionState, isVoiceEnabled, sendMessage])

  // Manage Listen state
  useEffect(() => {
    if (!recognitionRef.current) return

    if (isVoiceEnabled) {
      if (!isSpeakingRef.current) {
        try {
          recognitionRef.current.start()
        } catch (e) {
          console.debug(e)
        }
      }
    } else {
      recognitionRef.current.stop()
    }
  }, [isVoiceEnabled])

  // TTS for incoming messages
  useEffect(() => {
    if (!isVoiceEnabled || messages.length === 0 || isMuted) return

    const latestMessage = messages[messages.length - 1]

    // Check if new assistant message
    if (
      latestMessage.role === "assistant" &&
      latestMessage.id !== lastProcessedMessageIdRef.current
    ) {
      lastProcessedMessageIdRef.current = latestMessage.id

      // Stop recognition briefly so it doesn't transcribe the browser's own TTS output
      isSpeakingRef.current = true
      if (recognitionRef.current) {
        try {
          recognitionRef.current.stop()
        } catch (e) {
          console.debug(e)
        }
      }

      const utterance = new SpeechSynthesisUtterance(latestMessage.content)
      utterance.onend = () => {
        isSpeakingRef.current = false
        if (isVoiceEnabled && recognitionRef.current) {
          try {
            recognitionRef.current.start()
          } catch (e) {
            console.debug(e)
          }
        }
      }
      utterance.onerror = () => {
        isSpeakingRef.current = false
        if (isVoiceEnabled && recognitionRef.current) {
          try {
            recognitionRef.current.start()
          } catch (e) {
            console.debug(e)
          }
        }
      }

      window.speechSynthesis.speak(utterance)
    }
  }, [messages, isVoiceEnabled, isMuted])

  const toggleVoice = () => {
    if (isVoiceEnabled) {
      window.speechSynthesis.cancel() // Stop speaking if disabled mid-sentence
    }
    setIsVoiceEnabled(!isVoiceEnabled)
  }

  const toggleMute = () => {
    if (!isMuted) {
      window.speechSynthesis.cancel() // Stop current reading immediately when muting
    }
    setIsMuted(!isMuted)
  }

  return {
    isVoiceEnabled,
    toggleVoice,
    isMuted,
    toggleMute,
    isVoiceSupported,
  }
}

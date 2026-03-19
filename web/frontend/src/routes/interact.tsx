import {
  IconMicrophone,
  IconMicrophoneOff,
  IconRobot,
  IconSend,
  IconVolume,
  IconVolumeOff,
} from "@tabler/icons-react"
import { createFileRoute } from "@tanstack/react-router"
import { useState } from "react"

import { PageHeader } from "@/components/page-header"
import { Button } from "@/components/ui/button"
import { usePicoChat } from "@/hooks/use-pico-chat"
import { usePicoVoice } from "@/hooks/use-pico-voice"

export const Route = createFileRoute("/interact")({
  component: InteractPage,
})

function InteractPage() {
  const { messages, sendMessage, isTyping, connectionState } = usePicoChat()
  const { isVoiceEnabled, toggleVoice, isMuted, toggleMute, isVoiceSupported } =
    usePicoVoice({
      messages,
      sendMessage,
      connectionState,
    })

  const [input, setInput] = useState("")

  const handleInteract = () => {
    if (input.trim() && connectionState === "connected") {
      sendMessage(input.trim())
      setInput("")
    }
  }

  return (
    <div className="bg-background flex h-full flex-col">
      <PageHeader title="PicoClaw Interaction" />
      <div className="flex-1 overflow-auto p-4 md:p-8">
        <div className="mx-auto flex max-w-4xl flex-col gap-6">
          <div className="bg-card rounded-lg border p-6 shadow-sm">
            <div className="mb-6 flex flex-col items-start justify-between gap-4 sm:flex-row sm:items-center">
              <h2 className="flex items-center gap-2 text-xl font-semibold">
                <IconRobot className="text-primary size-6" />
                Direct Interaction Sandbox
              </h2>

              <div className="flex items-center gap-2">
                <Button
                  variant={isVoiceEnabled ? "destructive" : "secondary"}
                  onClick={toggleVoice}
                  className="gap-2"
                  disabled={!isVoiceSupported}
                >
                  {isVoiceEnabled ? (
                    <IconMicrophoneOff className="size-4" />
                  ) : (
                    <IconMicrophone className="size-4" />
                  )}
                  {isVoiceEnabled ? "Disable Voice" : "Enable Voice"}
                </Button>

                {isVoiceEnabled && (
                  <Button
                    variant="secondary"
                    onClick={toggleMute}
                    className="w-10 px-0"
                    title={
                      isMuted
                        ? "Unmute Assistant Voice"
                        : "Mute Assistant Voice"
                    }
                  >
                    {isMuted ? (
                      <IconVolumeOff className="text-muted-foreground size-4" />
                    ) : (
                      <IconVolume className="size-4" />
                    )}
                  </Button>
                )}
              </div>
            </div>

            <p className="text-muted-foreground mb-6">
              Use this environment to interact directly with the PicoClaw agent.
              {isVoiceEnabled && (
                <strong className="text-primary mt-2 block">
                  Voice is Enabled: The microphone is actively listening. It
                  will send commands when you speak, and read back the answers!
                </strong>
              )}
            </p>

            <div className="flex flex-col gap-4">
              <textarea
                className="border-input placeholder:text-muted-foreground focus-visible:ring-ring flex min-h-[120px] w-full rounded-md border bg-transparent px-3 py-2 text-sm shadow-sm focus-visible:ring-1 focus-visible:outline-none disabled:cursor-not-allowed disabled:opacity-50"
                placeholder={
                  isVoiceEnabled
                    ? "Listening... (Speak your command)"
                    : "Enter command or query for PicoClaw..."
                }
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter" && !e.shiftKey) {
                    e.preventDefault()
                    handleInteract()
                  }
                }}
                disabled={connectionState !== "connected"}
              />
              <div className="flex justify-end gap-2">
                <Button
                  onClick={handleInteract}
                  disabled={
                    !input.trim() || connectionState !== "connected" || isTyping
                  }
                  className="gap-2"
                >
                  <IconSend className="size-4" />
                  Interact
                </Button>
              </div>
            </div>

            {connectionState !== "connected" && (
              <p className="text-destructive mt-4 text-sm font-medium">
                PicoClaw gateway is disconnected. Please start the gateway to
                interact.
              </p>
            )}

            {!isVoiceSupported && (
              <p className="text-destructive mt-2 text-xs">
                Voice features are not supported in this browser. Please use
                Chrome/Edge for Speech Recognition.
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

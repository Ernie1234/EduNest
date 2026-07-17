"use client"

import { useEffect, useRef, useState } from "react"
import { useQuery } from "@tanstack/react-query"
import { LiveClassParticipantSummary } from "@workspace/types"
import { Avatar, AvatarFallback, AvatarImage } from "@workspace/ui/components/avatar"
import { Button } from "@workspace/ui/components/button"
import { Input } from "@workspace/ui/components/input"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@workspace/ui/components/tabs"
import { format } from "date-fns"
import { Send } from "lucide-react"
import { useAuth } from "@/hooks/use-auth"
import { useChatRoom } from "@/hooks/use-chat-room"
import { MessagingService } from "@/services/messaging.service"

interface ChatPanelProps {
  chatRoomId: string | null
}

function getInitials(name: string | null | undefined): string {
  if (!name) return "?"
  return name
    .split(" ")
    .map((part) => part[0])
    .slice(0, 2)
    .join("")
    .toUpperCase()
}

export function ChatPanel({ chatRoomId }: ChatPanelProps) {
  const { user } = useAuth()
  const { messages, sendMessage } = useChatRoom(chatRoomId)
  const { data: participants = [] } = useQuery({
    queryKey: ["chat-participants", chatRoomId],
    queryFn: () => MessagingService.listRoomParticipants(chatRoomId as string),
    enabled: !!chatRoomId,
  })
  const [draft, setDraft] = useState("")
  const scrollRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight })
  }, [messages])

  function handleSend() {
    if (!draft.trim()) return
    sendMessage(draft)
    setDraft("")
  }

  if (!chatRoomId) {
    return <p className="text-sm text-muted-foreground">No chat room for this class.</p>
  }

  return (
    <Tabs defaultValue="chat" className="flex h-full flex-col">
      <TabsList className="w-full">
        <TabsTrigger value="chat" className="flex-1">
          Chat room
        </TabsTrigger>
        <TabsTrigger value="participants" className="flex-1">
          Participants ({participants.length})
        </TabsTrigger>
      </TabsList>

      <TabsContent value="chat" className="flex flex-1 flex-col gap-2 overflow-hidden">
        <div ref={scrollRef} className="flex flex-1 flex-col gap-2 overflow-y-auto pr-1">
          {messages.map((message) => {
            const isSelf = message.senderId === user?.id
            return (
              <div key={message.id} className={isSelf ? "self-end text-right" : "self-start"}>
                {!isSelf && (
                  <p className="text-xs font-medium text-muted-foreground">
                    {message.senderName}
                  </p>
                )}
                <div
                  className={
                    isSelf
                      ? "max-w-64 rounded-lg bg-blue-600 px-3 py-1.5 text-sm text-white"
                      : "max-w-64 rounded-lg bg-muted px-3 py-1.5 text-sm text-foreground"
                  }
                >
                  {message.content}
                </div>
                <p className="mt-0.5 text-[10px] text-muted-foreground">
                  {format(new Date(message.createdAt), "p")}
                </p>
              </div>
            )
          })}
        </div>

        <div className="flex items-center gap-2 pt-2">
          <Input
            placeholder="Type a message…"
            value={draft}
            onChange={(e) => setDraft(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleSend()}
          />
          <Button size="icon" onClick={handleSend}>
            <Send className="size-4" />
          </Button>
        </div>
      </TabsContent>

      <TabsContent value="participants" className="flex-1 overflow-y-auto">
        <div className="flex flex-col gap-2">
          {participants.map((participant: LiveClassParticipantSummary) => (
            <div key={participant.userId} className="flex items-center gap-2 py-1">
              <Avatar>
                <AvatarImage src={participant.image} alt={participant.name} />
                <AvatarFallback>{getInitials(participant.name)}</AvatarFallback>
              </Avatar>
              <span className="text-sm text-foreground">{participant.name}</span>
            </div>
          ))}
        </div>
      </TabsContent>
    </Tabs>
  )
}

import { useEffect, useState, useCallback } from "react"
import { getSocket } from "@/lib/socket"
import { MessagingService } from "@/services/messaging.service"
import { ChatRoomMessage } from "@workspace/types"

export function useChatRoom(chatRoomId: string | null | undefined) {
  const [messages, setMessages] = useState<ChatRoomMessage[]>([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    if (!chatRoomId) return

    let cancelled = false

    MessagingService.listRoomMessages(chatRoomId).then((history) => {
      if (!cancelled) {
        setMessages(history)
        setIsLoading(false)
      }
    })

    const socket = getSocket()

    // Re-join on every connect, not just the first — socket.io-client
    // reconnects automatically after a drop (e.g. server restart), and the
    // server has no memory of which rooms this socket was in before.
    function joinRoom() {
      socket.emit("join-room", { chatRoomId })
    }
    socket.on("connect", joinRoom)
    if (socket.connected) joinRoom()
    else socket.connect()

    function onNewMessage(message: ChatRoomMessage) {
      if (message.chatRoomId === chatRoomId) {
        setMessages((prev) => [...prev, message])
      }
    }
    socket.on("message:new", onNewMessage)

    return () => {
      cancelled = true
      socket.off("connect", joinRoom)
      socket.off("message:new", onNewMessage)
    }
  }, [chatRoomId])

  const sendMessage = useCallback(
    (content: string) => {
      if (!chatRoomId || !content.trim()) return
      getSocket().emit("send-message", { chatRoomId, content })
    },
    [chatRoomId]
  )

  return { messages, isLoading, sendMessage }
}

import { apiClient } from "@/lib/api-client"
import { ChatRoomMessage, LiveClassParticipantSummary } from "@workspace/types"

export const MessagingService = {
  async listRoomMessages(chatRoomId: string): Promise<ChatRoomMessage[]> {
    const { data } = await apiClient.get<ChatRoomMessage[]>(`/messaging/rooms/${chatRoomId}/messages`)
    return data
  },

  async listRoomParticipants(chatRoomId: string): Promise<LiveClassParticipantSummary[]> {
    const { data } = await apiClient.get<LiveClassParticipantSummary[]>(
      `/messaging/rooms/${chatRoomId}/participants`
    )
    return data
  },
}

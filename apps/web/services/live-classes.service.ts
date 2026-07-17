import { apiClient } from "@/lib/api-client"
import { LiveClassDetail, LiveClassListItem } from "@workspace/types"

export const LiveClassesService = {
  async listLiveClasses(): Promise<LiveClassListItem[]> {
    const { data } = await apiClient.get<LiveClassListItem[]>("/academics/live-classes")
    return data
  },

  async getLiveClass(id: string): Promise<LiveClassDetail> {
    const { data } = await apiClient.get<LiveClassDetail>(`/academics/live-classes/${id}`)
    return data
  },
}

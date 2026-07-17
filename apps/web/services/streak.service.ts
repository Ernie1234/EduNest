import { apiClient } from "@/lib/api-client"
import { StreakSummary } from "@workspace/types"

export const StreakService = {
  async getStreak(): Promise<StreakSummary> {
    const { data } = await apiClient.get<StreakSummary>("/streak")
    return data
  },

  async applyFreeze(forDate?: string): Promise<void> {
    await apiClient.post("/streak/use-freeze", forDate ? { forDate } : {})
  },
}

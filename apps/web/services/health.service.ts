import { apiClient } from "@/lib/api-client"
import { HealthStatus } from "@workspace/types"

export const HealthService = {
  async getStatus(): Promise<HealthStatus | null> {
    try {
      const { data } = await apiClient.get<HealthStatus>("/health")
      return data
    } catch {
      return null
    }
  },
}

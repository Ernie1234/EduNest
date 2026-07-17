import { apiClient } from "@/lib/api-client"
import { CalendarEventSummary } from "@workspace/types"

export interface GetEventsParams {
  from?: string
  to?: string
  courseOfferingId?: string
}

export const CalendarService = {
  async getEvents(params: GetEventsParams = {}): Promise<CalendarEventSummary[]> {
    const { data } = await apiClient.get<CalendarEventSummary[]>("/calendar/events", {
      params,
    })
    return data
  },
}

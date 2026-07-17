import { CalendarService, GetEventsParams } from "@/services/calendar.service"
import { useQuery } from "@tanstack/react-query"

export function useTimetable(params: GetEventsParams) {
  return useQuery({
    queryKey: ["timetable-events", params],
    queryFn: () => CalendarService.getEvents(params),
  })
}

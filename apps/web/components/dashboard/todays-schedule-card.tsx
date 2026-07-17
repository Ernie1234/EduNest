import { CalendarEventSummary } from "@workspace/types"
import { Card, CardContent, CardHeader, CardTitle } from "@workspace/ui/components/card"
import { cn } from "@workspace/ui/lib/utils"
import { format, isSameDay } from "date-fns"
import { getCalendarEventColor } from "@/lib/calendar-event-colors"

interface TodaysScheduleCardProps {
  events: CalendarEventSummary[]
}

export function TodaysScheduleCard({ events }: TodaysScheduleCardProps) {
  const today = new Date()
  const todaysEvents = events
    .filter((event) => isSameDay(new Date(event.startAt), today))
    .sort((a, b) => new Date(a.startAt).getTime() - new Date(b.startAt).getTime())

  return (
    <Card>
      <CardHeader>
        <CardTitle>{format(today, "MMMM d, yyyy")}</CardTitle>
      </CardHeader>
      <CardContent className="flex flex-col gap-2">
        {todaysEvents.length === 0 && (
          <p className="text-sm text-muted-foreground">Nothing scheduled today.</p>
        )}
        {todaysEvents.map((event) => {
          const color = getCalendarEventColor(event.type)
          return (
            <div
              key={event.id}
              className={cn("rounded-lg border-l-4 bg-muted/30 px-3 py-2", color.border)}
            >
              <p className="text-sm font-medium text-foreground">{event.title}</p>
              <p className="text-xs text-muted-foreground">
                {format(new Date(event.startAt), "p")} – {format(new Date(event.endAt), "p")}
              </p>
            </div>
          )
        })}
      </CardContent>
    </Card>
  )
}

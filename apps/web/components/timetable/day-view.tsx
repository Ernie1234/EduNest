import { CalendarEventSummary } from "@workspace/types"
import { Card, CardContent, CardHeader, CardTitle } from "@workspace/ui/components/card"
import { format, isAfter, isSameDay } from "date-fns"
import {
  TIMETABLE_END_HOUR,
  TIMETABLE_START_HOUR,
  getEventPositionPercent,
  getHourLabelOffsetPercent,
  getHourLabels,
} from "@/lib/timetable-layout"
import { EventBadge } from "./event-badge"

const HOUR_ROW_HEIGHT_PX = 64
const DEADLINE_TYPES: CalendarEventSummary["type"][] = [
  "ASSIGNMENT_DEADLINE",
  "EXAM",
  "EXAM_WINDOW",
]

interface DayViewProps {
  referenceDate: Date
  events: CalendarEventSummary[]
}

export function DayView({ referenceDate, events }: DayViewProps) {
  const hourLabels = getHourLabels()
  const totalHours = TIMETABLE_END_HOUR - TIMETABLE_START_HOUR
  const gridHeight = totalHours * HOUR_ROW_HEIGHT_PX
  const dayEvents = events.filter((event) => isSameDay(new Date(event.startAt), referenceDate))

  const now = new Date()
  const upNext = [...dayEvents]
    .filter((event) => event.type === "CLASS" && isAfter(new Date(event.startAt), now))
    .sort((a, b) => new Date(a.startAt).getTime() - new Date(b.startAt).getTime())[0]

  const deadlinesToday = dayEvents.filter((event) => DEADLINE_TYPES.includes(event.type))

  return (
    <div className="flex flex-col gap-4 lg:flex-row">
      <div className="flex flex-1 overflow-hidden rounded-xl border border-border bg-card">
        <div className="w-16 shrink-0 border-r border-border">
          <div className="relative" style={{ height: gridHeight }}>
            {hourLabels.map((label) => (
              <span
                key={label}
                className="absolute right-0 -translate-y-1/2 pr-2 text-right text-xs text-muted-foreground"
                style={{ top: `${getHourLabelOffsetPercent(label)}%` }}
              >
                {label}
              </span>
            ))}
          </div>
        </div>
        <div className="relative flex-1" style={{ height: gridHeight }}>
          {dayEvents.length === 0 ? (
            <p className="p-4 text-sm text-muted-foreground">No events scheduled for this day.</p>
          ) : (
            dayEvents.map((event) => {
              const position = getEventPositionPercent(event.startAt, event.endAt)
              return (
                <EventBadge
                  key={event.id}
                  event={event}
                  className="absolute inset-x-2"
                  style={position}
                />
              )
            })
          )}
        </div>
      </div>

      <div className="flex w-full shrink-0 flex-col gap-4 lg:w-72">
        <Card>
          <CardHeader>
            <CardTitle>Up next</CardTitle>
          </CardHeader>
          <CardContent>
            {upNext ? (
              <div>
                <p className="font-semibold text-foreground">{upNext.title}</p>
                <p className="text-sm text-muted-foreground">
                  Starts at {format(new Date(upNext.startAt), "p")}
                </p>
              </div>
            ) : (
              <p className="text-sm text-muted-foreground">Nothing else scheduled today.</p>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Deadlines today</CardTitle>
          </CardHeader>
          <CardContent className="flex flex-col gap-3">
            {deadlinesToday.length > 0 ? (
              deadlinesToday.map((deadline) => (
                <div key={deadline.id}>
                  <p className="font-medium text-foreground">{deadline.title}</p>
                  <p className="text-sm text-muted-foreground">
                    Due {format(new Date(deadline.endAt), "p")}
                  </p>
                </div>
              ))
            ) : (
              <p className="text-sm text-muted-foreground">No deadlines today.</p>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

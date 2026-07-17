import { CalendarEventSummary } from "@workspace/types"
import { cn } from "@workspace/ui/lib/utils"
import { addDays, format, isSameDay, startOfWeek } from "date-fns"
import {
  TIMETABLE_END_HOUR,
  TIMETABLE_START_HOUR,
  getEventPositionPercent,
  getHourLabelOffsetPercent,
  getHourLabels,
} from "@/lib/timetable-layout"
import { EventBadge } from "./event-badge"

const HOUR_ROW_HEIGHT_PX = 64
const WEEKDAY_COUNT = 5

interface WeekViewProps {
  referenceDate: Date
  events: CalendarEventSummary[]
}

export function WeekView({ referenceDate, events }: WeekViewProps) {
  const weekStart = startOfWeek(referenceDate, { weekStartsOn: 1 })
  const days = Array.from({ length: WEEKDAY_COUNT }, (_, i) => addDays(weekStart, i))
  const hourLabels = getHourLabels()
  const totalHours = TIMETABLE_END_HOUR - TIMETABLE_START_HOUR
  const gridHeight = totalHours * HOUR_ROW_HEIGHT_PX

  return (
    <div className="flex overflow-hidden rounded-xl border border-border bg-card">
      <div className="w-16 shrink-0 border-r border-border">
        <div className="h-14 border-b border-border" />
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

      {days.map((day) => {
        const dayEvents = events.filter((event) => isSameDay(new Date(event.startAt), day))
        return (
          <div key={day.toISOString()} className="flex-1 border-r border-border last:border-r-0">
            <div className="flex h-14 flex-col items-center justify-center border-b border-border">
              <span className="text-xs text-muted-foreground">
                {format(day, "EEE").toUpperCase()}
              </span>
              <span
                className={cn(
                  "text-sm font-semibold text-foreground",
                  isSameDay(day, new Date()) && "text-blue-600"
                )}
              >
                {format(day, "dd")}
              </span>
            </div>
            <div className="relative" style={{ height: gridHeight }}>
              {dayEvents.map((event) => {
                const position = getEventPositionPercent(event.startAt, event.endAt)
                return (
                  <EventBadge
                    key={event.id}
                    event={event}
                    className="absolute inset-x-1"
                    style={position}
                  />
                )
              })}
            </div>
          </div>
        )
      })}
    </div>
  )
}

import { CalendarEventSummary } from "@workspace/types"
import { cn } from "@workspace/ui/lib/utils"
import {
  eachDayOfInterval,
  endOfMonth,
  endOfWeek,
  format,
  isSameDay,
  isSameMonth,
  startOfMonth,
  startOfWeek,
} from "date-fns"
import { EventBadge } from "./event-badge"

const MAX_VISIBLE_PER_DAY = 3
const WEEKDAY_LABELS = ["MON", "TUE", "WED", "THU", "FRI", "SAT", "SUN"]

interface MonthViewProps {
  referenceDate: Date
  events: CalendarEventSummary[]
}

export function MonthView({ referenceDate, events }: MonthViewProps) {
  const monthStart = startOfMonth(referenceDate)
  const monthEnd = endOfMonth(referenceDate)
  const gridStart = startOfWeek(monthStart, { weekStartsOn: 1 })
  const gridEnd = endOfWeek(monthEnd, { weekStartsOn: 1 })
  const days = eachDayOfInterval({ start: gridStart, end: gridEnd })

  return (
    <div className="overflow-hidden rounded-xl border border-border bg-card">
      <div className="grid grid-cols-7 border-b border-border text-center text-xs font-medium text-muted-foreground">
        {WEEKDAY_LABELS.map((label) => (
          <div key={label} className="py-2">
            {label}
          </div>
        ))}
      </div>
      <div className="grid grid-cols-7">
        {days.map((day) => {
          const dayEvents = events.filter((event) => isSameDay(new Date(event.startAt), day))
          const visibleEvents = dayEvents.slice(0, MAX_VISIBLE_PER_DAY)
          const overflowCount = dayEvents.length - visibleEvents.length
          const inCurrentMonth = isSameMonth(day, referenceDate)

          return (
            <div
              key={day.toISOString()}
              className={cn(
                "min-h-28 border-r border-b border-border p-1.5 last:border-r-0",
                !inCurrentMonth && "bg-muted/30"
              )}
            >
              <span
                className={cn(
                  "inline-flex size-6 items-center justify-center rounded-full text-sm",
                  inCurrentMonth ? "text-foreground" : "text-muted-foreground",
                  isSameDay(day, new Date()) && "bg-blue-600 font-semibold text-white"
                )}
              >
                {format(day, "d")}
              </span>
              <div className="mt-1 flex flex-col gap-1">
                {visibleEvents.map((event) => (
                  <EventBadge key={event.id} event={event} variant="pill" />
                ))}
                {overflowCount > 0 && (
                  <span className="px-1.5 text-[11px] text-muted-foreground">
                    +{overflowCount} more
                  </span>
                )}
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}

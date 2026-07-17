import { CalendarEventSummary } from "@workspace/types"
import { cn } from "@workspace/ui/lib/utils"
import { format } from "date-fns"
import { getCalendarEventColor } from "@/lib/calendar-event-colors"

interface EventBadgeProps {
  event: CalendarEventSummary
  variant?: "block" | "pill"
  className?: string
  style?: React.CSSProperties
}

export function EventBadge({ event, variant = "block", className, style }: EventBadgeProps) {
  const color = getCalendarEventColor(event.type)

  if (variant === "pill") {
    return (
      <span
        title={event.title}
        className={cn(
          "block truncate rounded px-1.5 py-0.5 text-[11px] font-medium",
          color.bg,
          color.text,
          className
        )}
      >
        {event.title}
      </span>
    )
  }

  return (
    <div
      style={style}
      className={cn(
        "overflow-hidden rounded-md border-l-4 px-2 py-1 text-xs",
        color.bg,
        color.border,
        className
      )}
    >
      <p className={cn("truncate font-semibold", color.text)}>{event.title}</p>
      <p className="truncate text-muted-foreground">
        {format(new Date(event.startAt), "HH:mm")} – {format(new Date(event.endAt), "HH:mm")}
      </p>
    </div>
  )
}

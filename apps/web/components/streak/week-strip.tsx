import { StreakDayStatus } from "@workspace/types"
import { Card, CardContent, CardHeader, CardTitle } from "@workspace/ui/components/card"
import { cn } from "@workspace/ui/lib/utils"
import { format, isToday } from "date-fns"
import { Flame } from "lucide-react"

interface WeekStripProps {
  days: StreakDayStatus[]
}

export function WeekStrip({ days }: WeekStripProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>This week</CardTitle>
      </CardHeader>
      <CardContent className="grid grid-cols-7 gap-2">
        {days.map((day) => {
          const date = new Date(day.date)
          return (
            <div key={day.date} className="flex flex-col items-center gap-1.5">
              <span
                className={cn(
                  "flex size-10 items-center justify-center rounded-full border",
                  day.active
                    ? "border-orange-300 bg-orange-100 dark:bg-orange-500/20"
                    : "border-dashed border-border",
                  isToday(date) && "ring-2 ring-orange-400"
                )}
              >
                {day.active ? (
                  <Flame className="size-4 fill-orange-600 text-orange-600" />
                ) : (
                  <span className="size-1.5 rounded-full bg-muted-foreground/40" />
                )}
              </span>
              <span className="text-xs text-muted-foreground">{format(date, "EEE")}</span>
            </div>
          )
        })}
      </CardContent>
    </Card>
  )
}

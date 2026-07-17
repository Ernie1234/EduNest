"use client"

import { useMemo, useState } from "react"
import {
  addDays,
  addMonths,
  addWeeks,
  endOfDay,
  endOfMonth,
  endOfWeek,
  startOfDay,
  startOfMonth,
  startOfWeek,
} from "date-fns"
import Header from "@/components/header"
import { Nav } from "@/components/navbar"
import { useTimetable } from "@/hooks/use-timetable"
import { DayView } from "@/components/timetable/day-view"
import { WeekView } from "@/components/timetable/week-view"
import { MonthView } from "@/components/timetable/month-view"
import { TimetableViewMode, ViewSwitcher } from "@/components/timetable/view-switcher"

function getVisibleRange(mode: TimetableViewMode, referenceDate: Date) {
  if (mode === "day") {
    return { from: startOfDay(referenceDate), to: endOfDay(referenceDate) }
  }
  if (mode === "month") {
    return {
      from: startOfWeek(startOfMonth(referenceDate), { weekStartsOn: 1 }),
      to: endOfWeek(endOfMonth(referenceDate), { weekStartsOn: 1 }),
    }
  }
  return {
    from: startOfWeek(referenceDate, { weekStartsOn: 1 }),
    to: endOfWeek(referenceDate, { weekStartsOn: 1 }),
  }
}

export default function TimetablePage() {
  const [mode, setMode] = useState<TimetableViewMode>("week")
  const [referenceDate, setReferenceDate] = useState(() => new Date())

  const { from, to } = useMemo(() => getVisibleRange(mode, referenceDate), [mode, referenceDate])

  const { data: events = [], isLoading } = useTimetable({
    from: from.toISOString(),
    to: to.toISOString(),
  })

  const handleNavigate = (direction: "prev" | "next") => {
    const step = direction === "next" ? 1 : -1
    setReferenceDate((current) => {
      if (mode === "day") return addDays(current, step)
      if (mode === "month") return addMonths(current, step)
      return addWeeks(current, step)
    })
  }

  return (
    <div className="flex min-h-svh w-full flex-col">
      <Header />
      <Nav />
      <div className="flex flex-col gap-4 p-5">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-foreground">Timetable</h1>
          <p className="text-sm text-muted-foreground">
            Your scheduled classes, tests, exams, holidays, and live sessions.
          </p>
        </div>

        <ViewSwitcher
          mode={mode}
          onModeChange={setMode}
          referenceDate={referenceDate}
          onNavigate={handleNavigate}
        />

        {isLoading ? (
          <p className="text-sm text-muted-foreground">Loading timetable…</p>
        ) : (
          <>
            {mode === "day" && <DayView referenceDate={referenceDate} events={events} />}
            {mode === "week" && <WeekView referenceDate={referenceDate} events={events} />}
            {mode === "month" && <MonthView referenceDate={referenceDate} events={events} />}
          </>
        )}
      </div>
    </div>
  )
}

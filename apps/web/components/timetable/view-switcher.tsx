"use client"

import { Button } from "@workspace/ui/components/button"
import { cn } from "@workspace/ui/lib/utils"
import { format } from "date-fns"
import { ChevronLeft, ChevronRight } from "lucide-react"

export type TimetableViewMode = "day" | "week" | "month"

const VIEW_MODES: TimetableViewMode[] = ["day", "week", "month"]

interface ViewSwitcherProps {
  mode: TimetableViewMode
  onModeChange: (mode: TimetableViewMode) => void
  referenceDate: Date
  onNavigate: (direction: "prev" | "next") => void
}

export function ViewSwitcher({
  mode,
  onModeChange,
  referenceDate,
  onNavigate,
}: ViewSwitcherProps) {
  const label =
    mode === "month" ? format(referenceDate, "MMMM yyyy") : format(referenceDate, "MMMM d, yyyy")

  return (
    <div className="flex flex-wrap items-center justify-between gap-3">
      <div className="flex items-center gap-2">
        <Button variant="outline" size="icon" onClick={() => onNavigate("prev")}>
          <ChevronLeft />
        </Button>
        <span className="min-w-40 text-lg font-bold text-foreground">{label}</span>
        <Button variant="outline" size="icon" onClick={() => onNavigate("next")}>
          <ChevronRight />
        </Button>
      </div>

      <div className="flex items-center gap-1 rounded-lg bg-muted p-1">
        {VIEW_MODES.map((option) => (
          <button
            key={option}
            type="button"
            onClick={() => onModeChange(option)}
            className={cn(
              "rounded-md px-3 py-1 text-sm font-medium capitalize transition-colors",
              mode === option
                ? "bg-blue-600 text-white shadow-sm"
                : "text-muted-foreground hover:text-foreground"
            )}
          >
            {option}
          </button>
        ))}
      </div>
    </div>
  )
}

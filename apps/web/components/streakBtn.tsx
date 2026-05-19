"use client"

import React from "react"
import { Flame, ChevronDown } from "lucide-react"

export const StreakButton = () => {
  return (
    <div className="flex shrink-0 cursor-pointer items-center gap-2 rounded-xl border bg-muted/30 px-3 py-1.5 transition-colors hover:bg-muted/50">
      <div className="flex h-6 w-6 items-center justify-center rounded-full bg-orange-100">
        <Flame size={14} className="fill-orange-600 text-orange-600" />
      </div>
      <span className="text-xs font-bold whitespace-nowrap text-foreground">
        2 day streak
      </span>
      <ChevronDown size={14} className="text-muted-foreground" />
    </div>
  )
}

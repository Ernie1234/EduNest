"use client"

import Header from "@/components/header"
import { Nav } from "@/components/navbar"
import { useStreak } from "@/hooks/use-streak"
import { StreakHero } from "@/components/streak/streak-hero"
import { WeekStrip } from "@/components/streak/week-strip"
import { MilestonesCard } from "@/components/streak/milestones-card"
import { StreakFreezeCard } from "@/components/streak/streak-freeze-card"
import { StreakStatsRow } from "@/components/streak/streak-stats-row"

export default function StreakPage() {
  const { data: streak, isLoading, isError, applyFreeze, isApplyingFreeze, freezeError } =
    useStreak()

  return (
    <div className="flex min-h-svh w-full flex-col">
      <Header />
      <Nav />
      <div className="flex flex-col gap-4 p-5">
        {isLoading && <p className="text-sm text-muted-foreground">Loading your streak…</p>}
        {isError && <p className="text-sm text-destructive">Couldn&apos;t load your streak.</p>}

        {streak && (
          <>
            <StreakHero currentStreak={streak.currentStreak} />

            <div className="grid grid-cols-1 gap-4 lg:grid-cols-[1fr_320px]">
              <WeekStrip days={streak.thisWeek} />
              <MilestonesCard milestones={streak.milestones} />
            </div>

            <div className="flex flex-col gap-2">
              <StreakFreezeCard
                freezesLeftThisMonth={streak.freezesLeftThisMonth}
                onUseFreeze={() => applyFreeze(undefined)}
                isUsingFreeze={isApplyingFreeze}
              />
              {freezeError && <p className="text-sm text-destructive">{freezeError}</p>}
            </div>

            <StreakStatsRow
              longestStreak={streak.longestStreak}
              totalStudyDays={streak.totalStudyDays}
              freezesLeftThisMonth={streak.freezesLeftThisMonth}
            />
          </>
        )}
      </div>
    </div>
  )
}

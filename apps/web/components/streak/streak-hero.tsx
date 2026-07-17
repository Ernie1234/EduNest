import { Flame } from "lucide-react"

interface StreakHeroProps {
  currentStreak: number
}

export function StreakHero({ currentStreak }: StreakHeroProps) {
  return (
    <div className="flex items-center justify-between overflow-hidden rounded-xl bg-gradient-to-br from-orange-600 to-orange-800 p-6 text-white">
      <div>
        <p className="text-xs font-semibold tracking-wide uppercase opacity-80">
          Current streak
        </p>
        <p className="mt-1 text-4xl font-extrabold">
          {currentStreak} <span className="text-xl font-semibold">days</span>
        </p>
        <p className="mt-2 max-w-sm text-sm opacity-90">
          {currentStreak > 0
            ? "You studied today — keep it going!"
            : "Complete a lesson today to start your streak."}
        </p>
      </div>
      <span className="flex size-20 shrink-0 items-center justify-center rounded-full bg-white/20">
        <Flame className="size-10 fill-white text-white" />
      </span>
    </div>
  )
}

import { Card, CardContent } from "@workspace/ui/components/card"

interface StreakStatsRowProps {
  longestStreak: number
  totalStudyDays: number
  freezesLeftThisMonth: number
}

export function StreakStatsRow({
  longestStreak,
  totalStudyDays,
  freezesLeftThisMonth,
}: StreakStatsRowProps) {
  const stats = [
    { label: "Longest streak", value: `${longestStreak} days` },
    { label: "Total study days", value: totalStudyDays },
    { label: "Streak freezes", value: `${freezesLeftThisMonth} left` },
  ]

  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
      {stats.map((stat) => (
        <Card key={stat.label}>
          <CardContent>
            <p className="text-sm text-muted-foreground">{stat.label}</p>
            <p className="text-2xl font-bold text-foreground">{stat.value}</p>
          </CardContent>
        </Card>
      ))}
    </div>
  )
}

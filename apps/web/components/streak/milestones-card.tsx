import { StreakMilestone } from "@workspace/types"
import { Card, CardContent, CardHeader, CardTitle } from "@workspace/ui/components/card"
import { Award, Crown, Zap } from "lucide-react"

interface MilestonesCardProps {
  milestones: StreakMilestone[]
}

const ICONS = [Zap, Award, Crown]

export function MilestonesCard({ milestones }: MilestonesCardProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Milestones</CardTitle>
      </CardHeader>
      <CardContent className="flex flex-col gap-3">
        {milestones.map((milestone, index) => {
          const Icon = ICONS[index % ICONS.length] ?? Zap
          return (
            <div key={milestone.days} className="flex items-center gap-3">
              <span className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-amber-500/10">
                <Icon className="size-4 text-amber-600" />
              </span>
              <div className="flex-1">
                <p className="text-sm font-medium text-foreground">{milestone.label}</p>
                <p className="text-xs text-muted-foreground">
                  {milestone.achieved ? "Achieved" : `${milestone.daysToGo} day(s) to go`}
                </p>
              </div>
              {!milestone.achieved && (
                <div className="h-1.5 w-16 rounded-full bg-muted">
                  <div
                    className="h-full rounded-full bg-amber-500"
                    style={{
                      width: `${Math.min(100, Math.round(((milestone.days - milestone.daysToGo) / milestone.days) * 100))}%`,
                    }}
                  />
                </div>
              )}
            </div>
          )
        })}
      </CardContent>
    </Card>
  )
}

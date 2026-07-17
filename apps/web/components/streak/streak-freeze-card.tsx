import { Button } from "@workspace/ui/components/button"
import { Card, CardContent } from "@workspace/ui/components/card"
import { Snowflake } from "lucide-react"

interface StreakFreezeCardProps {
  freezesLeftThisMonth: number
  onUseFreeze: () => void
  isUsingFreeze: boolean
}

export function StreakFreezeCard({
  freezesLeftThisMonth,
  onUseFreeze,
  isUsingFreeze,
}: StreakFreezeCardProps) {
  return (
    <Card className="bg-blue-500/5">
      <CardContent className="flex items-start gap-3">
        <span className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-blue-500/10">
          <Snowflake className="size-4 text-blue-500" />
        </span>
        <div className="flex-1">
          <p className="text-sm font-medium text-foreground">Streak freeze</p>
          <p className="text-xs text-muted-foreground">
            Protect your streak on a day off. You have {freezesLeftThisMonth} freeze
            {freezesLeftThisMonth === 1 ? "" : "s"} left this month.
          </p>
        </div>
        <Button
          size="sm"
          variant="outline"
          disabled={freezesLeftThisMonth === 0 || isUsingFreeze}
          onClick={onUseFreeze}
        >
          Use freeze
        </Button>
      </CardContent>
    </Card>
  )
}

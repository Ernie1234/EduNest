import Link from "next/link"
import { LiveClassSummary } from "@workspace/types"
import { Button } from "@workspace/ui/components/button"
import { Card, CardContent, CardHeader, CardTitle } from "@workspace/ui/components/card"
import { format, formatDistanceToNow } from "date-fns"
import { Radio } from "lucide-react"

interface NextLiveClassCardProps {
  liveClass: LiveClassSummary | null
}

export function NextLiveClassCard({ liveClass }: NextLiveClassCardProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Next live class</CardTitle>
      </CardHeader>
      <CardContent>
        {!liveClass ? (
          <p className="text-sm text-muted-foreground">No upcoming live class scheduled.</p>
        ) : (
          <div className="flex flex-col gap-2">
            <p className="font-semibold text-foreground">{liveClass.title}</p>
            <p className="text-sm text-muted-foreground">
              {liveClass.status === "LIVE"
                ? "Live now"
                : `${format(new Date(liveClass.scheduledStart), "EEE, MMM d · p")} · starts ${formatDistanceToNow(
                    new Date(liveClass.scheduledStart),
                    { addSuffix: true }
                  )}`}
            </p>
            {liveClass.status === "LIVE" && (
              <Button asChild>
                <Link href="/live-classes">
                  <Radio />
                  Join live class
                </Link>
              </Button>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  )
}

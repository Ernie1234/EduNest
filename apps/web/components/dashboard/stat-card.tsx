import type { LucideIcon } from "lucide-react"
import { Card, CardContent } from "@workspace/ui/components/card"

interface StatCardProps {
  label: string
  value: string | number
  icon: LucideIcon
}

export function StatCard({ label, value, icon: Icon }: StatCardProps) {
  return (
    <Card>
      <CardContent className="flex items-center justify-between gap-3">
        <div>
          <p className="text-sm text-muted-foreground">{label}</p>
          <p className="text-2xl font-bold text-foreground">{value}</p>
        </div>
        <span className="flex size-10 shrink-0 items-center justify-center rounded-lg bg-blue-500/10">
          <Icon className="size-5 text-blue-500" />
        </span>
      </CardContent>
    </Card>
  )
}

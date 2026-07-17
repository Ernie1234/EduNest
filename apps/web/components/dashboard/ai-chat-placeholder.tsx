import { Sparkles } from "lucide-react"
import { Card, CardContent } from "@workspace/ui/components/card"
import { Input } from "@workspace/ui/components/input"

/** Static placeholder — no AI backend exists yet, this is UI scaffolding only. */
export function AiChatPlaceholder() {
  return (
    <Card>
      <CardContent className="flex flex-col items-center justify-center gap-3 py-8 text-center">
        <span className="flex size-14 items-center justify-center rounded-full bg-blue-500/10">
          <Sparkles className="size-6 text-blue-500" />
        </span>
        <p className="font-medium text-foreground">What would you like to do?</p>
        <Input placeholder="Ask anything… (coming soon)" disabled className="max-w-xs" />
      </CardContent>
    </Card>
  )
}

import { Badge } from "@workspace/ui/components/badge"
import { Mic, Pause, Settings, Smile, Volume2 } from "lucide-react"

interface VideoPlaceholderProps {
  title: string
  isLive: boolean
}

/** No real video streaming infra exists yet — this is a visual placeholder
 * for where a live feed / recording would render. */
export function VideoPlaceholder({ title, isLive }: VideoPlaceholderProps) {
  return (
    <div className="relative flex aspect-video w-full flex-col justify-between overflow-hidden rounded-xl bg-neutral-900 text-white">
      <div className="flex justify-end p-3">
        {isLive && (
          <Badge variant="destructive" className="gap-1.5">
            <span className="size-1.5 animate-pulse rounded-full bg-current" />
            Recording session
          </Badge>
        )}
      </div>

      <div className="flex flex-1 items-center justify-center px-6 text-center text-neutral-400">
        <p>{title}</p>
      </div>

      <div className="flex items-center gap-3 bg-black/40 px-4 py-2.5">
        <button className="rounded-full bg-white/10 p-1.5 hover:bg-white/20">
          <Pause className="size-4" />
        </button>
        <button className="rounded-full bg-white/10 p-1.5 hover:bg-white/20">
          <Smile className="size-4" />
        </button>
        <button className="rounded-full bg-white/10 p-1.5 hover:bg-white/20">
          <Mic className="size-4" />
        </button>
        <div className="mx-2 h-1 flex-1 rounded-full bg-white/20">
          <div className="h-full w-1/3 rounded-full bg-red-500" />
        </div>
        <button className="rounded-full bg-white/10 p-1.5 hover:bg-white/20">
          <Volume2 className="size-4" />
        </button>
        <button className="rounded-full bg-white/10 p-1.5 hover:bg-white/20">
          <Settings className="size-4" />
        </button>
      </div>
    </div>
  )
}

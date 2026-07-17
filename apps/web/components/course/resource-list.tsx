import { CourseModuleDetail } from "@workspace/types"
import { FileText, Film, Headphones, Image as ImageIcon, Link as LinkIcon } from "lucide-react"

interface ResourceListProps {
  modules: CourseModuleDetail[]
}

const KIND_ICONS = {
  IMAGE: ImageIcon,
  VIDEO: Film,
  AUDIO: Headphones,
  DOCUMENT: FileText,
} as const

function resourceLabel(url: string): string {
  const segments = url.split("/")
  return segments[segments.length - 1] || url
}

export function ResourceList({ modules }: ResourceListProps) {
  const resourceEntries = modules.flatMap((courseModule) =>
    courseModule.lessons.flatMap((lesson) =>
      lesson.media
        ? [{ moduleTitle: courseModule.title, lessonTitle: lesson.title, lessonId: lesson.id, media: lesson.media }]
        : []
    )
  )

  if (resourceEntries.length === 0) {
    return (
      <p className="text-sm text-muted-foreground">
        No resources have been attached to this course&apos;s lessons yet.
      </p>
    )
  }

  return (
    <div className="flex flex-col divide-y divide-border rounded-xl border border-border bg-card">
      {resourceEntries.map(({ moduleTitle, lessonTitle, lessonId, media }) => {
        const Icon = KIND_ICONS[media.kind] ?? LinkIcon
        return (
          <a
            key={lessonId}
            href={media.url}
            target="_blank"
            rel="noreferrer"
            className="flex items-center gap-3 px-4 py-3 hover:bg-muted/50"
          >
            <Icon className="size-5 shrink-0 text-blue-500" />
            <div className="min-w-0 flex-1">
              <p className="truncate text-sm font-medium text-foreground">
                {resourceLabel(media.url)}
              </p>
              <p className="truncate text-xs text-muted-foreground">
                {moduleTitle} · {lessonTitle}
              </p>
            </div>
          </a>
        )
      })}
    </div>
  )
}

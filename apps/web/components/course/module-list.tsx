import { CourseModuleDetail } from "@workspace/types"
import { Badge } from "@workspace/ui/components/badge"
import { CheckCircle2, Circle, PlayCircle } from "lucide-react"

interface ModuleListProps {
  modules: CourseModuleDetail[]
}

export function ModuleList({ modules }: ModuleListProps) {
  const allLessons = modules.flatMap((m) => m.lessons)
  const upNextLessonId = allLessons.find((lesson) => !lesson.completed)?.id

  if (modules.length === 0) {
    return <p className="text-sm text-muted-foreground">No modules have been added yet.</p>
  }

  return (
    <div className="flex flex-col gap-4">
      {modules.map((courseModule) => {
        const completedCount = courseModule.lessons.filter((l) => l.completed).length
        return (
          <div key={courseModule.id} className="rounded-xl border border-border bg-card">
            <div className="flex items-center justify-between border-b border-border px-4 py-3">
              <h3 className="font-semibold text-foreground">{courseModule.title}</h3>
              <span className="text-sm text-muted-foreground">
                {completedCount}/{courseModule.lessons.length} done
              </span>
            </div>
            <div className="flex flex-col divide-y divide-border">
              {courseModule.lessons.map((lesson) => (
                <div key={lesson.id} className="flex items-center gap-3 px-4 py-2.5">
                  {lesson.completed ? (
                    <CheckCircle2 className="size-5 shrink-0 text-emerald-500" />
                  ) : lesson.id === upNextLessonId ? (
                    <PlayCircle className="size-5 shrink-0 text-blue-500" />
                  ) : (
                    <Circle className="size-5 shrink-0 text-muted-foreground" />
                  )}
                  <span className="flex-1 text-sm text-foreground">{lesson.title}</span>
                  {lesson.id === upNextLessonId && <Badge variant="outline">Up next</Badge>}
                  {lesson.durationMinutes && (
                    <span className="text-xs text-muted-foreground">
                      {lesson.durationMinutes}:00
                    </span>
                  )}
                </div>
              ))}
            </div>
          </div>
        )
      })}
    </div>
  )
}

import { CourseOfferingDetail } from "@workspace/types"
import { Badge } from "@workspace/ui/components/badge"
import { Button } from "@workspace/ui/components/button"
import { Progress } from "@workspace/ui/components/progress"
import { getCourseStatus } from "@/lib/course-status"

interface CourseHeaderProps {
  detail: CourseOfferingDetail
  onContinueLearning: () => void
}

export function CourseHeader({ detail, onContinueLearning }: CourseHeaderProps) {
  const status = getCourseStatus(
    detail.enrollmentStatus,
    detail.totalLessons,
    detail.completedLessons
  )
  const progressPercent =
    detail.totalLessons > 0
      ? Math.round((detail.completedLessons / detail.totalLessons) * 100)
      : 0
  const primaryInstructor = detail.instructors.find((i) => i.isPrimary) ?? detail.instructors[0]

  return (
    <div className="overflow-hidden rounded-xl border border-border bg-card">
      <div className="h-28 bg-gradient-to-r from-blue-600 to-blue-500" />
      <div className="flex flex-col gap-4 p-5">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-xl font-bold text-foreground">
                {detail.course.code} — {detail.course.title}
              </h1>
              <Badge variant={status.variant}>{status.label}</Badge>
            </div>
            <p className="text-sm text-muted-foreground">
              {detail.course.department.name} · {detail.course.creditUnits} Credit Units
              {primaryInstructor?.name ? ` · ${primaryInstructor.name}` : ""}
            </p>
          </div>
          <Button onClick={onContinueLearning}>Continue learning</Button>
        </div>

        <div className="flex items-center gap-3">
          <Progress value={progressPercent} className="max-w-md" />
          <span className="shrink-0 text-sm text-muted-foreground">
            {progressPercent}% · {detail.completedLessons}/{detail.totalLessons} lessons
          </span>
        </div>
      </div>
    </div>
  )
}

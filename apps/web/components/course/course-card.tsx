import Link from "next/link"
import { EnrolledCourseSummary } from "@workspace/types"
import { Badge } from "@workspace/ui/components/badge"
import { Button } from "@workspace/ui/components/button"
import { Progress } from "@workspace/ui/components/progress"
import { getCourseBannerGradient } from "@/lib/course-banner-colors"
import { getCourseStatus } from "@/lib/course-status"

interface CourseCardProps {
  course: EnrolledCourseSummary
}

export function CourseCard({ course }: CourseCardProps) {
  const status = getCourseStatus(course.status, course.totalLessons, course.completedLessons)
  const progressPercent =
    course.totalLessons > 0 ? Math.round((course.completedLessons / course.totalLessons) * 100) : 0
  const isComplete = status.label === "Completed"

  return (
    <div className="flex flex-col overflow-hidden rounded-xl border border-border bg-card">
      <div
        className={`flex h-20 items-start justify-between bg-gradient-to-r p-3 ${getCourseBannerGradient(course.course.code)}`}
      >
        <span className="rounded-md bg-white/20 px-2 py-0.5 text-xs font-semibold text-white">
          {course.course.code}
        </span>
        <Badge variant={status.variant}>{status.label}</Badge>
      </div>

      <div className="flex flex-1 flex-col gap-3 p-4">
        <div>
          <h3 className="font-semibold text-foreground">{course.course.title}</h3>
          <p className="text-sm text-muted-foreground">{course.course.department.name}</p>
        </div>

        <div className="flex items-center gap-2">
          <Progress value={progressPercent} />
          <span className="shrink-0 text-sm text-muted-foreground">{progressPercent}%</span>
        </div>

        <div className="mt-auto flex items-center justify-between gap-2 pt-1">
          <span className="truncate text-sm text-muted-foreground">
            {course.instructorName ?? "Unassigned"}
          </span>
          <Button size="sm" variant={isComplete ? "outline" : "default"} asChild>
            <Link href={`/my-courses/${course.courseOfferingId}`}>
              {isComplete ? "Review" : "Continue"}
            </Link>
          </Button>
        </div>
      </div>
    </div>
  )
}

import Link from "next/link"
import { EnrolledCourseSummary } from "@workspace/types"
import { Button } from "@workspace/ui/components/button"
import { Card, CardContent, CardHeader, CardTitle } from "@workspace/ui/components/card"
import { Progress } from "@workspace/ui/components/progress"
import { getCourseBannerGradient } from "@/lib/course-banner-colors"
import { getCourseStatus } from "@/lib/course-status"

interface ContinueLearningListProps {
  courses: EnrolledCourseSummary[]
}

export function ContinueLearningList({ courses }: ContinueLearningListProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Continue learning</CardTitle>
      </CardHeader>
      <CardContent className="flex flex-col divide-y divide-border">
        {courses.map((course) => {
          const progressPercent =
            course.totalLessons > 0
              ? Math.round((course.completedLessons / course.totalLessons) * 100)
              : 0
          const status = getCourseStatus(course.status, course.totalLessons, course.completedLessons)
          const isComplete = status.label === "Completed"

          return (
            <div key={course.courseOfferingId} className="flex items-center gap-3 py-3 first:pt-0 last:pb-0">
              <div
                className={`size-10 shrink-0 rounded-lg bg-gradient-to-br ${getCourseBannerGradient(course.course.code)}`}
              />
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-medium text-foreground">
                  {course.course.code} — {course.course.title}
                </p>
                <div className="mt-1 flex items-center gap-2">
                  <Progress value={progressPercent} className="h-1.5 max-w-32" />
                  <span className="text-xs text-muted-foreground">{progressPercent}%</span>
                </div>
              </div>
              <span className="hidden shrink-0 truncate text-xs text-muted-foreground sm:block">
                {course.instructorName ?? "Unassigned"}
              </span>
              <Button size="sm" variant={isComplete ? "outline" : "default"} asChild>
                <Link href={`/my-courses/${course.courseOfferingId}`}>
                  {isComplete ? "Review" : "Continue"}
                </Link>
              </Button>
            </div>
          )
        })}
      </CardContent>
    </Card>
  )
}

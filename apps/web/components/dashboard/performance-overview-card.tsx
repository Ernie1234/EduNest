"use client"

import { useState } from "react"
import { useQuery } from "@tanstack/react-query"
import { EnrolledCourseSummary } from "@workspace/types"
import { Card, CardAction, CardContent, CardHeader, CardTitle } from "@workspace/ui/components/card"
import { AcademicsService } from "@/services/academics.service"

interface PerformanceOverviewCardProps {
  courses: EnrolledCourseSummary[]
}

export function PerformanceOverviewCard({ courses }: PerformanceOverviewCardProps) {
  const [selectedId, setSelectedId] = useState(courses[0]?.courseOfferingId ?? "")
  const courseOfferingId = selectedId || courses[0]?.courseOfferingId || ""

  const { data: assessments = [] } = useQuery({
    queryKey: ["course-offering-assessments", courseOfferingId],
    queryFn: () => AcademicsService.getAssessments(courseOfferingId),
    enabled: !!courseOfferingId,
  })

  const graded = assessments.filter((a) => a.myGrade !== null)

  return (
    <Card>
      <CardHeader>
        <CardTitle>Performance Overview</CardTitle>
        <CardAction>
          <select
            className="rounded-md border border-border bg-background px-2 py-1 text-sm"
            value={courseOfferingId}
            onChange={(e) => setSelectedId(e.target.value)}
          >
            {courses.map((course) => (
              <option key={course.courseOfferingId} value={course.courseOfferingId}>
                {course.course.code}
              </option>
            ))}
          </select>
        </CardAction>
      </CardHeader>
      <CardContent>
        {graded.length === 0 ? (
          <p className="text-sm text-muted-foreground">No graded assessments yet.</p>
        ) : (
          <div className="flex h-40 items-end gap-3">
            {graded.map((assessment) => {
              const percent = Math.round(((assessment.myGrade ?? 0) / assessment.maxScore) * 100)
              return (
                <div key={assessment.id} className="flex flex-1 flex-col items-center gap-1.5">
                  <span className="text-xs font-semibold text-foreground">{percent}%</span>
                  <div className="flex w-full flex-1 items-end rounded-md bg-blue-500/10">
                    <div
                      className="w-full rounded-md bg-blue-500 transition-all"
                      style={{ height: `${percent}%` }}
                    />
                  </div>
                  <span className="max-w-full truncate text-[11px] text-muted-foreground">
                    {assessment.title}
                  </span>
                </div>
              )
            })}
          </div>
        )}
      </CardContent>
    </Card>
  )
}

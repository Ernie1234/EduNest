import { Badge } from "@workspace/ui/components/badge"
import { Card, CardContent, CardHeader, CardTitle } from "@workspace/ui/components/card"
import type { AssessmentWithCourse } from "@/hooks/use-all-assessments"
import { getAssignmentStatus, getAssignmentStatusBadgeVariant } from "@/lib/assignment-status"

interface AssignmentsPanelProps {
  assessments: AssessmentWithCourse[]
  isLoading: boolean
}

export function AssignmentsPanel({ assessments, isLoading }: AssignmentsPanelProps) {
  const sorted = [...assessments].sort((a, b) => {
    if (!a.dueAt) return 1
    if (!b.dueAt) return -1
    return new Date(a.dueAt).getTime() - new Date(b.dueAt).getTime()
  })

  return (
    <Card>
      <CardHeader>
        <CardTitle>Assignments</CardTitle>
      </CardHeader>
      <CardContent className="flex flex-col gap-2">
        {isLoading && <p className="text-sm text-muted-foreground">Loading…</p>}
        {!isLoading && sorted.length === 0 && (
          <p className="text-sm text-muted-foreground">No assignments right now.</p>
        )}
        {sorted.map((assessment) => {
          const status = getAssignmentStatus(assessment)
          return (
            <div key={assessment.id} className="flex items-center justify-between gap-2 py-1">
              <div className="min-w-0">
                <p className="truncate text-sm font-medium text-foreground">
                  {assessment.courseCode} — {assessment.title}
                </p>
              </div>
              <Badge variant={getAssignmentStatusBadgeVariant(status)}>{status}</Badge>
            </div>
          )
        })}
      </CardContent>
    </Card>
  )
}

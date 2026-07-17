import { AssessmentWithGrade } from "@workspace/types"
import { Badge } from "@workspace/ui/components/badge"
import { format } from "date-fns"

interface AssessmentListProps {
  assessments: AssessmentWithGrade[]
  showGrades?: boolean
  emptyMessage?: string
}

export function AssessmentList({
  assessments,
  showGrades = false,
  emptyMessage = "No assessments yet.",
}: AssessmentListProps) {
  if (assessments.length === 0) {
    return <p className="text-sm text-muted-foreground">{emptyMessage}</p>
  }

  return (
    <div className="flex flex-col divide-y divide-border rounded-xl border border-border bg-card">
      {assessments.map((assessment) => (
        <div
          key={assessment.id}
          className="flex flex-wrap items-center justify-between gap-2 px-4 py-3"
        >
          <div>
            <div className="flex items-center gap-2">
              <span className="font-medium text-foreground">{assessment.title}</span>
              <Badge variant="outline">{assessment.type}</Badge>
            </div>
            <p className="text-sm text-muted-foreground">
              {assessment.dueAt
                ? `Due ${format(new Date(assessment.dueAt), "MMM d, yyyy")}`
                : "No due date"}{" "}
              · {assessment.weightPercent}% weight
            </p>
          </div>

          {showGrades && (
            <span className="text-sm font-semibold text-foreground">
              {assessment.myGrade !== null
                ? `${assessment.myGrade}/${assessment.maxScore}`
                : "Not graded"}
            </span>
          )}
        </div>
      ))}
    </div>
  )
}

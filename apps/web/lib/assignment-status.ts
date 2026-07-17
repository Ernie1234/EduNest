import { AssessmentWithGrade, AssignmentStatus } from "@workspace/types"

export function getAssignmentStatus(assessment: AssessmentWithGrade): AssignmentStatus {
  if (assessment.myGrade !== null) return "Completed"
  if (assessment.dueAt && new Date(assessment.dueAt) < new Date()) return "Overdue"
  return "In progress"
}

export function getAssignmentStatusBadgeVariant(
  status: AssignmentStatus
): "success" | "warning" | "destructive" | "secondary" {
  switch (status) {
    case "Completed":
      return "success"
    case "Overdue":
      return "destructive"
    case "Cancelled":
      return "secondary"
    default:
      return "warning"
  }
}

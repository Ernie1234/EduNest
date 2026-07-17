export interface CourseStatusBadge {
  label: string
  variant: "success" | "warning" | "secondary"
}

const ALMOST_DONE_THRESHOLD = 0.85

export function getCourseStatus(
  enrollmentStatus: string | null,
  totalLessons: number,
  completedLessons: number
): CourseStatusBadge {
  const isComplete =
    enrollmentStatus === "COMPLETED" || (totalLessons > 0 && completedLessons === totalLessons)
  if (isComplete) return { label: "Completed", variant: "secondary" }

  const progress = totalLessons > 0 ? completedLessons / totalLessons : 0
  if (progress >= ALMOST_DONE_THRESHOLD) return { label: "Almost done", variant: "warning" }
  return { label: "Active", variant: "success" }
}

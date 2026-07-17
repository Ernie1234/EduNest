import { useQueries } from "@tanstack/react-query"
import { AcademicsService } from "@/services/academics.service"
import { AssessmentWithGrade, EnrolledCourseSummary } from "@workspace/types"

export interface AssessmentWithCourse extends AssessmentWithGrade {
  courseCode: string
}

/** Fetches assessments across every enrolled course (one request per course —
 * bounded by how many courses a student is enrolled in) and flattens them
 * with the course code attached, for cross-course views like the dashboard. */
export function useAllAssessments(courses: EnrolledCourseSummary[]) {
  const results = useQueries({
    queries: courses.map((course) => ({
      queryKey: ["course-offering-assessments", course.courseOfferingId],
      queryFn: () => AcademicsService.getAssessments(course.courseOfferingId),
    })),
  })

  const isLoading = results.length > 0 && results.some((r) => r.isLoading)
  const assessments: AssessmentWithCourse[] = results.flatMap((result, index) =>
    (result.data ?? []).map((assessment) => ({
      ...assessment,
      courseCode: courses[index]?.course.code ?? "",
    }))
  )

  return { assessments, isLoading }
}

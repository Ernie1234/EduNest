import { AcademicsService } from "@/services/academics.service"
import { useQuery } from "@tanstack/react-query"

export function useCourseOffering(courseOfferingId: string) {
  const detail = useQuery({
    queryKey: ["course-offering", courseOfferingId],
    queryFn: () => AcademicsService.getCourseOffering(courseOfferingId),
    enabled: !!courseOfferingId,
  })

  const assessments = useQuery({
    queryKey: ["course-offering-assessments", courseOfferingId],
    queryFn: () => AcademicsService.getAssessments(courseOfferingId),
    enabled: !!courseOfferingId,
  })

  return { detail, assessments }
}

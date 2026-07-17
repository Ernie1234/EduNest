import { AcademicsService } from "@/services/academics.service"
import { useQuery } from "@tanstack/react-query"

export function useMyCourses() {
  return useQuery({
    queryKey: ["my-enrollments"],
    queryFn: AcademicsService.getMyEnrollments,
  })
}

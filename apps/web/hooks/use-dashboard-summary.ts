import { AcademicsService } from "@/services/academics.service"
import { useQuery } from "@tanstack/react-query"

export function useDashboardSummary() {
  return useQuery({
    queryKey: ["dashboard-summary"],
    queryFn: AcademicsService.getDashboardSummary,
  })
}

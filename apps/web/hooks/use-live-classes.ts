import { LiveClassesService } from "@/services/live-classes.service"
import { useQuery } from "@tanstack/react-query"

export function useLiveClasses() {
  return useQuery({
    queryKey: ["live-classes"],
    queryFn: LiveClassesService.listLiveClasses,
  })
}

export function useLiveClass(id: string) {
  return useQuery({
    queryKey: ["live-class", id],
    queryFn: () => LiveClassesService.getLiveClass(id),
    enabled: !!id,
  })
}

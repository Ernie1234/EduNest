import { StreakService } from "@/services/streak.service"
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import { isAxiosError } from "axios"

export function useStreak() {
  const queryClient = useQueryClient()

  const query = useQuery({
    queryKey: ["streak"],
    queryFn: StreakService.getStreak,
  })

  const freezeMutation = useMutation({
    mutationFn: (forDate?: string) => StreakService.applyFreeze(forDate),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["streak"] }),
  })

  const freezeError = isAxiosError<{ message?: string }>(freezeMutation.error)
    ? (freezeMutation.error.response?.data.message ?? "Couldn't apply the freeze.")
    : freezeMutation.error
      ? "Couldn't apply the freeze."
      : null

  return {
    ...query,
    applyFreeze: (forDate?: string) => freezeMutation.mutate(forDate),
    isApplyingFreeze: freezeMutation.isPending,
    freezeError,
  }
}

// hooks/use-auth.ts
import { apiClient } from "@/lib/api-client"
import { AuthService } from "@/services/auth.service"
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import { SessionUser } from "@workspace/types"
import { useRouter } from "next/navigation"

export function useAuth() {
  const queryClient = useQueryClient()
  const router = useRouter()

  // Fetch session data
  const { data: user, isLoading } = useQuery<SessionUser | null>({
    queryKey: ["session"],
    queryFn: AuthService.getSession,
    retry: false,
    staleTime: 5 * 60 * 1000,
  })

  // Logout mutation
  const logoutMutation = useMutation({
    mutationFn: () => apiClient.post("/auth/logout"),
    onSuccess: () => {
      queryClient.setQueryData(["session"], null)
      router.replace("/")
    },
  })

  return {
    user,
    isLoading,
    isAuthenticated: !!user,
    logout: logoutMutation.mutateAsync,
    loginUrl: AuthService.getGoogleLoginUrl(),
  }
}

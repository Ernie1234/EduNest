import { apiClient } from "@/lib/api-client"
import { SessionUser } from "@workspace/types"

export const AuthService = {
  /**
   * Fetches the current authenticated user session
   */
  async getSession(): Promise<SessionUser | null> {
    try {
      const { data } = await apiClient.get<SessionUser>("/auth/me")
      return data
    } catch (error) {
      // We return null on failure because "no session" is a valid state
      return null
    }
  },

  /**
   * Logs the user out and clears the server-side cookie
   */
  async logout(): Promise<void> {
    await apiClient.post("/auth/logout")
  },

  /**
   * Returns the formatted Google Login URL
   */
  getGoogleLoginUrl(): string {
    const baseUrl = apiClient.defaults.baseURL || ""
    return `${baseUrl}/auth/google`
  },
}

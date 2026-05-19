// hooks/use-role-demo.ts
import { apiClient } from "@/lib/api-client"
import { useState } from "react"

export function useRoleDemo() {
  const [response, setResponse] = useState<string | null>(null)

  const testEndpoint = async (path: string) => {
    try {
      const { data } = await apiClient.get(path)
      setResponse(JSON.stringify(data))
    } catch (error: any) {
      setResponse(
        error?.response?.data?.message || error.message || "Request failed"
      )
    }
  }

  return {
    response,
    clearResponse: () => setResponse(null),
    tryLandlord: () => testEndpoint("/roles/landlord"),
    trySuperAdmin: () => testEndpoint("/roles/super-admin"),
  }
}

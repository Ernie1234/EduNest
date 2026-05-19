"use client"

import { useRouter } from "next/navigation"
import { useEffect } from "react"
import { LoginForm } from "@/components/login-form"
import { useAuth } from "@/hooks/use-auth"

export default function Page() {
  const { user, isLoading } = useAuth()
  const router = useRouter()

  useEffect(() => {
    if (!isLoading && user) {
      router.push("/dashboard")
    }
  }, [user, isLoading, router])

  if (isLoading) {
    return (
      <div className="flex min-h-svh items-center justify-center">
        <p className="animate-pulse text-muted-foreground">
          Verifying session...
        </p>
      </div>
    )
  }

  return (
    <div className="flex min-h-svh w-full flex-col items-center justify-center p-6 md:p-10">
      <div className="w-full max-w-sm">
        <LoginForm />
      </div>
    </div>
  )
}

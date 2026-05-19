"use client"

import { useRouter } from "next/navigation"
import { useEffect, useState } from "react"
import { AuthService } from "@/services/auth.service"

export default function AuthCallbackPage() {
  const router = useRouter()
  const [message, setMessage] = useState("Finalizing secure sign-in...")

  useEffect(() => {
    let isCancelled = false

    const validateSession = async () => {
      // Use the robust service we created
      const user = await AuthService.getSession()

      if (isCancelled) return

      if (user) {
        setMessage("Success! Redirecting...")
        // Use replace instead of push so the user can't "Go Back" into the loading screen
        router.replace("/dashboard")
      } else {
        setMessage("Authentication failed. Redirecting to login...")
        setTimeout(() => {
          router.replace("/")
        }, 2000)
      }
    }

    validateSession()

    return () => {
      isCancelled = true
    }
  }, [router])

  return (
    <div className="flex min-h-svh flex-col items-center justify-center gap-4 p-6">
      {/* Optional: Add a spinner here using Shadcn if you have one */}
      <div className="h-6 w-6 animate-spin rounded-full border-2 border-primary border-t-transparent" />
      <p className="animate-pulse text-sm font-medium">{message}</p>
    </div>
  )
}

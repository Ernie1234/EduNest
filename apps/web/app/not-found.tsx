import Link from "next/link"
import type { Metadata } from "next"
import { Compass, Home, LayoutDashboard } from "lucide-react"

import { Button } from "@workspace/ui/components/button"
import Logo from "@/components/logo"

export const metadata: Metadata = {
  title: "Page not found | EduNest",
}

export default function NotFound() {
  return (
    <div className="flex min-h-svh w-full flex-col bg-background">
      <header className="flex items-center gap-2 px-6 py-4">
        <Logo />
        <span className="text-lg font-bold tracking-tight text-foreground">
          EduNest
        </span>
      </header>

      <main className="flex flex-1 flex-col items-center justify-center px-6 py-12 text-center">
        <div className="relative flex h-28 w-28 items-center justify-center rounded-full bg-blue-500/10">
          <Compass className="h-12 w-12 text-blue-500" strokeWidth={1.75} />
          <span className="absolute -top-1 -right-1 flex h-9 w-9 items-center justify-center rounded-full border-4 border-background bg-blue-500 text-[10px] font-bold text-white">
            404
          </span>
        </div>

        <h1 className="mt-6 text-2xl font-extrabold tracking-tight text-foreground sm:text-3xl">
          Page not found
        </h1>
        <p className="mt-2 max-w-sm text-sm leading-relaxed text-muted-foreground">
          The page you&apos;re looking for doesn&apos;t exist, may have moved,
          or the link might be broken.
        </p>

        <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
          <Button
            asChild
            size="lg"
            className="bg-blue-500 text-white shadow-lg shadow-blue-500/30 hover:bg-blue-600"
          >
            <Link href="/dashboard">
              <LayoutDashboard />
              Back to Dashboard
            </Link>
          </Button>
          <Button asChild variant="outline" size="lg">
            <Link href="/">
              <Home />
              Go to Homepage
            </Link>
          </Button>
        </div>
      </main>
    </div>
  )
}

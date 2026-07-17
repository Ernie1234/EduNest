import { Button } from "@workspace/ui/components/button"
import { Book } from "lucide-react"
import Link from "next/link"

export function EmptyCourse() {
  return (
    <main className="flex flex-1 flex-col items-center justify-center px-6 py-12 text-center">
      <div className="relative flex h-28 w-28 items-center justify-center rounded-full bg-blue-500/10">
        <Book className="h-12 w-12 text-blue-500" strokeWidth={1.75} />
        <span className="absolute -top-1 -right-1 flex h-9 w-9 items-center justify-center rounded-full border-4 border-background bg-blue-500 text-[10px] font-bold text-white">
          0
        </span>
      </div>

      <h1 className="mt-6 text-2xl font-extrabold tracking-tight text-foreground sm:text-3xl">
        No Course found
      </h1>
      <p className="text-sm text-muted-foreground">
        You&apos;re not enrolled in any courses yet.
      </p>

      <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
        <Button
          asChild
          size="lg"
          className="bg-blue-500 text-white shadow-lg shadow-blue-500/30 hover:bg-blue-600"
        >
          <Link href="/courses">
            <Book />
            Browse Courses
          </Link>
        </Button>
      </div>
    </main>
  )
}

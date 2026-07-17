"use client"

import Link from "next/link"
import Header from "@/components/header"
import { Nav } from "@/components/navbar"
import { useLiveClasses } from "@/hooks/use-live-classes"
import { Badge } from "@workspace/ui/components/badge"
import { Card, CardContent } from "@workspace/ui/components/card"
import { format } from "date-fns"

export default function LiveClassesPage() {
  const { data: liveClasses = [], isLoading, isError } = useLiveClasses()

  return (
    <div className="flex min-h-svh w-full flex-col">
      <Header />
      <Nav />
      <div className="flex flex-col gap-4 p-5">
        <h1 className="text-2xl font-bold tracking-tight text-foreground">Live Classes</h1>

        {isLoading && <p className="text-sm text-muted-foreground">Loading…</p>}
        {isError && <p className="text-sm text-destructive">Couldn&apos;t load live classes.</p>}
        {!isLoading && !isError && liveClasses.length === 0 && (
          <p className="text-sm text-muted-foreground">No live classes scheduled.</p>
        )}

        <div className="flex flex-col gap-3">
          {liveClasses.map((liveClass) => (
            <Link key={liveClass.id} href={`/live-classes/${liveClass.id}`}>
              <Card className="transition-colors hover:bg-muted/40">
                <CardContent className="flex items-center justify-between gap-3">
                  <div className="min-w-0">
                    <div className="flex items-center gap-2">
                      <p className="truncate font-medium text-foreground">
                        {liveClass.courseCode} — {liveClass.title}
                      </p>
                      {liveClass.status === "LIVE" && (
                        <Badge variant="destructive">Live now</Badge>
                      )}
                    </div>
                    <p className="text-sm text-muted-foreground">
                      {liveClass.courseTitle} · {liveClass.hostName ?? "Unassigned"}
                    </p>
                  </div>
                  <span className="shrink-0 text-sm text-muted-foreground">
                    {format(new Date(liveClass.scheduledStart), "EEE, MMM d · p")}
                  </span>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>
      </div>
    </div>
  )
}

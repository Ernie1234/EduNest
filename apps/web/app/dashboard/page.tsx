import Header from "@/components/header"
import { Nav } from "@/components/navbar"
import { Album, ArrowUpRight, Presentation } from "lucide-react"

export default function Page() {
  return (
    <div className="flex min-h-svh w-full flex-col">
      <Header />
      <Nav />
      <div className="min-h-svh w-full bg-accent p-5 dark:bg-primary-foreground">
        <div className="flex flex-col items-center justify-between gap-8 md:flex-row">
          <div className="">
            <h2 className="text-2xl font-semibold tracking-tight text-foreground">
              Hi, Nancy 👋🏾
            </h2>
            <p className="truncate text-sm text-muted-foreground">
              You have 5 tasks due today and 2 live classes starting soon
            </p>
          </div>
          <div className="flex space-x-3">
            <div className="flex cursor-pointer items-center gap-2.5 rounded-lg border border-border p-2 hover:bg-border">
              <span className="flex rounded-md bg-blue-500/20 p-2">
                <Presentation className="h-[18px] w-[18px] text-blue-500" />
              </span>

              <div className="flex flex-col">
                <p className="text-xs font-semibold tracking-tight text-foreground capitalize">
                  <span className="uppercase">cme 301</span> -{" "}
                  <span className="max-w-prose">Intro. to Comm</span>
                </p>
                <p className="truncate text-xs text-muted-foreground">
                  Starts in 3 hours
                </p>
              </div>
              <ArrowUpRight size={18} />
            </div>
            <div className="flex cursor-pointer items-center gap-2.5 rounded-lg border border-border p-2 hover:bg-border">
              <span className="flex rounded-md bg-blue-500/20 p-2">
                <Album className="h-[18px] w-[18px] text-blue-500" />
              </span>

              <div className="flex flex-col">
                <p className="text-xs font-semibold tracking-tight text-foreground capitalize">
                  <span className="uppercase">cme 301</span> -{" "}
                  <span className="max-w-prose">Intro. to Comm</span>
                </p>
                <p className="truncate text-xs text-muted-foreground">
                  Starts in 3 hours
                </p>
              </div>
              <ArrowUpRight size={18} />
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

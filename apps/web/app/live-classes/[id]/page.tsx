"use client"

import { useParams } from "next/navigation"
import Header from "@/components/header"
import { Nav } from "@/components/navbar"
import { useLiveClass } from "@/hooks/use-live-classes"
import { useCourseOffering } from "@/hooks/use-course-offering"
import { VideoPlaceholder } from "@/components/live-class/video-placeholder"
import { ChatPanel } from "@/components/live-class/chat-panel"
import { ModuleList } from "@/components/course/module-list"
import { AssessmentList } from "@/components/course/assessment-list"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@workspace/ui/components/tabs"

export default function LiveClassDetailPage() {
  const { id } = useParams<{ id: string }>()
  const { data: liveClass, isLoading, isError } = useLiveClass(id)
  const { detail, assessments } = useCourseOffering(liveClass?.courseOfferingId ?? "")

  return (
    <div className="flex min-h-svh w-full flex-col">
      <Header />
      <Nav />
      <div className="p-5">
        {isLoading && <p className="text-sm text-muted-foreground">Loading live class…</p>}
        {isError && <p className="text-sm text-destructive">Couldn&apos;t load this live class.</p>}

        {liveClass && (
          <div className="flex flex-col gap-4">
            <div>
              <p className="text-sm text-muted-foreground">
                Live classes / {liveClass.course.code} — {liveClass.course.title}
              </p>
              <h1 className="text-xl font-bold text-foreground">{liveClass.title}</h1>
            </div>

            <div className="grid grid-cols-1 gap-4 lg:grid-cols-[1fr_360px]">
              <div className="flex flex-col gap-4">
                <VideoPlaceholder title={liveClass.title} isLive={liveClass.status === "LIVE"} />

                <Tabs defaultValue="introduction">
                  <TabsList>
                    <TabsTrigger value="introduction">Introduction</TabsTrigger>
                    <TabsTrigger value="modules">Modules</TabsTrigger>
                    <TabsTrigger value="assignments">Assignments</TabsTrigger>
                    <TabsTrigger value="ai-summary">AI Summary</TabsTrigger>
                    <TabsTrigger value="transcription">Transcription</TabsTrigger>
                    <TabsTrigger value="textbooks">Recommended textbooks</TabsTrigger>
                  </TabsList>

                  <TabsContent value="introduction" className="mt-4">
                    <p className="text-sm text-foreground">
                      {liveClass.course.description ?? "No course description yet."}
                    </p>
                  </TabsContent>

                  <TabsContent value="modules" className="mt-4">
                    <ModuleList modules={detail.data?.modules ?? []} />
                  </TabsContent>

                  <TabsContent value="assignments" className="mt-4">
                    <AssessmentList
                      assessments={assessments.data ?? []}
                      emptyMessage="No assignments have been set for this course yet."
                    />
                  </TabsContent>

                  <TabsContent value="ai-summary" className="mt-4">
                    {liveClass.aiJobs
                      .filter((job) => job.type === "LIVE_CLASS_SUMMARY")
                      .map((job) => (
                        <p key={job.id} className="text-sm text-foreground">
                          {job.resultText ?? "Summary not ready yet."}
                        </p>
                      ))}
                    {!liveClass.aiJobs.some((job) => job.type === "LIVE_CLASS_SUMMARY") && (
                      <p className="text-sm text-muted-foreground">No AI summary yet.</p>
                    )}
                  </TabsContent>

                  <TabsContent value="transcription" className="mt-4">
                    {liveClass.aiJobs
                      .filter((job) => job.type === "LIVE_CLASS_TRANSCRIPTION")
                      .map((job) => (
                        <p key={job.id} className="text-sm whitespace-pre-wrap text-foreground">
                          {job.resultText ?? "Transcription not ready yet."}
                        </p>
                      ))}
                    {!liveClass.aiJobs.some((job) => job.type === "LIVE_CLASS_TRANSCRIPTION") && (
                      <p className="text-sm text-muted-foreground">No transcription yet.</p>
                    )}
                  </TabsContent>

                  <TabsContent value="textbooks" className="mt-4">
                    <p className="text-sm text-muted-foreground">
                      Recommended textbooks aren&apos;t available yet.
                    </p>
                  </TabsContent>
                </Tabs>
              </div>

              <div className="h-[600px] rounded-xl border border-border bg-card p-3">
                <ChatPanel chatRoomId={liveClass.chatRoomId} />
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

"use client"

import { useState } from "react"
import { useParams } from "next/navigation"
import { AssessmentWithGrade, CourseOfferingDetail } from "@workspace/types"
import Header from "@/components/header"
import { Nav } from "@/components/navbar"
import { useCourseOffering } from "@/hooks/use-course-offering"
import { CourseHeader } from "@/components/course/course-header"
import { ModuleList } from "@/components/course/module-list"
import { AssessmentList } from "@/components/course/assessment-list"
import { LecturerCard } from "@/components/course/lecturer-card"
import { NextLiveClassCard } from "@/components/course/next-live-class-card"
import { ResourceList } from "@/components/course/resource-list"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@workspace/ui/components/tabs"

export default function CourseOfferingDetailPage() {
  const { courseOfferingId } = useParams<{ courseOfferingId: string }>()
  const { detail, assessments } = useCourseOffering(courseOfferingId)

  return (
    <div className="flex min-h-svh w-full flex-col">
      <Header />
      <Nav />
      <div className="p-5">
        {detail.isLoading && <p className="text-sm text-muted-foreground">Loading course…</p>}
        {detail.isError && (
          <p className="text-sm text-destructive">Couldn&apos;t load this course.</p>
        )}
        {detail.data && (
          <CourseOfferingDetailView detail={detail.data} assessments={assessments.data ?? []} />
        )}
      </div>
    </div>
  )
}

function CourseOfferingDetailView({
  detail,
  assessments,
}: {
  detail: CourseOfferingDetail
  assessments: AssessmentWithGrade[]
}) {
  const [activeTab, setActiveTab] = useState("modules")
  const primaryInstructor = detail.instructors.find((i) => i.isPrimary) ?? detail.instructors[0]

  return (
    <div className="flex flex-col gap-5">
      <CourseHeader detail={detail} onContinueLearning={() => setActiveTab("modules")} />

      <div className="grid grid-cols-1 gap-5 lg:grid-cols-[1fr_320px]">
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList>
            <TabsTrigger value="modules">Modules</TabsTrigger>
            <TabsTrigger value="assignments">Assignments</TabsTrigger>
            <TabsTrigger value="past-questions">Past questions</TabsTrigger>
            <TabsTrigger value="resources">Resources</TabsTrigger>
            <TabsTrigger value="grades">Grades</TabsTrigger>
          </TabsList>

          <TabsContent value="modules" className="mt-4">
            <ModuleList modules={detail.modules} />
          </TabsContent>

          <TabsContent value="assignments" className="mt-4">
            <AssessmentList
              assessments={assessments}
              emptyMessage="No assignments have been set for this course yet."
            />
          </TabsContent>

          <TabsContent value="past-questions" className="mt-4">
            <p className="text-sm text-muted-foreground">
              Past questions aren&apos;t available yet.
            </p>
          </TabsContent>

          <TabsContent value="resources" className="mt-4">
            <ResourceList modules={detail.modules} />
          </TabsContent>

          <TabsContent value="grades" className="mt-4">
            <AssessmentList assessments={assessments} showGrades emptyMessage="No grades recorded yet." />
          </TabsContent>
        </Tabs>

        <div className="flex flex-col gap-4">
          {primaryInstructor && <LecturerCard instructor={primaryInstructor} />}
          <NextLiveClassCard liveClass={detail.nextLiveClass} />
        </div>
      </div>
    </div>
  )
}

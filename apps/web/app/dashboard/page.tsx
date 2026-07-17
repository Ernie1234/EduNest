"use client"

import Header from "@/components/header"
import { Nav } from "@/components/navbar"
import { useAuth } from "@/hooks/use-auth"
import { useDashboardSummary } from "@/hooks/use-dashboard-summary"
import { useMyCourses } from "@/hooks/use-my-courses"
import { useTimetable } from "@/hooks/use-timetable"
import { useAllAssessments } from "@/hooks/use-all-assessments"
import { StatCard } from "@/components/dashboard/stat-card"
import { TodaysScheduleCard } from "@/components/dashboard/todays-schedule-card"
import { PerformanceOverviewCard } from "@/components/dashboard/performance-overview-card"
import { AssignmentsPanel } from "@/components/dashboard/assignments-panel"
import { ContinueLearningList } from "@/components/dashboard/continue-learning-list"
import { AiChatPlaceholder } from "@/components/dashboard/ai-chat-placeholder"
import { BookOpen, CalendarCheck, ClipboardList, TrendingUp } from "lucide-react"

export default function DashboardPage() {
  const { user } = useAuth()
  const { data: stats } = useDashboardSummary()
  const { data: courses = [] } = useMyCourses()
  const { data: events = [] } = useTimetable({})
  const { assessments, isLoading: assessmentsLoading } = useAllAssessments(courses)

  const firstName = user?.name?.split(" ")[0] ?? "there"

  return (
    <div className="flex min-h-svh w-full flex-col">
      <Header />
      <Nav />
      <div className="flex flex-col gap-5 bg-accent p-5 dark:bg-primary-foreground">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-foreground">Hi, {firstName} 👋</h1>
          <p className="text-sm text-muted-foreground">
            {stats?.pendingAssignments ?? 0} pending assignment
            {stats?.pendingAssignments === 1 ? "" : "s"}
          </p>
        </div>

        <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
          <StatCard label="Total courses" value={stats?.totalCourses ?? "—"} icon={BookOpen} />
          <StatCard
            label="Pending assignments"
            value={stats?.pendingAssignments ?? "—"}
            icon={ClipboardList}
          />
          <StatCard
            label="Attendance rate"
            value={stats ? `${stats.attendanceRatePercent}%` : "—"}
            icon={CalendarCheck}
          />
          <StatCard
            label="Completed this week"
            value={stats?.completedThisWeek ?? "—"}
            icon={TrendingUp}
          />
        </div>

        <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
          <TodaysScheduleCard events={events} />
          <PerformanceOverviewCard courses={courses} />
          <AssignmentsPanel assessments={assessments} isLoading={assessmentsLoading} />
        </div>

        <div className="grid grid-cols-1 gap-4 lg:grid-cols-[1fr_320px]">
          <ContinueLearningList courses={courses} />
          <AiChatPlaceholder />
        </div>
      </div>
    </div>
  )
}

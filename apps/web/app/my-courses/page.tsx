"use client"

import Header from "@/components/header"
import { Nav } from "@/components/navbar"
import { useMyCourses } from "@/hooks/use-my-courses"
import { CourseCard } from "@/components/course/course-card"

export default function MyCoursesPage() {
  const { data: courses = [], isLoading, isError } = useMyCourses()

  return (
    <div className="flex min-h-svh w-full flex-col">
      <Header />
      <Nav />
      <div className="flex flex-col gap-4 p-5">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-foreground">My Courses</h1>
          <p className="text-sm text-muted-foreground">
            {courses.length} enrolled course{courses.length === 1 ? "" : "s"}
          </p>
        </div>

        {isLoading && <p className="text-sm text-muted-foreground">Loading your courses…</p>}
        {isError && <p className="text-sm text-destructive">Couldn&apos;t load your courses.</p>}
        {!isLoading && !isError && courses.length === 0 && (
          <p className="text-sm text-muted-foreground">You&apos;re not enrolled in any courses yet.</p>
        )}

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {courses.map((course) => (
            <CourseCard key={course.courseOfferingId} course={course} />
          ))}
        </div>
      </div>
    </div>
  )
}

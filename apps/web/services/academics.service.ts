import { apiClient } from "@/lib/api-client"
import {
  AssessmentWithGrade,
  CourseOfferingDetail,
  DashboardStats,
  EngageLessonInput,
  EnrolledCourseSummary,
} from "@workspace/types"

export const AcademicsService = {
  async getMyEnrollments(): Promise<EnrolledCourseSummary[]> {
    const { data } = await apiClient.get<EnrolledCourseSummary[]>("/academics/my-enrollments")
    return data
  },

  async getDashboardSummary(): Promise<DashboardStats> {
    const { data } = await apiClient.get<DashboardStats>("/academics/dashboard-summary")
    return data
  },

  async engageLesson(lessonId: string, input: EngageLessonInput): Promise<void> {
    await apiClient.post(`/academics/lessons/${lessonId}/engage`, input)
  },

  async getCourseOffering(courseOfferingId: string): Promise<CourseOfferingDetail> {
    const { data } = await apiClient.get<CourseOfferingDetail>(
      `/academics/course-offerings/${courseOfferingId}`
    )
    return data
  },

  async getAssessments(courseOfferingId: string): Promise<AssessmentWithGrade[]> {
    const { data } = await apiClient.get<AssessmentWithGrade[]>(
      `/academics/course-offerings/${courseOfferingId}/assessments`
    )
    return data
  },
}

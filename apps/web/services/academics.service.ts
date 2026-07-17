import { apiClient } from "@/lib/api-client"
import { AssessmentWithGrade, CourseOfferingDetail, EnrolledCourseSummary } from "@workspace/types"

export const AcademicsService = {
  async getMyEnrollments(): Promise<EnrolledCourseSummary[]> {
    const { data } = await apiClient.get<EnrolledCourseSummary[]>("/academics/my-enrollments")
    return data
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

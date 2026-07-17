export type UserRole = "STUDENT" | "TEACHER" | "ADMIN" | "SUPER_ADMIN" | "PARENT"

export interface GoogleProfileInput {
  googleId: string
  email: string
  name?: string
  image?: string
}

export interface AccessTokenPayload {
  sub: string
  email: string
  role: string
}

export interface SessionUser {
  id: string
  email: string
  role: UserRole
  name: string | null
  image: string | null
}

export interface HealthStatus {
  ok: boolean
}

export interface AuthState {
  user: SessionUser | null
  isLoading: boolean
  logout: () => Promise<void>
}

export interface Course {
  id: string
  code: string
  title: string
  progress: number
  totalLessons: number
  completedLessons: number
  status: "Active" | "Completed" | "Almost done"
  lecturer: string
}

// ===================== LIVE CLASSES =====================

export type LiveClassStatus = "SCHEDULED" | "LIVE" | "ENDED" | "CANCELLED"

export interface LiveClassSummary {
  id: string
  title: string
  status: LiveClassStatus
  scheduledStart: string
  scheduledEnd: string
  recordingUrl?: string
}

export interface LiveClassParticipantSummary {
  userId: string
  name: string
  image?: string
}

// ===================== ASSESSMENTS & SCORING =====================

export type AssignmentStatus = "Overdue" | "In progress" | "Completed" | "Cancelled"

export interface AssignmentListItem {
  id: string
  courseCode: string
  title: string
  dueAt: string
  status: AssignmentStatus
}

export interface PerformanceDataPoint {
  assessmentTitle: string
  score: number
  maxScore: number
}

// ===================== DASHBOARD OVERVIEW & CALENDAR =====================

export interface DashboardStats {
  totalCourses: number
  pendingAssignments: number
  attendanceRatePercent: number
  completedThisWeek: number
}

export type CalendarEventType =
  | "CLASS"
  | "EXAM"
  | "ASSIGNMENT_DEADLINE"
  | "MEETING"
  | "HOLIDAY"
  | "TERM"
  | "EXAM_WINDOW"
  | "OTHER"

export interface CalendarEventSummary {
  id: string
  title: string
  type: CalendarEventType
  startAt: string
  endAt: string
  courseOfferingId?: string | null
}

// ===================== ADMISSIONS =====================

export type AdmissionStatus =
  | "SUBMITTED"
  | "UNDER_REVIEW"
  | "ACCEPTED"
  | "REJECTED"
  | "WAITLISTED"

export interface AdmissionApplicationSummary {
  id: string
  applicantName: string
  status: AdmissionStatus
  submittedAt: string
}

// ===================== JOBS =====================

export type JobPostingStatus = "OPEN" | "CLOSED" | "DRAFT"

export interface JobPostingSummary {
  id: string
  title: string
  department?: string
  employmentType: string
  status: JobPostingStatus
}

// ===================== COMPLAINTS =====================

export type ComplaintStatus = "OPEN" | "IN_PROGRESS" | "RESOLVED" | "CLOSED"

export interface ComplaintSummary {
  id: string
  category: string
  subject: string
  status: ComplaintStatus
  createdAt: string
}

export interface CreateComplaintInput {
  category: string
  subject: string
  description: string
}

// ===================== AI JOBS =====================

export type AiJobType =
  | "LIVE_CLASS_SUMMARY"
  | "LIVE_CLASS_TRANSCRIPTION"
  | "TUTOR_CHAT"
  | "COURSE_RECOMMENDATION"
  | "ASSIGNMENT_FEEDBACK"

export type AiJobStatus = "PENDING" | "PROCESSING" | "COMPLETED" | "FAILED"

export interface AiJobSummary {
  id: string
  type: AiJobType
  status: AiJobStatus
  resultText?: string
}

// ===================== ANNOUNCEMENTS =====================

export interface AnnouncementSummary {
  id: string
  title: string
  body: string
  publishedAt: string
}

// ===================== COURSE OFFERING DETAIL =====================

export type LessonContentType = "VIDEO" | "DOCUMENT" | "LINK" | "TEXT"

export interface MediaSummary {
  id: string
  kind: "IMAGE" | "VIDEO" | "AUDIO" | "DOCUMENT"
  url: string
  mimeType: string
  durationSeconds?: number | null
}

export interface LessonDetail {
  id: string
  title: string
  contentType: LessonContentType
  order: number
  durationMinutes: number | null
  media: MediaSummary | null
  completed: boolean
}

export interface CourseModuleDetail {
  id: string
  title: string
  order: number
  lessons: LessonDetail[]
}

export interface CourseInstructorSummary {
  userId: string
  name: string | null
  image: string | null
  isPrimary: boolean
  title: string | null
  department: string | null
}

export interface ScoringSchemaComponentSummary {
  id: string
  name: string
  weightPercent: number
}

export interface ScoringSchemaSummary {
  id: string
  name: string
  isActive: boolean
  components: ScoringSchemaComponentSummary[]
}

export interface CourseOfferingDetail {
  id: string
  course: {
    id: string
    code: string
    title: string
    description: string | null
    creditUnits: number
    level: number | null
    department: { id: string; name: string; code: string }
  }
  academicSession: {
    id: string
    name: string
    semester: "FIRST" | "SECOND"
    startDate: string
    endDate: string
  }
  scoringSchema: ScoringSchemaSummary | null
  instructors: CourseInstructorSummary[]
  modules: CourseModuleDetail[]
  totalLessons: number
  completedLessons: number
  enrollmentStatus: "ACTIVE" | "DROPPED" | "COMPLETED" | null
  nextLiveClass: LiveClassSummary | null
}

// ===================== ASSESSMENTS WITH GRADE =====================

export type AssessmentType = "CAT" | "ASSIGNMENT" | "EXAM" | "QUIZ" | "PROJECT"

export interface AssessmentWithGrade {
  id: string
  courseOfferingId: string
  title: string
  type: AssessmentType
  maxScore: number
  weightPercent: number
  dueAt: string | null
  myGrade: number | null
}

// ===================== MY COURSES (ENROLLMENT SUMMARY) =====================

export interface EnrolledCourseSummary {
  courseOfferingId: string
  status: "ACTIVE" | "DROPPED" | "COMPLETED"
  course: {
    id: string
    code: string
    title: string
    department: { id: string; name: string; code: string }
  }
  totalLessons: number
  completedLessons: number
  instructorName: string | null
}

// ===================== LIVE CLASS DETAIL =====================

export interface LiveClassListItem {
  id: string
  title: string
  status: LiveClassStatus
  scheduledStart: string
  scheduledEnd: string
  courseOfferingId: string
  courseCode: string
  courseTitle: string
  hostName: string | null
}

export interface LiveClassDetail {
  id: string
  title: string
  status: LiveClassStatus
  scheduledStart: string
  scheduledEnd: string
  courseOfferingId: string
  course: {
    id: string
    code: string
    title: string
    description: string | null
    department: { id: string; name: string; code: string }
  }
  host: {
    id: string
    name: string | null
    image: string | null
    department: string | null
  }
  chatRoomId: string | null
  participants: LiveClassParticipantSummary[]
  aiJobs: AiJobSummary[]
}

// ===================== MESSAGING / CHAT =====================

/** Wire shape for both the REST message history endpoint and the
 * `message:new` WebSocket event. `isSelf` is intentionally not included here
 * since a single broadcast payload can't be "self" for every recipient —
 * compute it client-side by comparing senderId to the current session user. */
export interface ChatRoomMessage {
  id: string
  chatRoomId: string
  senderId: string
  senderName: string | null
  senderImage: string | null
  content: string | null
  createdAt: string
}

export interface SendMessageInput {
  content: string
}

// ===================== LESSON ENGAGEMENT =====================

export interface EngageLessonInput {
  secondsSpent: number
  completed?: boolean
}

// ===================== STREAK =====================

export interface StreakDayStatus {
  date: string
  active: boolean
}

export interface StreakMilestone {
  days: number
  label: string
  achieved: boolean
  daysToGo: number
}

export interface StreakSummary {
  currentStreak: number
  longestStreak: number
  totalStudyDays: number
  freezesLeftThisMonth: number
  thisWeek: StreakDayStatus[]
  milestones: StreakMilestone[]
}

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

export interface ChatMessage {
  id: string
  sender: string
  avatar?: string
  content: string
  timestamp: string
  isSelf: boolean
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
  | "OTHER"

export interface CalendarEventSummary {
  id: string
  title: string
  type: CalendarEventType
  startAt: string
  endAt: string
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

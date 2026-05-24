export type UserRole = "STUDENT" | "TEACHER" | "SUPER_ADMIN";

export interface GoogleProfileInput  {
  googleId: string;
  email: string;
  name?: string;
  image?: string;
};

export interface AccessTokenPayload  {
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
  id: string;
  code: string;
  title: string;
  progress: number;
  totalLessons: number;
  completedLessons: number;
  status: 'Active' | 'Completed' | 'Almost done';
  lecturer: string;
}

export interface ChatMessage {
  id: string;
  sender: string;
  avatar?: string;
  content: string;
  timestamp: string;
  isSelf: boolean;
}
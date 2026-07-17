import { CalendarEventType } from "@workspace/types"

export interface CalendarEventColor {
  bg: string
  border: string
  text: string
  dot: string
}

const COLORS: Record<CalendarEventType, CalendarEventColor> = {
  CLASS: {
    bg: "bg-blue-500/10",
    border: "border-blue-500",
    text: "text-blue-700 dark:text-blue-300",
    dot: "bg-blue-500",
  },
  EXAM: {
    bg: "bg-red-500/10",
    border: "border-red-500",
    text: "text-red-700 dark:text-red-300",
    dot: "bg-red-500",
  },
  EXAM_WINDOW: {
    bg: "bg-red-500/10",
    border: "border-red-500",
    text: "text-red-700 dark:text-red-300",
    dot: "bg-red-500",
  },
  ASSIGNMENT_DEADLINE: {
    bg: "bg-emerald-500/10",
    border: "border-emerald-500",
    text: "text-emerald-700 dark:text-emerald-300",
    dot: "bg-emerald-500",
  },
  HOLIDAY: {
    bg: "bg-purple-500/10",
    border: "border-purple-500",
    text: "text-purple-700 dark:text-purple-300",
    dot: "bg-purple-500",
  },
  TERM: {
    bg: "bg-purple-500/10",
    border: "border-purple-500",
    text: "text-purple-700 dark:text-purple-300",
    dot: "bg-purple-500",
  },
  MEETING: {
    bg: "bg-gray-500/10",
    border: "border-gray-500",
    text: "text-gray-700 dark:text-gray-300",
    dot: "bg-gray-500",
  },
  OTHER: {
    bg: "bg-gray-500/10",
    border: "border-gray-500",
    text: "text-gray-700 dark:text-gray-300",
    dot: "bg-gray-500",
  },
}

export function getCalendarEventColor(type: CalendarEventType): CalendarEventColor {
  return COLORS[type]
}

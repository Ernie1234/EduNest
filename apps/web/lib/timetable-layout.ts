export const TIMETABLE_START_HOUR = 7
export const TIMETABLE_END_HOUR = 18

function minutesFromWindowStart(date: Date): number {
  const windowStart = new Date(date)
  windowStart.setHours(TIMETABLE_START_HOUR, 0, 0, 0)
  const windowEnd = new Date(date)
  windowEnd.setHours(TIMETABLE_END_HOUR, 0, 0, 0)

  const clamped = Math.min(Math.max(date.getTime(), windowStart.getTime()), windowEnd.getTime())
  return (clamped - windowStart.getTime()) / 60_000
}

/** Percentage-based top/height for positioning an event within the fixed
 * TIMETABLE_START_HOUR-TIMETABLE_END_HOUR window, clamped to that window. */
export function getEventPositionPercent(startAt: string, endAt: string) {
  const totalMinutes = (TIMETABLE_END_HOUR - TIMETABLE_START_HOUR) * 60
  const startMinutes = minutesFromWindowStart(new Date(startAt))
  const endMinutes = minutesFromWindowStart(new Date(endAt))

  return {
    top: `${(startMinutes / totalMinutes) * 100}%`,
    height: `${Math.max(((endMinutes - startMinutes) / totalMinutes) * 100, 4)}%`,
  }
}

export function getHourLabels(): string[] {
  const labels: string[] = []
  for (let hour = TIMETABLE_START_HOUR; hour <= TIMETABLE_END_HOUR; hour += 2) {
    labels.push(`${String(hour).padStart(2, "0")}:00`)
  }
  return labels
}

export function getHourLabelOffsetPercent(label: string): number {
  const hour = Number.parseInt(label, 10)
  return ((hour - TIMETABLE_START_HOUR) / (TIMETABLE_END_HOUR - TIMETABLE_START_HOUR)) * 100
}

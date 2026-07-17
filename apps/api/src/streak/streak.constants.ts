/** Minutes of lesson engagement in a single day that, on their own, count the
 * day toward a study streak (engaging at least one lesson also counts, see
 * AcademicsService.engageLesson). */
export const STREAK_DAILY_MINUTES_THRESHOLD = 10;

/** Flat minutes credited to a day's StudyActivity when a student is marked
 * PRESENT at a live class, so attendance counts toward the streak alongside
 * lesson engagement. */
export const LIVE_CLASS_ATTENDANCE_CREDIT_MINUTES = 30;

/** How many gap days per calendar month can be auto-covered by a streak
 * freeze before the streak actually breaks. */
export const STREAK_FREEZE_MONTHLY_ALLOWANCE = 3;

export const STREAK_MILESTONES = [
  { days: 3, label: '3-day spark' },
  { days: 7, label: 'Consistent Scholar' },
  { days: 30, label: 'Unstoppable' },
] as const;

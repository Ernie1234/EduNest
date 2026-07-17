const DEFAULT_GRADIENT = "from-blue-600 to-blue-500"
const BANNER_GRADIENTS = [
  DEFAULT_GRADIENT,
  "from-emerald-600 to-emerald-500",
  "from-purple-600 to-purple-500",
  "from-orange-600 to-orange-500",
  "from-pink-600 to-pink-500",
  "from-cyan-600 to-cyan-500",
]

/** Picks a stable gradient for a course card banner based on its code, so the
 * same course always gets the same color without needing per-course config. */
export function getCourseBannerGradient(courseCode: string): string {
  let hash = 0
  for (let i = 0; i < courseCode.length; i++) {
    hash = (hash * 31 + courseCode.charCodeAt(i)) % BANNER_GRADIENTS.length
  }
  return BANNER_GRADIENTS[hash] ?? DEFAULT_GRADIENT
}

import Link from "next/link"
import { CourseInstructorSummary } from "@workspace/types"
import { Avatar, AvatarFallback, AvatarImage } from "@workspace/ui/components/avatar"
import { Button } from "@workspace/ui/components/button"
import { Card, CardContent, CardHeader, CardTitle } from "@workspace/ui/components/card"
import { MessageCircle } from "lucide-react"

interface LecturerCardProps {
  instructor: CourseInstructorSummary
}

function getInitials(name: string | null): string {
  if (!name) return "?"
  return name
    .split(" ")
    .map((part) => part[0])
    .slice(0, 2)
    .join("")
    .toUpperCase()
}

export function LecturerCard({ instructor }: LecturerCardProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Lecturer</CardTitle>
      </CardHeader>
      <CardContent className="flex flex-col gap-3">
        <div className="flex items-center gap-3">
          <Avatar size="lg">
            <AvatarImage src={instructor.image ?? undefined} alt={instructor.name ?? ""} />
            <AvatarFallback>{getInitials(instructor.name)}</AvatarFallback>
          </Avatar>
          <div>
            <p className="font-semibold text-foreground">{instructor.name ?? "Unknown"}</p>
            <p className="text-sm text-muted-foreground">
              {instructor.title ?? "Lecturer"}
              {instructor.department ? ` · ${instructor.department}` : ""}
            </p>
          </div>
        </div>
        <Button variant="outline" asChild>
          <Link href="/messages">
            <MessageCircle />
            Message lecturer
          </Link>
        </Button>
      </CardContent>
    </Card>
  )
}

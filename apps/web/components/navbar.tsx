"use client"

import React from "react"
import {
  LayoutDashboard,
  BookOpen,
  Calendar,
  MonitorPlay,
  Sparkles,
  Users,
  MessageSquare,
} from "lucide-react"
import { cn } from "@workspace/ui/lib/utils"
import { StreakButton } from "./streakBtn"
import { usePathname } from "next/navigation"
import Link from "next/link"

export const navItems = [
  { label: "Overview", icon: LayoutDashboard, href: "/dashboard" },
  { label: "My courses", icon: BookOpen, href: "/my-courses" },
  { label: "Timetable", icon: Calendar, href: "/timetable" },
  { label: "Live classes", icon: MonitorPlay, href: "/live-classes" },
  { label: "AI tutor", icon: Sparkles, href: "/ai-tutor" },
  { label: "Study group", icon: Users, href: "/study-groups" },
  {
    label: "Messages",
    icon: MessageSquare,
    href: "/messages",
    hasNotification: true,
  },
]

export const Nav = () => {
  const pathname = usePathname()

  return (
    <nav className="hidden border-b bg-background px-5 md:block">
      <div className="flex h-12 items-center justify-between gap-4">
        <div className="no-scrollbar flex items-center gap-1 overflow-x-auto py-1">
          {navItems.map((item) => {
            const isActive = pathname === item.href

            return (
              <Link
                key={item.label}
                href={item.href}
                className={cn(
                  "flex items-center gap-2 rounded-lg px-3 py-1.5 text-sm font-medium whitespace-nowrap transition-colors",
                  isActive
                    ? "bg-blue-600 text-white shadow-sm"
                    : "text-muted-foreground hover:bg-muted hover:text-foreground"
                )}
              >
                <div className="relative">
                  <item.icon size={16} />
                  {item.hasNotification && (
                    <span
                      className={cn(
                        "absolute -top-1 -right-1 h-2 w-2 rounded-full border-2 bg-red-500",
                        isActive ? "border-blue-600" : "border-background"
                      )}
                    />
                  )}
                </div>
                <span>{item.label}</span>
              </Link>
            )
          })}
        </div>

        <div className="flex items-center">
          <StreakButton />
        </div>
      </div>
    </nav>
  )
}

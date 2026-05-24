"use client"

import React from "react"
import {
  Settings,
  Bell,
  UserCircle,
  LayoutDashboard,
  LogOut,
  Flame,
  ChevronDown,
} from "lucide-react"
import { useAuth } from "@/hooks/use-auth"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@workspace/ui/components/dropdown-menu"
import {
  Avatar,
  AvatarFallback,
  AvatarImage,
} from "@workspace/ui/components/avatar"
import { Button } from "@workspace/ui/components/button"
import { Skeleton } from "@workspace/ui/components/skeleton"
import { Separator } from "@workspace/ui/components/separator"
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@workspace/ui/components/sheet"
import { ModeToggle } from "./modeToggle"
import { navItems } from "./navbar"
import { cn } from "@workspace/ui/lib/utils"
import { usePathname } from "next/navigation"
import Link from "next/link"

// Extracted outside to prevent recreating on every render
const ActionGroup = ({ isMobile = false }: { isMobile?: boolean }) => (
  <div
    className={cn(
      "flex",
      isMobile ? "w-full flex-col gap-2" : "items-center gap-1"
    )}
  >
    <Button
      variant="ghost"
      size={isMobile ? "default" : "icon"}
      className={cn(
        "h-9 rounded-lg border border-border text-muted-foreground hover:bg-muted",
        isMobile ? "w-full justify-start px-3" : "w-9"
      )}
    >
      <Settings className="h-[18px] w-[18px]" />
      {isMobile && <span className="ml-2 text-sm">Settings</span>}
    </Button>
    <Button
      variant="ghost"
      size={isMobile ? "default" : "icon"}
      className={cn(
        "relative h-9 rounded-lg border border-border text-muted-foreground hover:bg-muted",
        isMobile ? "w-full justify-start px-3" : "w-9"
      )}
    >
      <Bell className="h-[18px] w-[18px]" />
      <span className="absolute top-2.5 right-2.5 h-1.5 w-1.5 rounded-full bg-orange-500 ring-2 ring-background" />
      {isMobile && <span className="ml-2 text-sm">Notifications</span>}
    </Button>
    <div
      className={
        isMobile
          ? "flex items-center justify-between rounded-lg border bg-muted/20 p-1 px-2"
          : ""
      }
    >
      {isMobile && <span className="ml-1 text-xs font-medium">Theme</span>}
      <ModeToggle />
    </div>
  </div>
)

const UserProfileMenu = () => {
  const pathname = usePathname()
  const { user, isLoading, logout } = useAuth()

  if (isLoading) {
    return <Skeleton className="h-9 w-32 rounded-xl" />
  }

  return (
    <div className="flex items-center gap-2 md:gap-4">
      {/* Desktop Group */}
      <div className="hidden items-center gap-4 md:flex">
        <ActionGroup />
        <Separator orientation="vertical" />
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <button className="group flex items-center gap-2.5 rounded-xl border border-border p-1 pr-2 transition-all hover:bg-muted/50 focus:outline-none">
              <Avatar className="h-8 w-8 rounded-lg border shadow-sm">
                <AvatarImage src={user?.image ?? ""} className="object-cover" />
                <AvatarFallback className="rounded-lg bg-primary/5 text-[10px] font-bold">
                  {user?.name?.slice(0, 2).toUpperCase() ?? "UN"}
                </AvatarFallback>
              </Avatar>
              <div className="flex flex-col items-start text-left">
                <span className="text-xs leading-none font-bold">
                  {user?.name}
                </span>
                <span className="mt-1 text-[10px] text-muted-foreground uppercase">
                  {user?.role}
                </span>
              </div>
              <ChevronDown className="h-3.5 w-3.5 text-muted-foreground/50 transition-transform group-data-[state=open]:rotate-180" />
            </button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="mt-2 w-52 rounded-xl">
            <DropdownMenuLabel>My Account</DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem className="cursor-pointer">
              <UserCircle className="mr-2 h-4 w-4" /> Profile
            </DropdownMenuItem>
            <DropdownMenuItem className="cursor-pointer">
              <LayoutDashboard className="mr-2 h-4 w-4" /> Dashboard
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem
              onClick={() => logout()}
              className="font-medium text-destructive"
            >
              <LogOut className="mr-2 h-4 w-4" /> Logout
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      {/* Mobile Group */}
      <div className="md:hidden">
        <Sheet>
          <SheetTrigger asChild>
            <Button
              variant="ghost"
              size="icon"
              className="h-9 w-9 rounded-full border p-0"
            >
              <Avatar className="h-7 w-7 rounded-full">
                <AvatarImage src={user?.image ?? ""} />
                <AvatarFallback>{user?.name?.charAt(0)}</AvatarFallback>
              </Avatar>
            </Button>
          </SheetTrigger>
          <SheetContent
            side="right"
            className="flex w-[300px] flex-col p-0 sm:w-[350px]"
          >
            <SheetHeader className="border-b p-6 text-left">
              <SheetTitle className="flex items-center gap-3">
                <Avatar className="h-10 w-10 rounded-lg border">
                  <AvatarImage src={user?.image ?? ""} />
                  <AvatarFallback>{user?.name?.charAt(0)}</AvatarFallback>
                </Avatar>
                <div className="flex flex-col">
                  <span className="text-sm leading-none font-bold">
                    {user?.name}
                  </span>
                  <span className="mt-1 text-xs text-muted-foreground">
                    {user?.email}
                  </span>
                </div>
              </SheetTitle>
            </SheetHeader>

            <div className="flex-1 space-y-8 overflow-y-auto px-6 py-4">
              {/* Stats Section */}
              <div className="space-y-3">
                <h4 className="text-[10px] font-bold tracking-widest text-muted-foreground uppercase">
                  Your Progress
                </h4>
                <div className="flex items-center gap-3 rounded-xl border border-orange-100 bg-orange-50/50 p-3">
                  <div className="flex h-9 w-9 items-center justify-center rounded-full bg-orange-100">
                    <Flame
                      size={20}
                      className="fill-orange-600 text-orange-600"
                    />
                  </div>
                  <div className="flex flex-col">
                    <span className="text-sm font-bold text-orange-900">
                      2 day streak
                    </span>
                    <span className="text-[10px] text-orange-700/70 italic">
                      Don&apos;t break the chain! {/* Fixed apostrophe */}
                    </span>
                  </div>
                </div>
              </div>

              {/* Navigation Section */}
              <div className="space-y-1">
                <h4 className="mb-3 text-[10px] font-bold tracking-widest text-muted-foreground uppercase">
                  Navigation
                </h4>
                <div className="grid gap-1">
                  {navItems.map((item) => {
                    const isActive = pathname === item.href

                    return (
                      <Link key={item.label} href={item.href} passHref>
                        <Button
                          variant={isActive ? "secondary" : "ghost"}
                          className={cn(
                            "h-11 w-full justify-start gap-3 rounded-lg px-3",
                            isActive &&
                              "bg-blue-500 text-foreground hover:bg-blue-400"
                          )}
                        >
                          <div className="relative">
                            <item.icon
                              size={18}
                              className={
                                isActive
                                  ? "text-foreground"
                                  : "text-muted-foreground"
                              }
                            />
                            {item.hasNotification && (
                              <span className="absolute -top-1 -right-1 h-2 w-2 rounded-full border-2 border-white bg-red-500" />
                            )}
                          </div>
                          <span className="text-sm font-medium">
                            {item.label}
                          </span>
                        </Button>
                      </Link>
                    )
                  })}
                </div>
              </div>

              {/* Actions Section */}
              <div className="space-y-3">
                <h4 className="text-[10px] font-bold tracking-widest text-muted-foreground uppercase">
                  Quick Actions
                </h4>
                <ActionGroup isMobile />
              </div>
            </div>

            <div className="mt-auto border-t p-6">
              <Button
                variant="destructive"
                className="h-11 w-full gap-2 rounded-xl"
                onClick={() => logout()}
              >
                <LogOut className="h-4 w-4" /> Log out
              </Button>
            </div>
          </SheetContent>
        </Sheet>
      </div>
    </div>
  )
}

export default UserProfileMenu
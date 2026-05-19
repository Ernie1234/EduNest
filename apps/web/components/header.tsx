"use client"

import Logo from "@/components/logo"
import UserProfileMenu from "@/components/userProfileMenu"
import { Button } from "@workspace/ui/components/button"
import { Input } from "@workspace/ui/components/input"
import { BiSearchAlt } from "react-icons/bi"

const Header = () => {
  return (
    <header className="border-b bg-background px-5 py-2.5">
      <div className="flex items-center justify-between gap-8">
        {/* Left side: Logo & Search */}
        <div className="flex flex-1 items-center gap-3">
          <div className="flex items-center gap-2">
            <Logo />
            <h1 className="text-xl font-bold tracking-tight text-foreground">
              EduNest
            </h1>
          </div>

          {/* Search Section */}
          <div className="flex flex-1 items-center justify-end md:justify-start">
            {/* 1. Desktop Search: Visible from 'md' (768px) and up */}
            <div className="relative hidden w-full max-w-sm md:block">
              <BiSearchAlt className="absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-muted-foreground/60" />
              <Input
                placeholder="Search courses, study groups..."
                className="h-9 rounded-full border-border bg-muted/40 pl-10 transition-all focus-visible:bg-muted/60 focus-visible:ring-1 focus-visible:ring-primary/20"
              />
            </div>

            {/* 2. Mobile Search: Visible only on small screens, hidden from 'md' up */}
            <Button
              variant="ghost"
              size="icon"
              className="h-9 w-9 rounded-full text-muted-foreground hover:bg-muted md:hidden"
            >
              <BiSearchAlt className="h-8 w-8" />
              <span className="sr-only">Search</span>
            </Button>
          </div>
        </div>

        {/* Right side: Everything handled by UserProfileMenu */}
        <div className="flex items-center">
          <UserProfileMenu />
        </div>
      </div>
    </header>
  )
}

export default Header

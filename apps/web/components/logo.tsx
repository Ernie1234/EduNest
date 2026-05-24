import { cn } from "@workspace/ui/lib/utils"
import Image from "next/image"
import React from "react"

interface LogoProps {
  src?: string
  alt?: string
  width?: number
  height?: number
  imgClassName?: string
}

function Logo({
  src = "/assets/book.png",
  alt = "logo",
  width = 24,
  height = 24,
  imgClassName,
}: LogoProps) {
  return (
    <Image
      src={src}
      alt={alt}
      width={width}
      height={height}
      className={cn("h-auto object-contain", imgClassName)}
      priority
    />
  )
}

export default Logo

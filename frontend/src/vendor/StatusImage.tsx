
interface StatusImageProps {
  src: string
  alt: string
  isOnline?: boolean
  size?: "sm" | "md" | "lg" | "xl"
  className?: string
}

export default function StatusImage({ src, alt, isOnline = false, size = "md", className }: StatusImageProps) {
  const sizeClasses = {
    sm: "w-12 h-12",
    md: "w-16 h-16 sm:w-20 sm:h-20",
    lg: "w-20 h-20 sm:w-24 sm:h-24 md:w-28 md:h-28",
    xl: "w-24 h-24 sm:w-32 sm:h-32 md:w-40 md:h-40",
  }

  const statusSizeClasses = {
    sm: "w-3 h-3",
    md: "w-4 h-4 sm:w-5 sm:h-5",
    lg: "w-5 h-5 sm:w-6 sm:h-6",
    xl: "w-6 h-6 sm:w-7 sm:h-7",
  }

  return (
    <div className={cn("relative inline-block", className)}>
      <div className={cn("relative overflow-hidden rounded-full border-2 border-white shadow-lg", sizeClasses[size])}>
        <Image
          src={src || "/placeholder.svg"}
          alt={alt}
          fill
          className="object-cover"
          sizes="(max-width: 640px) 80px, (max-width: 768px) 112px, 160px"
        />
      </div>

      {/* Status indicator */}
      <div
        className={cn(
          "absolute bottom-0 right-0 rounded-full border-2 border-white shadow-md",
          statusSizeClasses[size],
          isOnline ? "bg-green-500" : "bg-gray-400",
        )}
      >
        <div className={cn("w-full h-full rounded-full", isOnline && "animate-pulse bg-green-400")} />
      </div>
    </div>
  )
}

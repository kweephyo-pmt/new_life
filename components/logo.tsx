import Image from "next/image"

export function Logo({ className = "w-8 h-8" }: { className?: string }) {
  return (
    <Image
      src="/NewLifeLOGO.png"
      alt="New Life Logo"
      width={32}
      height={32}
      className={className}
      priority
    />
  )
}

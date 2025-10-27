'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { cn } from '@/lib/utils'
import { Plane, Compass, Users, UserCircle, Sparkles } from 'lucide-react'

const navItems = [
  {
    title: 'My Trips',
    href: '/trips',
    icon: Plane,
  },
  {
    title: 'Explore',
    href: '/explore',
    icon: Sparkles,
  },
  {
    title: 'Discover',
    href: '/discover',
    icon: Compass,
  },
  {
    title: 'Community',
    href: '/community',
    icon: Users,
  },
  {
    title: 'Profile',
    href: '/profile',
    icon: UserCircle,
  },
]

export function MainNav() {
  const pathname = usePathname()

  return (
    <nav className="flex items-center gap-1">
      {navItems.map((item) => {
        const isActive = pathname === item.href || pathname?.startsWith(`${item.href}/`)
        const Icon = item.icon

        return (
          <Link
            key={item.href}
            href={item.href}
            className={cn(
              'flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200',
              isActive
                ? 'bg-primary text-primary-foreground shadow-sm'
                : 'text-muted-foreground hover:text-foreground hover:bg-primary/10'
            )}
          >
            <Icon className="w-4 h-4" />
            <span className="hidden sm:inline">{item.title}</span>
          </Link>
        )
      })}
    </nav>
  )
}

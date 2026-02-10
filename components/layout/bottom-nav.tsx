'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { Home, Heart, FileText, BookOpen, Sparkles } from 'lucide-react'
import { cn } from '@/lib/utils'

const navItems = [
  {
    href: '/dashboard',
    label: 'ホーム',
    icon: Home,
  },
  {
    href: '/state',
    label: '状態',
    icon: Heart,
  },
  {
    href: '/logs',
    label: 'ログ',
    icon: FileText,
  },
  {
    href: '/rules',
    label: 'ルール',
    icon: BookOpen,
  },
  {
    href: '/future',
    label: '未来',
    icon: Sparkles,
  },
]

export function BottomNav() {
  const pathname = usePathname()

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 border-t bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="flex h-16 items-center justify-around px-2">
        {navItems.map((item) => {
          const isActive = pathname === item.href
          const Icon = item.icon

          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex flex-col items-center justify-center gap-1 px-3 py-2 text-xs font-medium transition-colors",
                isActive
                  ? "text-primary"
                  : "text-muted-foreground hover:text-foreground"
              )}
            >
              <Icon className={cn("h-5 w-5", isActive && "fill-primary/20")} />
              <span>{item.label}</span>
            </Link>
          )
        })}
      </div>
    </nav>
  )
}

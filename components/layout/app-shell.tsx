'use client'

import { Settings } from 'lucide-react'
import Link from 'next/link'
import { BottomNav } from './bottom-nav'
import { Button } from '@/components/ui/button'

interface AppShellProps {
  children: React.ReactNode
  title?: string
}

export function AppShell({ children, title = 'Ami-ru' }: AppShellProps) {
  return (
    <div className="flex min-h-screen flex-col bg-background">
      {/* Header */}
      <header className="sticky top-0 z-40 border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="flex h-16 items-center justify-between px-4">
          <h1 className="text-xl font-bold text-primary">{title}</h1>
          <Link href="/settings">
            <Button variant="ghost" size="icon">
              <Settings className="h-5 w-5" />
            </Button>
          </Link>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 pb-20">
        <div className="container mx-auto max-w-2xl px-4 py-6">
          {children}
        </div>
      </main>

      {/* Bottom Navigation */}
      <BottomNav />
    </div>
  )
}

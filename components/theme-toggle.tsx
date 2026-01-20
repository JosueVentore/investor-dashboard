'use client'

import { useTheme } from 'next-themes'
import { Moon, Sun } from 'lucide-react'
import { useEffect, useState } from 'react'
import { cn } from '@/lib/cn'

export function ThemeToggle({ className }: { className?: string }) {
  const { setTheme, resolvedTheme } = useTheme()
  const [mounted, setMounted] = useState(false)

  useEffect(() => setMounted(true), [])

  const current = resolvedTheme ?? 'light'

  return (
    <button
      type="button"
      onClick={() => setTheme(current === 'dark' ? 'light' : 'dark')}
      className={cn(
        'inline-flex items-center gap-2 rounded-md border px-3 py-2 text-sm hover:bg-black/5 dark:hover:bg-white/10',
        className
      )}
      aria-label="Toggle theme"
    >
      {mounted && current === 'dark' ? (
        <Moon className="h-4 w-4" />
      ) : (
        <Sun className="h-4 w-4" />
      )}
      <span className="hidden sm:block">{mounted ? (current === 'dark' ? 'Dark' : 'Light') : 'Theme'}</span>
    </button>
  )
}

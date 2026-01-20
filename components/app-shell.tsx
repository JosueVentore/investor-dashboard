import Image from 'next/image'
import Link from 'next/link'
import { ThemeToggle } from '@/components/theme-toggle'

const nav = [
  { href: '/', label: 'Dashboard' },
  { href: '/investors', label: 'Investors' },
  { href: '/projects', label: 'Projects' },
  { href: '/pipeline', label: 'Pipeline' },
  { href: '/activity', label: 'Activity & Notes' },
  { href: '/quality', label: 'Data Quality' },
  { href: '/raw', label: 'Raw Data' }
]

export function AppShell({
  children
}: {
  children: React.ReactNode
}) {
  return (
    <div className="min-h-screen">
      <header className="sticky top-0 z-50 border-b bg-background/80 backdrop-blur">
        <div className="mx-auto flex max-w-7xl items-center justify-between gap-4 px-4 py-3">
          <div className="flex items-center gap-3">
            <Link href="/" className="flex items-center gap-2">
              <Image src="/logo.png" alt="Ventore" width={28} height={28} className="rounded" />
              <span className="text-sm font-semibold tracking-tight">Ventore Investor Dashboard</span>
            </Link>
          </div>

          <nav className="hidden gap-1 lg:flex">
            {nav.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className="rounded-md px-3 py-2 text-sm hover:bg-black/5 dark:hover:bg-white/10"
              >
                {item.label}
              </Link>
            ))}
          </nav>

          <div className="flex items-center gap-2">
            <ThemeToggle />
          </div>
        </div>
        <div className="border-t lg:hidden">
          <div className="mx-auto flex max-w-7xl flex-wrap items-center gap-1 px-4 py-2">
            {nav.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className="rounded-md px-3 py-2 text-xs hover:bg-black/5 dark:hover:bg-white/10"
              >
                {item.label}
              </Link>
            ))}
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-7xl px-4 py-6">{children}</main>

      <footer className="border-t">
        <div className="mx-auto max-w-7xl px-4 py-6 text-xs opacity-70">
          Data is fetched server-side from published CSVs with a 5-minute cache. Verify results against the Raw Data page.
        </div>
      </footer>
    </div>
  )
}

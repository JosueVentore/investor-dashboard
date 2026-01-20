import { cn } from '@/lib/cn'

export function Card({
  children,
  className
}: {
  children: React.ReactNode
  className?: string
}) {
  return <div className={cn('rounded-xl border bg-background p-4 shadow-sm', className)}>{children}</div>
}

export function CardTitle({ children }: { children: React.ReactNode }) {
  return <div className="text-sm font-medium opacity-80">{children}</div>
}

export function CardValue({ children }: { children: React.ReactNode }) {
  return <div className="mt-2 text-2xl font-semibold tracking-tight">{children}</div>
}

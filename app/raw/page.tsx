import Link from 'next/link'
import { Card } from '@/components/card'
import { RawTable } from '@/components/raw/raw-table'
import { CSV_SOURCES } from '@/lib/constants'
import { fetchCsv } from '@/lib/csv'

const TABS = [
  { key: 'master', label: 'Master Investor List' },
  { key: 'rune', label: 'RUNE Cap Table' },
  { key: 'aria', label: 'ARIA Cap Table' },
  { key: 'polarity', label: 'Polarity Cap Table' },
  { key: 'compliance', label: 'Compliance Database' }
] as const

export default async function RawPage({
  searchParams
}: {
  searchParams?: { tab?: string }
}) {
  const tab = (searchParams?.tab as keyof typeof CSV_SOURCES) || 'master'
  const source = CSV_SOURCES[tab] ?? CSV_SOURCES.master

  const { rows, fetchedAt } = await fetchCsv(source.url)

  return (
    <div className="space-y-4">
      <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Raw Data Inspector</h1>
          <p className="mt-1 text-sm opacity-70">
            Tab: <span className="font-medium">{source.name}</span> · last fetched{' '}
            {new Date(fetchedAt).toLocaleString()}
          </p>
        </div>
        <div className="flex gap-2">
          <Link href="/" className="rounded-md border px-3 py-2 text-sm hover:bg-black/5 dark:hover:bg-white/10">
            Dashboard
          </Link>
          <Link href="/quality" className="rounded-md border px-3 py-2 text-sm hover:bg-black/5 dark:hover:bg-white/10">
            Data Quality
          </Link>
        </div>
      </div>

      <Card>
        <div className="flex flex-wrap gap-2">
          {TABS.map((t) => (
            <Link
              key={t.key}
              href={`/raw?tab=${t.key}`}
              className={`rounded-md border px-3 py-2 text-sm hover:bg-black/5 dark:hover:bg-white/10 ${
                t.key === tab ? 'bg-black/5 dark:bg-white/10' : ''
              }`}
            >
              {t.label}
            </Link>
          ))}
        </div>

        <div className="mt-4">
          <RawTable rows={rows} />
        </div>
      </Card>
    </div>
  )
}

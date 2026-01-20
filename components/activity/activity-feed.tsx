'use client'

import { useMemo, useState } from 'react'

export type ActivityItem = {
  id: string
  source: 'cap-table' | 'compliance'
  project: string
  investor: string
  text: string
}

export function ActivityFeed({ items }: { items: ActivityItem[] }) {
  const [q, setQ] = useState('')

  const filtered = useMemo(() => {
    const s = q.trim().toLowerCase()
    if (!s) return items
    return items.filter((i) => `${i.project} ${i.investor} ${i.text}`.toLowerCase().includes(s))
  }, [q, items])

  return (
    <div className="space-y-3">
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <input
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder="Search notes, next steps, investors…"
          className="w-full rounded-md border bg-background px-3 py-2 text-sm sm:max-w-md"
        />
        <div className="text-xs opacity-70">{filtered.length} shown</div>
      </div>

      <div className="divide-y rounded-xl border">
        {filtered.length ? (
          filtered.map((i) => (
            <div key={i.id} className="p-4">
              <div className="flex flex-wrap items-baseline justify-between gap-2">
                <div className="text-sm font-medium">{i.investor}</div>
                <div className="text-xs opacity-60">
                  {i.project} · {i.source}
                </div>
              </div>
              <div className="mt-2 whitespace-pre-wrap text-sm opacity-90">{i.text}</div>
            </div>
          ))
        ) : (
          <div className="p-4 text-sm opacity-70">No matching items.</div>
        )}
      </div>
    </div>
  )
}

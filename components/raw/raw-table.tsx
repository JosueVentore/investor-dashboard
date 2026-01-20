'use client'

import { useMemo, useState } from 'react'

export function RawTable({ rows }: { rows: Record<string, string>[] }) {
  const [q, setQ] = useState('')
  const headers = useMemo(() => {
    const set = new Set<string>()
    for (const r of rows) for (const k of Object.keys(r)) set.add(k)
    return [...set]
  }, [rows])

  const filtered = useMemo(() => {
    const s = q.trim().toLowerCase()
    if (!s) return rows
    return rows.filter((r) => Object.values(r).some((v) => (v ?? '').toLowerCase().includes(s)))
  }, [q, rows])

  return (
    <div className="space-y-3">
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <input
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder="Filter rows…"
          className="w-full rounded-md border bg-background px-3 py-2 text-sm sm:max-w-md"
        />
        <div className="text-xs opacity-70">{filtered.length} rows</div>
      </div>

      <div className="overflow-auto rounded-xl border" style={{ maxHeight: 600 }}>
        <table className="min-w-full text-sm">
          <thead className="sticky top-0 bg-black/5 text-left text-xs dark:bg-white/10">
            <tr>
              {headers.map((h) => (
                <th key={h} className="whitespace-nowrap px-3 py-2">
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {filtered.map((r, idx) => (
              <tr key={idx} className="border-t">
                {headers.map((h) => (
                  <td key={h} className="whitespace-nowrap px-3 py-2">
                    {r[h] || '—'}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}

'use client'

import Link from 'next/link'
import { useMemo, useState } from 'react'

export type InvestorListRow = {
  id: string
  displayName: string
  legalName: string
  knownName: string
  projects: string
}

export function InvestorList({ rows }: { rows: InvestorListRow[] }) {
  const [q, setQ] = useState('')

  const filtered = useMemo(() => {
    const s = q.trim().toLowerCase()
    if (!s) return rows
    return rows.filter((r) =>
      [r.displayName, r.legalName, r.knownName, r.projects].some((f) => f.toLowerCase().includes(s))
    )
  }, [q, rows])

  return (
    <div className="space-y-3">
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <input
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder="Search investors, names, projects…"
          className="w-full rounded-md border bg-background px-3 py-2 text-sm sm:max-w-md"
        />
        <div className="text-xs opacity-70">{filtered.length} shown</div>
      </div>

      <div className="overflow-x-auto rounded-xl border">
        <table className="min-w-full text-sm">
          <thead className="bg-black/5 text-left text-xs dark:bg-white/10">
            <tr>
              <th className="px-3 py-2">Investor</th>
              <th className="px-3 py-2">Known name</th>
              <th className="px-3 py-2">Legal name</th>
              <th className="px-3 py-2">Projects (parsed)</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map((r) => (
              <tr key={r.id} className="border-t">
                <td className="px-3 py-2 font-medium">
                  <Link className="underline-offset-2 hover:underline" href={`/investors/${encodeURIComponent(r.id)}`}>
                    {r.displayName}
                  </Link>
                </td>
                <td className="px-3 py-2">{r.knownName || '—'}</td>
                <td className="px-3 py-2">{r.legalName || '—'}</td>
                <td className="px-3 py-2">{r.projects || '—'}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}

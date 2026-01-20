'use client'

import { useMemo, useState } from 'react'
import { SimpleBar } from '@/components/charts/simple-bar'

export type ProjectRow = {
  project: string
  stages: { stage: string; investors: number; entries: number }[]
  totalInvestors: number
  totalEntries: number
}

export function ProjectList({ rows }: { rows: ProjectRow[] }) {
  const [q, setQ] = useState('')
  const [selected, setSelected] = useState(rows[0]?.project ?? '')

  const filtered = useMemo(() => {
    const s = q.trim().toLowerCase()
    if (!s) return rows
    return rows.filter((r) => r.project.toLowerCase().includes(s))
  }, [q, rows])

  const current = rows.find((r) => r.project === selected) ?? rows[0]

  const chartData = (current?.stages ?? []).map((s) => ({ name: s.stage, value: s.investors }))

  return (
    <div className="grid gap-4 lg:grid-cols-2">
      <div className="space-y-3">
        <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
          <input
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Search projects…"
            className="w-full rounded-md border bg-background px-3 py-2 text-sm sm:max-w-md"
          />
          <div className="text-xs opacity-70">{filtered.length} shown</div>
        </div>

        <div className="overflow-x-auto rounded-xl border">
          <table className="min-w-full text-sm">
            <thead className="bg-black/5 text-left text-xs dark:bg-white/10">
              <tr>
                <th className="px-3 py-2">Project</th>
                <th className="px-3 py-2">Investors</th>
                <th className="px-3 py-2">Cap entries</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((r) => (
                <tr
                  key={r.project}
                  className="border-t hover:bg-black/5 dark:hover:bg-white/10"
                  onClick={() => setSelected(r.project)}
                  style={{ cursor: 'pointer' }}
                >
                  <td className="px-3 py-2 font-medium">{r.project}</td>
                  <td className="px-3 py-2">{r.totalInvestors}</td>
                  <td className="px-3 py-2">{r.totalEntries}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <div className="rounded-xl border p-4">
        <div className="flex flex-col gap-1">
          <div className="text-sm font-medium opacity-80">{current?.project ?? 'Project'}</div>
          <div className="text-xs opacity-70">Investors by stage (from master list parsing)</div>
        </div>
        <div className="mt-4">
          <SimpleBar data={chartData} />
        </div>
        <div className="mt-4 overflow-x-auto rounded-lg border">
          <table className="min-w-full text-sm">
            <thead className="bg-black/5 text-left text-xs dark:bg-white/10">
              <tr>
                <th className="px-3 py-2">Stage</th>
                <th className="px-3 py-2">Investors</th>
                <th className="px-3 py-2">Cap entries</th>
              </tr>
            </thead>
            <tbody>
              {(current?.stages ?? []).map((s) => (
                <tr key={s.stage} className="border-t">
                  <td className="px-3 py-2 font-medium">{s.stage}</td>
                  <td className="px-3 py-2">{s.investors}</td>
                  <td className="px-3 py-2">{s.entries}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}

import Link from 'next/link'
import { Card } from '@/components/card'
import { buildDataModel } from '@/lib/model'

export default async function QualityPage() {
  const model = await buildDataModel()

  const bySeverity = {
    high: model.issues.filter((i) => i.severity === 'high'),
    medium: model.issues.filter((i) => i.severity === 'medium'),
    low: model.issues.filter((i) => i.severity === 'low')
  }

  return (
    <div className="space-y-4">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Data Quality / Exceptions</h1>
          <p className="mt-1 text-sm opacity-70">
            Automated checks to catch common issues: missing identifiers, unexpected stage labels, and broken references across tabs.
          </p>
        </div>
        <Link href="/raw" className="rounded-md border px-3 py-2 text-sm hover:bg-black/5 dark:hover:bg-white/10">
          Open Raw Data
        </Link>
      </div>

      <div className="grid gap-4 lg:grid-cols-3">
        <Card>
          <div className="text-sm font-medium opacity-80">High</div>
          <div className="mt-2 text-2xl font-semibold tracking-tight">{bySeverity.high.length}</div>
        </Card>
        <Card>
          <div className="text-sm font-medium opacity-80">Medium</div>
          <div className="mt-2 text-2xl font-semibold tracking-tight">{bySeverity.medium.length}</div>
        </Card>
        <Card>
          <div className="text-sm font-medium opacity-80">Low</div>
          <div className="mt-2 text-2xl font-semibold tracking-tight">{bySeverity.low.length}</div>
        </Card>
      </div>

      <Card>
        <div className="text-sm font-medium opacity-80">All issues</div>
        <div className="mt-3 overflow-x-auto rounded-lg border">
          <table className="min-w-full text-sm">
            <thead className="bg-black/5 text-left text-xs dark:bg-white/10">
              <tr>
                <th className="px-3 py-2">Severity</th>
                <th className="px-3 py-2">Kind</th>
                <th className="px-3 py-2">Message</th>
                <th className="px-3 py-2">Ref</th>
              </tr>
            </thead>
            <tbody>
              {model.issues.length ? (
                model.issues.map((i, idx) => (
                  <tr key={idx} className="border-t">
                    <td className="px-3 py-2 font-medium">{i.severity}</td>
                    <td className="px-3 py-2">{i.kind}</td>
                    <td className="px-3 py-2">{i.message}</td>
                    <td className="px-3 py-2">{i.ref ?? '—'}</td>
                  </tr>
                ))
              ) : (
                <tr className="border-t">
                  <td className="px-3 py-2" colSpan={4}>
                    No issues detected.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        <div className="mt-3 text-xs opacity-70">
          Tip: if an issue is caused by a renamed column in the spreadsheet, update the candidate header list in <code className="rounded bg-black/5 px-1 dark:bg-white/10">lib/model.ts</code> and redeploy.
        </div>
      </Card>
    </div>
  )
}

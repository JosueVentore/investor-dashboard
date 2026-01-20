import { Card } from '@/components/card'
import { SimpleBar } from '@/components/charts/simple-bar'
import { buildDataModel } from '@/lib/model'

export default async function PipelinePage() {
  const model = await buildDataModel()

  const statusCounts = new Map<string, number>()
  for (const e of model.capTable) {
    const s = e.status || 'Unknown'
    statusCounts.set(s, (statusCounts.get(s) ?? 0) + 1)
  }
  const statusData = [...statusCounts.entries()].sort((a, b) => b[1] - a[1]).map(([name, value]) => ({ name, value }))

  const stuck = model.capTable
    .filter((e) => {
      const status = (e.status || '').toLowerCase()
      const preClose = status.includes('reserved') || status.includes('pending') || status.includes('lost')
      const noInvoice = !e.invoices.cc01InvoiceSent && !e.invoices.cc02InvoiceSent
      const hasMoney = (e.reserved + e.pending + e.sold + e.signed) > 0 || e.totalSignedValue > 0
      return preClose && noInvoice && hasMoney
    })
    .slice(0, 50)

  const byStage = new Map<string, number>()
  for (const inv of model.investors) {
    for (const ps of inv.projects) {
      const key = `${ps.projectName.toUpperCase()} · ${ps.stage}`
      byStage.set(key, (byStage.get(key) ?? 0) + 1)
    }
  }
  const stageData = [...byStage.entries()].sort((a, b) => b[1] - a[1]).slice(0, 12).map(([name, value]) => ({ name, value }))

  return (
    <div className="space-y-4">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Pipeline</h1>
        <p className="mt-1 text-sm opacity-70">
          Funnel-style analytics across projects and stages. "Stuck" logic is heuristic (status + missing invoice flags) and is designed to surface likely follow-ups.
        </p>
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <Card>
          <div className="text-sm font-medium opacity-80">Cap table status distribution</div>
          <div className="mt-4">
            <SimpleBar data={statusData} />
          </div>
        </Card>

        <Card>
          <div className="text-sm font-medium opacity-80">Top project-stage counts (master list)</div>
          <div className="mt-4">
            <SimpleBar data={stageData} />
          </div>
        </Card>
      </div>

      <Card>
        <div className="text-sm font-medium opacity-80">Likely stuck items (needs follow-up)</div>
        <div className="mt-1 text-xs opacity-70">
          Filter: status includes Reserved/Pending/Lost AND no invoice flags set AND some reserved/pending/sold/signed/value present.
        </div>
        <div className="mt-3 overflow-x-auto rounded-lg border">
          <table className="min-w-full text-sm">
            <thead className="bg-black/5 text-left text-xs dark:bg-white/10">
              <tr>
                <th className="px-3 py-2">Investor</th>
                <th className="px-3 py-2">Project</th>
                <th className="px-3 py-2">Status</th>
                <th className="px-3 py-2">Contract</th>
                <th className="px-3 py-2">Value</th>
                <th className="px-3 py-2">Notes</th>
              </tr>
            </thead>
            <tbody>
              {stuck.length ? (
                stuck.map((e) => (
                  <tr key={e.id} className="border-t">
                    <td className="px-3 py-2 font-medium">{e.investorName}</td>
                    <td className="px-3 py-2">{e.project}</td>
                    <td className="px-3 py-2">{e.status || '—'}</td>
                    <td className="px-3 py-2">{e.contractNumber || '—'}</td>
                    <td className="px-3 py-2">{e.totalSignedValue ? e.totalSignedValue.toLocaleString() : '—'}</td>
                    <td className="px-3 py-2">{e.notes || '—'}</td>
                  </tr>
                ))
              ) : (
                <tr className="border-t">
                  <td className="px-3 py-2" colSpan={6}>
                    No stuck candidates found with current heuristic.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  )
}

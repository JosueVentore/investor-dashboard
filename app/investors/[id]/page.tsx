import Link from 'next/link'
import { Card } from '@/components/card'
import { buildDataModel } from '@/lib/model'

export default async function InvestorProfilePage({ params }: { params: { id: string } }) {
  const model = await buildDataModel()
  const id = decodeURIComponent(params.id)

  const investor = model.investors.find((i) => i.id === id)
  if (!investor) {
    return (
      <div className="space-y-4">
        <h1 className="text-2xl font-semibold tracking-tight">Investor not found</h1>
        <Link href="/investors" className="underline-offset-2 hover:underline">Back to Investors</Link>
      </div>
    )
  }

  const ridKey = `rid:${investor.id}`
  const nameKeyKnown = investor.knownName ? `name:${investor.knownName.toLowerCase().trim()}` : ''
  const nameKeyLegal = investor.legalName ? `name:${investor.legalName.toLowerCase().trim()}` : ''

  const capEntries = model.capTable.filter((e) => [ridKey, nameKeyKnown, nameKeyLegal].includes(e.investorKey))
  const compliance = model.compliance.filter((c) => c.investorName.toLowerCase().trim() === investor.displayName.toLowerCase().trim())

  const stages = investor.projects

  return (
    <div className="space-y-4">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">{investor.displayName}</h1>
          <p className="mt-1 text-sm opacity-70">Investor record id: {investor.id}</p>
          {investor.intakeForm ? (
            <a
              className="mt-2 inline-block rounded-md border px-3 py-2 text-sm hover:bg-black/5 dark:hover:bg-white/10"
              href={investor.intakeForm}
              target="_blank"
              rel="noreferrer"
            >
              Open intake form
            </a>
          ) : null}
        </div>
        <Link href="/investors" className="rounded-md border px-3 py-2 text-sm hover:bg-black/5 dark:hover:bg-white/10">
          Back
        </Link>
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <Card>
          <div className="text-sm font-medium opacity-80">Project stages (from Master List)</div>
          <div className="mt-3 overflow-x-auto rounded-lg border">
            <table className="min-w-full text-sm">
              <thead className="bg-black/5 text-left text-xs dark:bg-white/10">
                <tr>
                  <th className="px-3 py-2">Project</th>
                  <th className="px-3 py-2">Stage</th>
                  <th className="px-3 py-2">Raw token</th>
                </tr>
              </thead>
              <tbody>
                {stages.length ? (
                  stages.map((s) => (
                    <tr key={`${s.projectKey}:${s.stageKey}`} className="border-t">
                      <td className="px-3 py-2 font-medium">{s.projectName}</td>
                      <td className="px-3 py-2">{s.stage}</td>
                      <td className="px-3 py-2 opacity-80">{s.projectRaw}</td>
                    </tr>
                  ))
                ) : (
                  <tr className="border-t">
                    <td className="px-3 py-2" colSpan={3}>
                      No projects listed.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </Card>

        <Card>
          <div className="text-sm font-medium opacity-80">Cap table entries</div>
          <div className="mt-1 text-xs opacity-70">Matched by record id when available, otherwise by normalized name.</div>
          <div className="mt-3 overflow-x-auto rounded-lg border">
            <table className="min-w-full text-sm">
              <thead className="bg-black/5 text-left text-xs dark:bg-white/10">
                <tr>
                  <th className="px-3 py-2">Project</th>
                  <th className="px-3 py-2">Type</th>
                  <th className="px-3 py-2">Status</th>
                  <th className="px-3 py-2">Contract</th>
                  <th className="px-3 py-2">Value</th>
                </tr>
              </thead>
              <tbody>
                {capEntries.length ? (
                  capEntries.map((e) => (
                    <tr key={e.id} className="border-t">
                      <td className="px-3 py-2 font-medium">{e.project}</td>
                      <td className="px-3 py-2">{e.investmentType || '—'}</td>
                      <td className="px-3 py-2">{e.status || '—'}</td>
                      <td className="px-3 py-2">{e.contractNumber || '—'}</td>
                      <td className="px-3 py-2">{e.totalSignedValue ? e.totalSignedValue.toLocaleString() : '—'}</td>
                    </tr>
                  ))
                ) : (
                  <tr className="border-t">
                    <td className="px-3 py-2" colSpan={5}>
                      No cap table entries matched.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </Card>
      </div>

      <Card>
        <div className="text-sm font-medium opacity-80">Compliance tasks (from Compliance Database)</div>
        <div className="mt-3 overflow-x-auto rounded-lg border">
          <table className="min-w-full text-sm">
            <thead className="bg-black/5 text-left text-xs dark:bg-white/10">
              <tr>
                <th className="px-3 py-2">Project</th>
                <th className="px-3 py-2">Stage</th>
                <th className="px-3 py-2">Investment type</th>
                <th className="px-3 py-2">Checklist (true count)</th>
                <th className="px-3 py-2">Next steps</th>
              </tr>
            </thead>
            <tbody>
              {compliance.length ? (
                compliance.map((c) => {
                  const done = Object.values(c.flags).filter(Boolean).length
                  const total = Object.keys(c.flags).length
                  return (
                    <tr key={c.id} className="border-t">
                      <td className="px-3 py-2 font-medium">{c.project || '—'}</td>
                      <td className="px-3 py-2">{c.stage || '—'}</td>
                      <td className="px-3 py-2">{c.investmentType || '—'}</td>
                      <td className="px-3 py-2">
                        {done}/{total}
                      </td>
                      <td className="px-3 py-2">{c.nextSteps || '—'}</td>
                    </tr>
                  )
                })
              ) : (
                <tr className="border-t">
                  <td className="px-3 py-2" colSpan={5}>
                    No compliance rows matched by name.
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

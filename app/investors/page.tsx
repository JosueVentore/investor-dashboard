import { Card } from '@/components/card'
import { InvestorList, type InvestorListRow } from '@/components/investors/investor-list'
import { buildDataModel } from '@/lib/model'

export default async function InvestorsPage() {
  const model = await buildDataModel()

  const rows: InvestorListRow[] = model.investors
    .map((inv) => {
      const projects = inv.projects
        .map((p) => `${p.projectName}${p.stage !== 'Unspecified' ? ` (${p.stage})` : ''}`)
        .join(', ')
      return {
        id: inv.id,
        displayName: inv.displayName,
        knownName: inv.knownName,
        legalName: inv.legalName,
        projects
      }
    })
    .sort((a, b) => a.displayName.localeCompare(b.displayName))

  return (
    <div className="space-y-4">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Investors</h1>
        <p className="mt-1 text-sm opacity-70">
          Searchable investor list. Click into a profile to see all related project stages, cap-table entries, and compliance tasks.
        </p>
      </div>

      <Card>
        <InvestorList rows={rows} />
      </Card>
    </div>
  )
}

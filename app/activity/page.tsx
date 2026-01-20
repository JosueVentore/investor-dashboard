import { Card } from '@/components/card'
import { ActivityFeed, type ActivityItem } from '@/components/activity/activity-feed'
import { buildDataModel } from '@/lib/model'

export default async function ActivityPage() {
  const model = await buildDataModel()

  const items: ActivityItem[] = []

  for (const e of model.capTable) {
    if (e.notes) {
      items.push({
        id: `cap:${e.id}`,
        source: 'cap-table',
        project: e.project,
        investor: e.investorName,
        text: e.notes
      })
    }
  }

  for (const c of model.compliance) {
    if (c.nextSteps) {
      items.push({
        id: `comp:${c.id}`,
        source: 'compliance',
        project: c.project || '—',
        investor: c.investorName,
        text: c.nextSteps
      })
    }
  }

  // Most recent isn't available (no reliable date fields across all tabs). Show alphabetically grouped instead.
  items.sort((a, b) => `${a.project} ${a.investor}`.localeCompare(`${b.project} ${b.investor}`))

  return (
    <div className="space-y-4">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Activity & Notes</h1>
        <p className="mt-1 text-sm opacity-70">
          Operational view across Notes (cap tables) and Next Steps (compliance). Use search to find comms follow-ups.
        </p>
      </div>

      <Card>
        <ActivityFeed items={items} />
      </Card>
    </div>
  )
}

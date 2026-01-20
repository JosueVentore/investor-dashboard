import Link from 'next/link'
import { Card, CardTitle, CardValue } from '@/components/card'
import { SimpleBar } from '@/components/charts/simple-bar'
import { SimplePie } from '@/components/charts/simple-pie'
import { buildDataModel } from '@/lib/model'

function formatMoney(n: number) {
  return n.toLocaleString(undefined, { maximumFractionDigits: 0 })
}

export default async function Page() {
  const model = await buildDataModel()

  const investorCount = model.investors.length
  const capCount = model.capTable.length
  const projectCount = model.projects.length
  const totalSigned = model.capTable.reduce((a, b) => a + (b.totalSignedValue || 0), 0)

  const stageCounts = new Map<string, number>()
  for (const inv of model.investors) {
    for (const ps of inv.projects) {
      stageCounts.set(ps.stage, (stageCounts.get(ps.stage) ?? 0) + 1)
    }
  }
  const stageData = [...stageCounts.entries()]
    .sort((a, b) => b[1] - a[1])
    .map(([name, value]) => ({ name, value }))

  const capByProject = new Map<string, number>()
  for (const e of model.capTable) {
    capByProject.set(e.project, (capByProject.get(e.project) ?? 0) + 1)
  }
  const capProjectData = [...capByProject.entries()].map(([name, value]) => ({ name, value }))

  const statusCounts = new Map<string, number>()
  for (const e of model.capTable) {
    const s = e.status || '—'
    statusCounts.set(s, (statusCounts.get(s) ?? 0) + 1)
  }
  const statusData = [...statusCounts.entries()]
    .sort((a, b) => b[1] - a[1])
    .slice(0, 7)
    .map(([name, value]) => ({ name, value }))

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Overview</h1>
          <p className="mt-1 text-sm opacity-70">
            Last refreshed: {new Date(model.fetchedAt).toLocaleString()}
          </p>
        </div>
        <div className="flex gap-2">
          <Link href="/raw" className="rounded-md border px-3 py-2 text-sm hover:bg-black/5 dark:hover:bg-white/10">
            Raw Data Inspector
          </Link>
          <Link href="/quality" className="rounded-md border px-3 py-2 text-sm hover:bg-black/5 dark:hover:bg-white/10">
            Data Quality
          </Link>
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardTitle>Investors</CardTitle>
          <CardValue>{investorCount}</CardValue>
        </Card>
        <Card>
          <CardTitle>Projects</CardTitle>
          <CardValue>{projectCount}</CardValue>
        </Card>
        <Card>
          <CardTitle>Cap table entries</CardTitle>
          <CardValue>{capCount}</CardValue>
        </Card>
        <Card>
          <CardTitle>Total signed value</CardTitle>
          <CardValue>{formatMoney(totalSigned)}</CardValue>
        </Card>
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <Card>
          <div className="flex items-baseline justify-between gap-4">
            <div>
              <div className="text-sm font-medium opacity-80">Stage distribution (from Master List)</div>
              <div className="mt-1 text-xs opacity-70">Counts are based on parsed project-stage tokens; Stage 1/2 are distinct.</div>
            </div>
          </div>
          <div className="mt-4">
            <SimpleBar data={stageData} />
          </div>
        </Card>

        <Card>
          <div className="text-sm font-medium opacity-80">Cap table volume by project</div>
          <div className="mt-1 text-xs opacity-70">Counts from RUNE / ARIA / POLARITY cap tables.</div>
          <div className="mt-4">
            <SimplePie data={capProjectData} />
          </div>
        </Card>
      </div>

      <Card>
        <div className="text-sm font-medium opacity-80">Top statuses (cap tables)</div>
        <div className="mt-4">
          <SimpleBar data={statusData} height={240} />
        </div>
      </Card>

      <div className="grid gap-4 lg:grid-cols-3">
        <Card className="lg:col-span-2">
          <div className="text-sm font-medium opacity-80">Quick links</div>
          <div className="mt-3 grid gap-2 sm:grid-cols-2">
            <Link href="/investors" className="rounded-md border px-3 py-2 text-sm hover:bg-black/5 dark:hover:bg-white/10">
              Browse investors & profiles
            </Link>
            <Link href="/projects" className="rounded-md border px-3 py-2 text-sm hover:bg-black/5 dark:hover:bg-white/10">
              Project-centric analytics
            </Link>
            <Link href="/pipeline" className="rounded-md border px-3 py-2 text-sm hover:bg-black/5 dark:hover:bg-white/10">
              Pipeline funnel & stuck items
            </Link>
            <Link href="/activity" className="rounded-md border px-3 py-2 text-sm hover:bg-black/5 dark:hover:bg-white/10">
              Notes / comms operations
            </Link>
          </div>
        </Card>

        <Card>
          <div className="text-sm font-medium opacity-80">Health</div>
          <div className="mt-2 text-2xl font-semibold tracking-tight">{model.issues.length}</div>
          <div className="mt-1 text-xs opacity-70">Detected quality issues (see Data Quality page).</div>
        </Card>
      </div>
    </div>
  )
}

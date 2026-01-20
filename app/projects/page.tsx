import { Card } from '@/components/card'
import { ProjectList, type ProjectRow } from '@/components/projects/project-list'
import { buildDataModel } from '@/lib/model'

export default async function ProjectsPage() {
  const model = await buildDataModel()

  const rows: ProjectRow[] = model.projects
    .map((p) => {
      const stages = p.stages.map((s) => ({
        stage: s.stage,
        investors: s.investors.length,
        entries: s.entries.length
      }))
      const totalInvestors = new Set(p.stages.flatMap((s) => s.investors)).size
      const totalEntries = p.stages.reduce((a, b) => a + b.entries.length, 0)
      return {
        project: p.project.toUpperCase(),
        stages,
        totalInvestors,
        totalEntries
      }
    })
    .sort((a, b) => b.totalInvestors - a.totalInvestors)

  return (
    <div className="space-y-4">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Projects</h1>
        <p className="mt-1 text-sm opacity-70">
          Project-centric view. Stage 1 vs Stage 2 are treated as distinct stage records (parsed from the Master List Project column).
        </p>
      </div>

      <Card>
        <ProjectList rows={rows} />
      </Card>
    </div>
  )
}

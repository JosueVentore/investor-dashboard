import { CSV_SOURCES } from '@/lib/constants'
import { fetchCsv, getCell, toBool, toNumber, type Row } from '@/lib/csv'

export type ProjectStage = {
  projectRaw: string
  projectName: string
  projectKey: string
  stage: string
  stageKey: string
}

export type Investor = {
  id: string
  recordId?: string
  legalName: string
  knownName: string
  displayName: string
  intakeForm: string
  projects: ProjectStage[]
}

export type CapTableEntry = {
  id: string
  project: string
  projectKey: string
  stage: string
  stageKey: string
  investmentType: string
  status: string
  contractNumber: string
  reserved: number
  pending: number
  signed: number
  sold: number
  totalSignedValue: number
  notes: string
  investorName: string
  investorKey: string
  trackerId: string
  invoices: {
    cc01InvoiceSent: boolean
    cc01PaymentReceived: boolean
    cc02InvoiceSent: boolean
    cc02PaymentReceived: boolean
    sharesIssued: boolean
  }
}

export type ComplianceRow = {
  id: string
  project: string
  projectKey: string
  stage: string
  stageKey: string
  investmentType: string
  investorName: string
  investorKey: string
  capTableRecordId: string
  flags: Record<string, boolean>
  nextSteps: string
}

export type DataQualityIssue = {
  kind: 'missing-investor-id' | 'unknown-stage' | 'duplicate-cap-table-id' | 'unmatched-compliance' | 'missing-project'
  severity: 'low' | 'medium' | 'high'
  message: string
  ref?: string
}

export type DataModel = {
  fetchedAt: string
  investors: Investor[]
  capTable: CapTableEntry[]
  compliance: ComplianceRow[]
  projects: {
    project: string
    projectKey: string
    // stages is an ARRAY so pages can safely do p.stages.map(...)
    stages: { stage: string; stageKey: string; investors: string[]; entries: string[] }[]
  }[]
  issues: DataQualityIssue[]
}

function normalizeText(v: string): string {
  return (v ?? '').toString().trim().replace(/\s+/g, ' ')
}

function normalizeKey(v: string): string {
  return normalizeText(v).toLowerCase()
}

function parseProjectToken(token: string): { projectName: string; stage: string } {
  const raw = normalizeText(token)
  if (!raw) return { projectName: '', stage: 'Unspecified' }

  // Patterns like: "ARIA (Stage 2)" or "ARIA(Stage 1)" or "ARIA - Stage 2"
  const paren = raw.match(/^(.+?)\((.+?)\)$/)
  if (paren) {
    return { projectName: normalizeText(paren[1]), stage: normalizeStage(paren[2]) }
  }

  const dash = raw.match(/^(.+?)[-–]\s*(stage\s*\d+.*)$/i)
  if (dash) {
    return { projectName: normalizeText(dash[1]), stage: normalizeStage(dash[2]) }
  }

  return { projectName: raw, stage: 'Unspecified' }
}

function normalizeStage(stage: string): string {
  const s = normalizeText(stage)
  if (!s) return 'Unspecified'
  const m = s.match(/stage\s*(\d+)/i)
  if (m) return `Stage ${m[1]}`
  return s
}

export function parseProjectsList(projectList: string): ProjectStage[] {
  const raw = normalizeText(projectList)
  if (!raw) return []

  const parts = raw.split(',').map((p) => normalizeText(p)).filter(Boolean)
  const seen = new Set<string>()
  const out: ProjectStage[] = []

  for (const part of parts) {
    const { projectName, stage } = parseProjectToken(part)
    const projectKey = normalizeKey(projectName)
    const stageNorm = normalizeStage(stage)
    const stageKey = normalizeKey(stageNorm)
    if (!projectKey) continue

    const key = `${projectKey}::${stageKey}`
    if (seen.has(key)) continue
    seen.add(key)

    out.push({
      projectRaw: part,
      projectName,
      projectKey,
      stage: stageNorm,
      stageKey
    })
  }

  return out
}

function stableInvestorKey(row: { recordId: string; knownName: string; legalName: string }): string {
  const rec = normalizeText(row.recordId)
  if (rec) return `rid:${rec}`
  // deterministic fallback: knownName > legalName
  const name = normalizeKey(row.knownName || row.legalName)
  return name ? `name:${name}` : 'unknown'
}

function guessProjectFromTracker(projectKey: string): string {
  // Fallback for cap-table rows: project is known by which tab it came from.
  return projectKey
}

function fromCapTableTab(project: 'rune' | 'aria' | 'polarity', rows: Row[], investorIndex: Map<string, Investor>, issues: DataQualityIssue[]): CapTableEntry[] {
  const projectName = project.toUpperCase()
  const projectKey = normalizeKey(projectName)
  const entries: CapTableEntry[] = []

  for (const r of rows) {
    const id = normalizeText(getCell(r, 'Record ID'))
    const legalName = normalizeText(getCell(r, 'Legal Investment Name'))
    const knownName = normalizeText(getCell(r, 'Known Name'))
    const investorKey = stableInvestorKey({ recordId: '', knownName, legalName })
    const investorName = knownName || legalName || 'Unknown'

    const investmentType = normalizeText(getCell(r, 'Investment Type'))
    const status = normalizeText(getCell(r, 'Status'))
    const contractNumber = normalizeText(getCell(r, 'Contract Number'))

    const reserved = toNumber(getCell(r, 'Shares Reserved', 'Blocks Reserved'))
    const pending = toNumber(getCell(r, 'Shares Pending', 'Blocks Pending'))
    const signed = toNumber(getCell(r, 'Shares Signed'))
    const sold = toNumber(getCell(r, 'Blocks Sold'))
    const totalSignedValue = toNumber(getCell(r, 'Total Signed Value'))
    const notes = normalizeText(getCell(r, 'Notes'))

    const trackerId = normalizeText(getCell(r, `${projectName} Compliance Tracker`, 'Compliance Tracker', 'ARIA Compliance Tracker', 'RUNE Compliance Tracker'))

    const cc01InvoiceSent = toBool(getCell(r, 'CC01 Invoice Sent', 'Invoice Sent'))
    const cc01PaymentReceived = toBool(getCell(r, 'CC01 Payment Received', 'Payment Received'))
    const cc02InvoiceSent = toBool(getCell(r, 'CC02 Invoice Sent'))
    const cc02PaymentReceived = toBool(getCell(r, 'CC02 Payment Received'))
    const sharesIssued = toBool(getCell(r, 'Shares Issued'))

    // stage not explicit in cap tables; treat as "Unspecified" and rely on master list for stage.
    const stage = 'Unspecified'
    const stageKey = normalizeKey(stage)

    // Attempt to improve investor matching: if there is an exact master-list investor whose known/legal matches.
    const match = [...investorIndex.values()].find((inv) => normalizeKey(inv.knownName) === normalizeKey(knownName) || normalizeKey(inv.legalName) === normalizeKey(legalName))
    const resolvedInvestorKey = match ? `rid:${match.id}` : investorKey

    if (!id) {
      issues.push({
        kind: 'missing-investor-id',
        severity: 'medium',
        message: `Cap table row is missing Record ID in ${projectName}.`,
        ref: investorName
      })
    }

    entries.push({
      id: id || `${projectKey}:${resolvedInvestorKey}:${contractNumber}`,
      project: projectName,
      projectKey,
      stage,
      stageKey,
      investmentType,
      status,
      contractNumber,
      reserved,
      pending,
      signed,
      sold,
      totalSignedValue,
      notes,
      investorName,
      investorKey: resolvedInvestorKey,
      trackerId,
      invoices: {
        cc01InvoiceSent,
        cc01PaymentReceived,
        cc02InvoiceSent,
        cc02PaymentReceived,
        sharesIssued
      }
    })
  }

  return entries
}

function buildProjectsIndex(investors: Investor[], capTable: CapTableEntry[]) {
  const map = new Map<string, { project: string; projectKey: string; stages: Map<string, { stage: string; stageKey: string; investors: Set<string>; entries: Set<string> }> }>()

  const ensure = (project: string, projectKey: string) => {
    let p = map.get(projectKey)
    if (!p) {
      p = { project, projectKey, stages: new Map() }
      map.set(projectKey, p)
    }
    return p
  }

  for (const inv of investors) {
    for (const ps of inv.projects) {
      const p = ensure(ps.projectName, ps.projectKey)
      const stageKey = ps.stageKey
      let st = p.stages.get(stageKey)
      if (!st) {
        st = { stage: ps.stage, stageKey, investors: new Set(), entries: new Set() }
        p.stages.set(stageKey, st)
      }
      st.investors.add(inv.id)
    }
  }

  for (const e of capTable) {
    const p = ensure(e.project, e.projectKey)
    const stageKey = e.stageKey
    let st = p.stages.get(stageKey)
    if (!st) {
      st = { stage: e.stage, stageKey, investors: new Set(), entries: new Set() }
      p.stages.set(stageKey, st)
    }
    st.investors.add(e.investorKey)
    st.entries.add(e.id)
  }

  return [...map.values()].map((p) => ({
    project: p.project,
    projectKey: p.projectKey,
    stages: [...p.stages.values()].map((s) => ({
      stage: s.stage,
      stageKey: s.stageKey,
      investors: [...s.investors.values()],
      entries: [...s.entries.values()]
    }))
  }))
}

export async function buildDataModel(): Promise<DataModel> {
  const [master, rune, aria, polarity, compliance] = await Promise.all([
    fetchCsv(CSV_SOURCES.master.url),
    fetchCsv(CSV_SOURCES.rune.url),
    fetchCsv(CSV_SOURCES.aria.url),
    fetchCsv(CSV_SOURCES.polarity.url),
    fetchCsv(CSV_SOURCES.compliance.url)
  ])

  const fetchedAt = new Date().toISOString()
  const issues: DataQualityIssue[] = []

  const investors: Investor[] = master.rows.map((r) => {
    const recordId = normalizeText(getCell(r, 'Record ID'))
    const legalName = normalizeText(getCell(r, 'Legal Investment Name'))
    const knownName = normalizeText(getCell(r, 'Known Name'))
    const projectList = normalizeText(getCell(r, 'Project'))
    const intakeForm = normalizeText(getCell(r, 'Investor Intake Form'))

    const projects = parseProjectsList(projectList)

    const id = recordId || stableInvestorKey({ recordId, knownName, legalName })
    const displayName = knownName || legalName || 'Unknown'

    if (!projects.length && displayName !== 'Unknown') {
      issues.push({
        kind: 'missing-project',
        severity: 'low',
        message: `Investor has no project listed in master tab.`,
        ref: displayName
      })
    }

    if (!recordId) {
      issues.push({
        kind: 'missing-investor-id',
        severity: 'medium',
        message: `Investor is missing Record ID in master tab; matching will use name fallback.`,
        ref: displayName
      })
    }

    for (const ps of projects) {
      if (ps.stage !== 'Unspecified' && !/^Stage\s+\d+/i.test(ps.stage)) {
        issues.push({
          kind: 'unknown-stage',
          severity: 'low',
          message: `Unrecognized stage label "${ps.stage}" for investor.`,
          ref: displayName
        })
      }
    }

    return {
      id: recordId || id,
      recordId: recordId || undefined,
      legalName,
      knownName,
      displayName,
      intakeForm,
      projects
    }
  })

  const investorIndex = new Map<string, Investor>()
  for (const inv of investors) investorIndex.set(inv.id, inv)

  const capTable = [
    ...fromCapTableTab('rune', rune.rows, investorIndex, issues),
    ...fromCapTableTab('aria', aria.rows, investorIndex, issues),
    ...fromCapTableTab('polarity', polarity.rows, investorIndex, issues)
  ]

  // Duplicates
  const seenCap = new Set<string>()
  for (const e of capTable) {
    if (seenCap.has(e.id)) {
      issues.push({
        kind: 'duplicate-cap-table-id',
        severity: 'high',
        message: `Duplicate cap-table entry id detected: ${e.id}`,
        ref: e.investorName
      })
    }
    seenCap.add(e.id)
  }

  const capById = new Map<string, CapTableEntry>()
  for (const e of capTable) capById.set(e.id, e)

  const complianceRows: ComplianceRow[] = compliance.rows.map((r) => {
    const id = normalizeText(getCell(r, 'Record ID'))
    const project = normalizeText(getCell(r, 'Project'))
    const parsed = parseProjectsList(project)
    const first = parsed[0] ?? { projectName: project || '', projectKey: normalizeKey(project), stage: 'Unspecified', stageKey: normalizeKey('Unspecified'), projectRaw: project }

    const investmentType = normalizeText(getCell(r, 'Investment Type'))
    const investorName = normalizeText(getCell(r, 'Investor'))
    const capTableRecordId = normalizeText(getCell(r, 'Investor (Cap Table)'))

    const investorKey = investorName ? `name:${normalizeKey(investorName)}` : 'unknown'

    const flags: Record<string, boolean> = {
      complianceHubSent: toBool(getCell(r, 'Compliance Hub Sent')),
      kycForm: toBool(getCell(r, 'KYC Form')),
      passport: toBool(getCell(r, 'Passport')),
      address: toBool(getCell(r, 'Address')),
      linkedinCv: toBool(getCell(r, 'LinkedIn/CV')),
      amlForm: toBool(getCell(r, 'AML Form')),
      allAmlDocsProvided: toBool(getCell(r, 'All AML Docs Provided')),
      companyKyc: toBool(getCell(r, 'Company KYC')),
      verified: toBool(getCell(r, 'Verified')),
      approvedByAdgm: toBool(getCell(r, 'Approved by ADGM')),
      shareCertificateIssued: toBool(getCell(r, 'Share Certificate Issued'))
    }

    const nextSteps = normalizeText(getCell(r, 'Next Steps'))

    if (capTableRecordId && !capById.has(capTableRecordId)) {
      issues.push({
        kind: 'unmatched-compliance',
        severity: 'medium',
        message: `Compliance row references missing cap-table record id: ${capTableRecordId}`,
        ref: investorName || id
      })
    }

    return {
      id: id || `compliance:${first.projectKey}:${investorKey}`,
      project: first.projectName || guessProjectFromTracker(first.projectKey),
      projectKey: first.projectKey,
      stage: first.stage,
      stageKey: first.stageKey,
      investmentType,
      investorName: investorName || 'Unknown',
      investorKey,
      capTableRecordId,
      flags,
      nextSteps
    }
  })

  const projects = buildProjectsIndex(investors, capTable)

  return { fetchedAt, investors, capTable, compliance: complianceRows, projects, issues }
}

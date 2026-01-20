import Papa from 'papaparse'
import { REVALIDATE_SECONDS } from '@/lib/constants'

export type Row = Record<string, string>

function normalizeHeader(h: string): string {
  return h.trim().replace(/\s+/g, ' ').toLowerCase()
}

/**
 * Returns a cell value for any of the candidate column names (case/whitespace-insensitive).
 */
export function getCell(row: Row, ...candidates: string[]): string {
  const normalizedKeys = new Map<string, string>()
  for (const k of Object.keys(row)) normalizedKeys.set(normalizeHeader(k), k)

  for (const c of candidates) {
    const key = normalizedKeys.get(normalizeHeader(c))
    if (key) return row[key] ?? ''
  }
  return ''
}

export function toBool(v: string): boolean {
  const s = (v ?? '').toString().trim().toLowerCase()
  return s === 'true' || s === 'yes' || s === '1' || s === 'y'
}

export function toNumber(v: string): number {
  const s = (v ?? '').toString().replace(/,/g, '').trim()
  if (!s) return 0
  const n = Number(s)
  return Number.isFinite(n) ? n : 0
}

export async function fetchCsv(url: string): Promise<{ rows: Row[]; fetchedAt: string }> {
  const res = await fetch(url, {
    next: { revalidate: REVALIDATE_SECONDS },
    headers: { 'User-Agent': 'ventore-dashboard/1.0' }
  })
  if (!res.ok) throw new Error(`Failed to fetch CSV (${res.status})`) 

  const text = await res.text()
  const parsed = Papa.parse<Record<string, unknown>>(text, {
    header: true,
    skipEmptyLines: true
  })

  if (parsed.errors?.length) {
    // Keep going if possible; surface via Data Quality page.
    // eslint-disable-next-line no-console
    console.warn('CSV parse warnings', parsed.errors)
  }

  const rows: Row[] = (parsed.data as Record<string, unknown>[]).map((r) => {
    const out: Row = {}
    for (const [k, v] of Object.entries(r ?? {})) {
      if (k == null) continue
      const key = String(k)
      out[key] = v == null ? '' : String(v)
    }
    return out
  })

  return { rows, fetchedAt: new Date().toISOString() }
}

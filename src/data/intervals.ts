export interface Interval {
  semitones: number
  short: string
  name: string
}

export const INTERVALS: Interval[] = [
  { semitones: 0, short: '1', name: 'Pryma czysta' },
  { semitones: 1, short: '2>', name: 'Sekunda mała' },
  { semitones: 2, short: '2', name: 'Sekunda wielka' },
  { semitones: 3, short: '3>', name: 'Tercja mała' },
  { semitones: 4, short: '3', name: 'Tercja wielka' },
  { semitones: 5, short: '4', name: 'Kwarta czysta' },
  { semitones: 6, short: 'TR', name: 'Tryton' },
  { semitones: 7, short: '5', name: 'Kwinta czysta' },
  { semitones: 8, short: '6>', name: 'Seksta mała' },
  { semitones: 9, short: '6', name: 'Seksta wielka' },
  { semitones: 10, short: '7', name: 'Septyma mała' },
  { semitones: 11, short: '7<', name: 'Septyma wielka' },
  { semitones: 12, short: '8', name: 'Oktawa czysta' },
]

export const ALL_SEMITONES: number[] = INTERVALS.map((interval) => interval.semitones)

export const INTERVAL_BY_SEMITONES: Record<number, Interval> = Object.fromEntries(
  INTERVALS.map((interval) => [interval.semitones, interval]),
)

export function intervalKey(semitones: number): string {
  return `i:${semitones}`
}

export function parseIntervalKey(key: string): number | null {
  if (!key.startsWith('i:')) return null
  const value = Number(key.slice(2))
  return Number.isFinite(value) ? value : null
}

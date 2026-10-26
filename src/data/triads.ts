import type { TriadInversion, TriadType } from '../types'

export interface TriadTypeOption {
  value: TriadType
  short: string
  name: string
  intervals: [number, number, number]
}

export const TRIAD_TYPES: TriadTypeOption[] = [
  { value: 'maj', short: 'Dur', name: 'Durowy', intervals: [0, 4, 7] },
  { value: 'min', short: 'Moll', name: 'Molowy', intervals: [0, 3, 7] },
  { value: 'dim', short: 'Zm', name: 'Zmniejszony', intervals: [0, 3, 6] },
  { value: 'aug', short: 'Zw', name: 'Zwiększony', intervals: [0, 4, 8] },
]

export const TRIAD_TYPE_BY_VALUE = Object.fromEntries(
  TRIAD_TYPES.map((type) => [type.value, type]),
) as Record<TriadType, TriadTypeOption>

export interface TriadInversionOption {
  value: TriadInversion
  short: string
  name: string
}

export const TRIAD_INVERSIONS: TriadInversionOption[] = [
  { value: 'root', short: 'Zas.', name: 'Postać zasadnicza' },
  { value: 'first', short: 'I', name: 'I przewrót' },
  { value: 'second', short: 'II', name: 'II przewrót' },
]

export const TRIAD_INVERSION_BY_VALUE = Object.fromEntries(
  TRIAD_INVERSIONS.map((inversion) => [inversion.value, inversion]),
) as Record<TriadInversion, TriadInversionOption>

export const ALL_TRIAD_TYPES: TriadType[] = TRIAD_TYPES.map((type) => type.value)

export const ALL_TRIAD_INVERSIONS: TriadInversion[] = TRIAD_INVERSIONS.map(
  (inversion) => inversion.value,
)

export function isTriadInversionAllowed(
  type: TriadType,
  inversion: TriadInversion,
): boolean {
  return type !== 'aug' || inversion === 'root'
}

export function triadInversionsFor(type: TriadType): TriadInversion[] {
  return ALL_TRIAD_INVERSIONS.filter((inversion) => isTriadInversionAllowed(type, inversion))
}

export function triadKey(type: TriadType, inversion: TriadInversion): string {
  return `${type}:${inversion}`
}

export const ALL_TRIAD_COMBINATIONS: string[] = TRIAD_TYPES.flatMap((type) =>
  triadInversionsFor(type.value).map((inversion) => triadKey(type.value, inversion)),
)

export function parseTriadKey(
  key: string,
): { type: TriadType; inversion: TriadInversion } | null {
  const [type, inversion] = key.split(':')
  if (!type || !inversion) return null
  if (!TRIAD_TYPE_BY_VALUE[type as TriadType]) return null
  if (!TRIAD_INVERSION_BY_VALUE[inversion as TriadInversion]) return null
  return { type: type as TriadType, inversion: inversion as TriadInversion }
}

export function triadMidiNotes(
  rootMidi: number,
  type: TriadType,
  inversion: TriadInversion,
): number[] {
  const [a, b, c] = TRIAD_TYPE_BY_VALUE[type].intervals
  switch (inversion) {
    case 'root':
      return [rootMidi + a, rootMidi + b, rootMidi + c]
    case 'first':
      return [rootMidi + b, rootMidi + c, rootMidi + a + 12]
    case 'second':
      return [rootMidi + c, rootMidi + a + 12, rootMidi + b + 12]
  }
}

export function triadLabel(type: TriadType, inversion: TriadInversion): string {
  return `${TRIAD_TYPE_BY_VALUE[type].name} · ${TRIAD_INVERSION_BY_VALUE[inversion].name}`
}

export function triadShortLabel(type: TriadType, inversion: TriadInversion): string {
  return `${TRIAD_TYPE_BY_VALUE[type].short} · ${TRIAD_INVERSION_BY_VALUE[inversion].short}`
}

export function triadPool(selectedKeys: Iterable<string>): string[] {
  const selected = new Set(selectedKeys)
  const pool: string[] = []
  for (const type of TRIAD_TYPES) {
    for (const inversion of TRIAD_INVERSIONS) {
      if (!isTriadInversionAllowed(type.value, inversion.value)) continue
      const key = triadKey(type.value, inversion.value)
      if (selected.has(key)) pool.push(key)
    }
  }
  return pool
}

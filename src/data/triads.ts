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

export function triadKey(type: TriadType, inversion: TriadInversion): string {
  return `${type}:${inversion}`
}

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

export function triadPool(
  types: TriadType[],
  inversions: TriadInversion[],
): string[] {
  const pool: string[] = []
  for (const type of TRIAD_TYPES) {
    if (!types.includes(type.value)) continue
    for (const inversion of TRIAD_INVERSIONS) {
      if (!inversions.includes(inversion.value)) continue
      pool.push(triadKey(type.value, inversion.value))
    }
  }
  return pool
}

import type { SeventhChordInversion, SeventhChordType } from '../types'

export interface SeventhChordOption {
  value: SeventhChordType
  short: string
  name: string
  intervals: [number, number, number, number]
}

export const SEVENTH_CHORDS: SeventhChordOption[] = [
  { value: 'maj7', short: 'maj7', name: 'Durowy septymowy', intervals: [0, 4, 7, 11] },
  { value: 'm7', short: 'm7', name: 'Molowy septymowy', intervals: [0, 3, 7, 10] },
  { value: 'dom7', short: '7', name: 'Dominanta septymowa', intervals: [0, 4, 7, 10] },
  { value: 'm7b5', short: 'm7b5', name: 'Półzmniejszony septymowy', intervals: [0, 3, 6, 10] },
  { value: 'dim7', short: 'dim7', name: 'Zmniejszony septymowy', intervals: [0, 3, 6, 9] },
]

export const SEVENTH_CHORD_BY_VALUE = Object.fromEntries(
  SEVENTH_CHORDS.map((chord) => [chord.value, chord]),
) as Record<SeventhChordType, SeventhChordOption>

export const ALL_SEVENTH_CHORD_TYPES: SeventhChordType[] = SEVENTH_CHORDS.map(
  (chord) => chord.value,
)

export interface SeventhChordInversionOption {
  value: SeventhChordInversion
  short: string
  name: string
}

export const CHORD_INVERSIONS: SeventhChordInversionOption[] = [
  { value: 'root', short: 'Zas.', name: 'Postać zasadnicza' },
  { value: 'first', short: 'I', name: 'I przewrót' },
  { value: 'second', short: 'II', name: 'II przewrót' },
  { value: 'third', short: 'III', name: 'III przewrót' },
]

export const CHORD_INVERSION_BY_VALUE = Object.fromEntries(
  CHORD_INVERSIONS.map((inversion) => [inversion.value, inversion]),
) as Record<SeventhChordInversion, SeventhChordInversionOption>

export const ALL_CHORD_INVERSIONS: SeventhChordInversion[] = CHORD_INVERSIONS.map(
  (inversion) => inversion.value,
)

export function isChordInversionAllowed(
  type: SeventhChordType,
  inversion: SeventhChordInversion,
): boolean {
  return type !== 'dim7' || inversion === 'root'
}

export function chordInversionsFor(type: SeventhChordType): SeventhChordInversion[] {
  return ALL_CHORD_INVERSIONS.filter((inversion) => isChordInversionAllowed(type, inversion))
}

export function chordKey(type: SeventhChordType, inversion: SeventhChordInversion): string {
  return `c:${type}:${inversion}`
}

export const ALL_CHORD_COMBINATIONS: string[] = SEVENTH_CHORDS.flatMap((chord) =>
  chordInversionsFor(chord.value).map((inversion) => chordKey(chord.value, inversion)),
)

export function parseChordKey(
  key: string,
): { type: SeventhChordType; inversion: SeventhChordInversion } | null {
  const [prefix, type, inversion] = key.split(':')
  if (prefix !== 'c' || !type || !inversion) return null
  if (!SEVENTH_CHORD_BY_VALUE[type as SeventhChordType]) return null
  if (!CHORD_INVERSION_BY_VALUE[inversion as SeventhChordInversion]) return null
  return {
    type: type as SeventhChordType,
    inversion: inversion as SeventhChordInversion,
  }
}

export function chordMidiNotes(
  rootMidi: number,
  type: SeventhChordType,
  inversion: SeventhChordInversion,
): number[] {
  const [a, b, c, d] = SEVENTH_CHORD_BY_VALUE[type].intervals
  switch (inversion) {
    case 'root':
      return [rootMidi + a, rootMidi + b, rootMidi + c, rootMidi + d]
    case 'first':
      return [rootMidi + b, rootMidi + c, rootMidi + d, rootMidi + a + 12]
    case 'second':
      return [rootMidi + c, rootMidi + d, rootMidi + a + 12, rootMidi + b + 12]
    case 'third':
      return [rootMidi + d, rootMidi + a + 12, rootMidi + b + 12, rootMidi + c + 12]
  }
}

export function chordLabel(
  type: SeventhChordType,
  inversion: SeventhChordInversion,
): string {
  const chord = SEVENTH_CHORD_BY_VALUE[type]
  const inversionLabel = CHORD_INVERSION_BY_VALUE[inversion].name
  return `${chord.name} (${chord.short}) · ${inversionLabel}`
}

export function chordShortLabel(
  type: SeventhChordType,
  inversion: SeventhChordInversion,
): string {
  const chord = SEVENTH_CHORD_BY_VALUE[type]
  const inversionLabel = CHORD_INVERSION_BY_VALUE[inversion].short
  return `${chord.short} · ${inversionLabel}`
}

export function chordPool(selectedKeys: Iterable<string>): string[] {
  const selected = new Set(selectedKeys)
  const pool: string[] = []
  for (const chord of SEVENTH_CHORDS) {
    for (const inversion of CHORD_INVERSIONS) {
      if (!isChordInversionAllowed(chord.value, inversion.value)) continue
      const key = chordKey(chord.value, inversion.value)
      if (selected.has(key)) pool.push(key)
    }
  }
  return pool
}

import type { DirectionSource, PlayDirection, ResolvedDirection } from '../types'

export interface DirectionOption {
  value: PlayDirection
  label: string
  description: string
}

export const DIRECTION_OPTIONS: DirectionOption[] = [
  {
    value: 'random',
    label: 'Losowo',
    description: 'dla każdego pytania losowany jest kierunek: góra, dół lub harmonicznie',
  },
  {
    value: 'up',
    label: 'W górę',
    description: 'nuta bazowa, a po 0.5s nuta wyższa',
  },
  {
    value: 'down',
    label: 'W dół',
    description: 'nuta wyższa, a po 0.5s nuta bazowa',
  },
  {
    value: 'harmonic',
    label: 'Harmonicznie',
    description: 'obie nuty grane jednocześnie',
  },
]

export const RESOLVED_DIRECTIONS: ResolvedDirection[] = ['up', 'down', 'harmonic']

export const RESOLVED_DIRECTION_LABELS: Record<ResolvedDirection, string> = {
  up: 'W górę',
  down: 'W dół',
  harmonic: 'Harmonicznie',
}

export const DIRECTION_GLYPHS: Record<ResolvedDirection, string> = {
  up: '↑',
  down: '↓',
  harmonic: '♫',
}

export const DIRECTION_SOURCE_LABELS: Record<DirectionSource, string> = {
  random: 'Wylosowany',
  chosen: 'Wybrany',
  time: 'Tryb czasowy',
}

export const DIRECTION_OPTION_BY_VALUE = Object.fromEntries(
  DIRECTION_OPTIONS.map((option) => [option.value, option]),
) as Record<PlayDirection, DirectionOption>

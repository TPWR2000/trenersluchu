import type { DirectionSource, PlayDirection, PlayMode } from '../types'

export interface DirectionOption {
  value: PlayDirection
  label: string
  description: string
}

export const DIRECTION_OPTIONS: DirectionOption[] = [
  {
    value: 'random',
    label: 'Losowo',
    description: 'dla każdego pytania losowany jest tryb: w górę, w dół lub harmonicznie',
  },
  {
    value: 'up',
    label: 'W górę',
    description: 'nuty grane po kolei od najniższej do najwyższej (odstęp 0.35s)',
  },
  {
    value: 'down',
    label: 'W dół',
    description: 'nuty grane po kolei od najwyższej do najniższej (odstęp 0.35s)',
  },
  {
    value: 'harmonic',
    label: 'Harmonicznie',
    description: 'wszystkie nuty grane dokładnie w tym samym momencie',
  },
]

export const PLAY_MODES: PlayMode[] = ['asc', 'desc', 'harmonic']

export const PLAY_MODE_LABELS: Record<PlayMode, string> = {
  asc: 'W górę',
  desc: 'W dół',
  harmonic: 'Harmonicznie',
}

export const PLAY_MODE_GLYPHS: Record<PlayMode, string> = {
  asc: '↑',
  desc: '↓',
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

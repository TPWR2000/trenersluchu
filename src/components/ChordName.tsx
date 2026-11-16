import {chordBadgeLabel, chordFigure, chordLabel, chordSeventh, chordSymbol} from '../data/chords'
import type {NameDisplayMode, SeventhChordInversion, SeventhChordType} from '../types'

interface ChordNameProps {
  type: SeventhChordType
  inversion: SeventhChordInversion
  mode: NameDisplayMode
  className?: string
}

export function ChordName({type, inversion, mode, className = ''}: ChordNameProps) {
  const accessibleName = chordLabel(type, inversion)
  if (mode === 'words') {
    return <span className={className}>{accessibleName}</span>
  }

  const symbol = chordSymbol(type)
  const figure = chordFigure(type, inversion)
  const badge = (
    <span
      role="img"
      aria-label={accessibleName}
      title={accessibleName}
      data-badge-label={chordBadgeLabel(type, inversion)}
      className={`inline-flex min-w-10 flex-col items-center justify-center gap-1 font-mono leading-none text-current ${className}`}
    >
      <span className="inline-flex min-h-9 items-start justify-center whitespace-nowrap text-3xl font-bold leading-none">
        {symbol}
        {inversion !== 'third' && (
          <sup className="ml-0.5 pt-0.5 text-sm font-bold leading-none sm:text-base">
            {chordSeventh(type)}
          </sup>
        )}
      </span>
      {figure && (
        <span className="whitespace-nowrap text-base font-semibold leading-tight">{figure}</span>
      )}
    </span>
  )
  return mode === 'symbols' ? badge : (
    <span className={`inline-flex flex-col items-center gap-1 text-center ${className}`}>
      {badge}
      <span className="text-xs leading-snug font-medium text-current sm:text-sm">{accessibleName}</span>
    </span>
  )
}

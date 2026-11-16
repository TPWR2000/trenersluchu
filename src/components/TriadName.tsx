import {triadFigure, triadLabel, triadSymbol} from '../data/triads'
import type {NameDisplayMode, TriadInversion, TriadType} from '../types'

interface TriadNameProps {
  type: TriadType
  inversion: TriadInversion
  mode: NameDisplayMode
  className?: string
}

export function TriadName({type, inversion, mode, className = ''}: TriadNameProps) {
  const accessibleName = triadLabel(type, inversion)
  if (mode === 'words') {
    return <span className={className}>{accessibleName}</span>
  }

  const figure = triadFigure(inversion)
  const symbol = triadSymbol(type)
  const badge = (
    <span
      role="img"
      aria-label={accessibleName}
      className={`inline-flex min-w-8 flex-col items-center justify-center gap-1 font-mono leading-none ${className}`}
      title={accessibleName}
    >
      <span className="text-3xl font-bold text-current">{symbol}</span>
      <span className="min-h-4 whitespace-nowrap text-base font-semibold text-current">
        {figure ?? '\u00a0'}
      </span>
    </span>
  )
  return mode === 'symbols' ? badge : (
    <span className={`inline-flex flex-col items-center gap-1 text-center ${className}`}>
      {badge}
      <span className="text-xs font-medium leading-tight text-current">{accessibleName}</span>
    </span>
  )
}

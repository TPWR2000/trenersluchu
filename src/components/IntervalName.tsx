import type {NameDisplayMode} from '../types'

interface IntervalNameProps {
  symbol: string
  name: string
  mode: NameDisplayMode
  className?: string
}

export function IntervalName({symbol, name, mode, className = ''}: IntervalNameProps) {
  if (mode === 'words') return <span className={className}>{name}</span>
  if (mode === 'symbols') return <span className={`font-mono font-bold ${className}`}>{symbol}</span>

  return (
    <span className={`inline-flex flex-col items-center gap-1 text-center ${className}`}>
      <span className="font-mono text-lg font-bold leading-none">{symbol}</span>
      <span className="text-xs font-medium leading-tight">{name}</span>
    </span>
  )
}

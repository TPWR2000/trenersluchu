import type { SessionConfig } from '../types'

interface ResultsAreaProps {
  config: SessionConfig
  correct: number
  wrong: number
  onRestart: () => void
  onGoToSetup: () => void
}

export function ResultsArea({ config, correct, wrong, onRestart, onGoToSetup }: ResultsAreaProps) {
  const total = correct + wrong
  const accuracy = total > 0 ? Math.round((correct / total) * 100) : 0
  const resultLabel = config.mode === 'count' ? `${correct} / ${config.count}` : `${correct}`

  const stats = [
    { label: 'Trafienia', value: correct, className: 'text-mt-success' },
    { label: 'Błędy', value: wrong, className: 'text-mt-error' },
    {
      label: 'Celność',
      value: `${accuracy}%`,
      className: accuracy >= 70 ? 'text-mt-accent' : 'text-mt-text',
    },
  ]

  return (
    <section className="flex flex-col items-center gap-8">
      <div className="text-center">
        <p className="text-xs uppercase tracking-[0.3em] text-mt-sub">
          {config.mode === 'count' ? 'Koniec sesji' : `Wynik w ${config.seconds}s`}
        </p>
        <p className="mt-2 text-6xl font-bold tabular-nums text-mt-accent">{resultLabel}</p>
        <p className="mt-1 text-sm text-mt-sub">
          {config.mode === 'count'
            ? `rozwiązano ${config.count} zadań`
            : `trafione interwały w limicie czasu`}
        </p>
      </div>

      <div className="grid w-full max-w-md grid-cols-3 gap-3">
        {stats.map((stat) => (
          <div
            key={stat.label}
            className="flex flex-col items-center gap-1 rounded border border-mt-sub/25 bg-mt-sub-alt px-3 py-4"
          >
            <span className={`text-2xl font-bold tabular-nums ${stat.className}`}>{stat.value}</span>
            <span className="text-[11px] uppercase tracking-wider text-mt-sub">{stat.label}</span>
          </div>
        ))}
      </div>

      <div className="flex flex-wrap items-center justify-center gap-3">
        <button
          type="button"
          onClick={onRestart}
          className="rounded bg-mt-accent px-8 py-3 text-sm font-bold uppercase tracking-widest text-mt-bg transition-colors duration-150 hover:bg-mt-accent/85"
        >
          Zagraj ponownie
        </button>
        <button
          type="button"
          onClick={onGoToSetup}
          className="rounded border border-mt-sub/40 px-8 py-3 text-sm font-bold uppercase tracking-widest text-mt-sub transition-colors duration-150 hover:border-mt-text/60 hover:text-mt-text"
        >
          Zmień ustawienia
        </button>
      </div>
    </section>
  )
}

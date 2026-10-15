import type { SamplesStatus } from '../audio/engine'
import { DIRECTION_OPTION_BY_VALUE, RESOLVED_DIRECTION_LABELS } from '../data/directions'
import { INTERVALS } from '../data/intervals'
import type { SessionConfig } from '../types'

interface SessionSettingsProps {
  config: SessionConfig
  selected: number[]
  samplesStatus: SamplesStatus
  onToggle: (semitones: number) => void
  onStart: () => void
}

export function SessionSettings({
  config,
  selected,
  samplesStatus,
  onToggle,
  onStart,
}: SessionSettingsProps) {
  const noneSelected = selected.length === 0
  const loading = samplesStatus === 'idle' || samplesStatus === 'loading'
  const failed = samplesStatus === 'error'
  const blocked = noneSelected || loading || failed
  const timeMode = config.mode === 'time'
  const directionLabel = timeMode
    ? RESOLVED_DIRECTION_LABELS.harmonic
    : DIRECTION_OPTION_BY_VALUE[config.direction].label
  const modeLabel = timeMode
    ? `${config.seconds}s — kierunek: ${directionLabel.toLowerCase()}`
    : `${config.count} zadań — kierunek: ${directionLabel.toLowerCase()}`

  return (
    <section className="flex flex-col gap-6">
      <div className="text-center">
        <h1 className="text-xl font-bold text-mt-text">Zakres interwałów</h1>
        <p className="mt-1 text-sm text-mt-sub">
          Wybierz interwały do ćwiczenia · {modeLabel}
        </p>
      </div>

      <div className="grid grid-cols-2 gap-2 sm:grid-cols-3 md:grid-cols-4">
        {INTERVALS.map((interval) => {
          const active = selected.includes(interval.semitones)
          return (
            <button
              key={interval.semitones}
              type="button"
              aria-pressed={active}
              onClick={() => onToggle(interval.semitones)}
              className={[
                'flex min-h-14 touch-manipulation flex-col items-center justify-center gap-0.5 rounded border px-3 py-2 transition-colors duration-150 outline-none',
                active
                  ? 'border-mt-accent bg-mt-accent/10 text-mt-accent'
                  : 'border-mt-sub/40 text-mt-sub hover:border-mt-text/60 hover:text-mt-text active:bg-mt-sub/10',
              ].join(' ')}
            >
              <span className="text-base font-bold leading-none">{interval.short}</span>
              <span className="text-[11px] leading-tight">{interval.name}</span>
              <span className="text-[10px] leading-none opacity-60">{interval.semitones} pt.</span>
            </button>
          )
        })}
      </div>

      <div className="flex flex-col items-center gap-3">
        {noneSelected && (
          <p className="text-sm text-mt-error">Wybierz co najmniej jeden interwał.</p>
        )}
        {loading && (
          <p className="animate-pulse text-sm text-mt-accent" role="status" aria-live="polite">
            Ładowanie brzmienia pianina...
          </p>
        )}
        {failed && (
          <p className="text-sm text-mt-error" role="alert">
            Nie udało się pobrać brzmień pianina — sprawdź połączenie i odśwież stronę.
          </p>
        )}

        <button
          type="button"
          disabled={blocked}
          onClick={onStart}
          className={[
            'min-h-12 w-full touch-manipulation rounded px-10 py-3 text-lg font-bold uppercase tracking-widest transition-colors duration-150 sm:w-auto',
            blocked
              ? 'cursor-not-allowed bg-mt-sub/30 text-mt-sub'
              : 'bg-mt-accent text-mt-bg hover:bg-mt-accent/85 active:scale-[0.99]',
          ].join(' ')}
        >
          {loading ? 'Ładowanie brzmienia pianina...' : 'Start'}
        </button>

        <p className="max-w-md text-center text-xs text-mt-sub">
          {timeMode
            ? `W trybie czasowym interwał zawsze grany jest ${DIRECTION_OPTION_BY_VALUE.harmonic.description} — wybór kierunku jest zablokowany.`
            : `Kierunek: ${DIRECTION_OPTION_BY_VALUE[config.direction].description}.`}
        </p>
      </div>
    </section>
  )
}

import type { SamplesStatus } from '../audio/engine'
import { TRIAD_INVERSIONS, TRIAD_TYPES } from '../data/triads'
import type { SessionConfig, TriadInversion, TriadType } from '../types'
import { StartControls } from './StartControls'

interface TriadSettingsProps {
  config: SessionConfig
  selectedTypes: TriadType[]
  selectedInversions: TriadInversion[]
  samplesStatus: SamplesStatus
  onToggleType: (type: TriadType) => void
  onToggleInversion: (inversion: TriadInversion) => void
  onStart: () => void
}

export function TriadSettings({
  config,
  selectedTypes,
  selectedInversions,
  samplesStatus,
  onToggleType,
  onToggleInversion,
  onStart,
}: TriadSettingsProps) {
  const noTypes = selectedTypes.length === 0
  const noInversions = selectedInversions.length === 0
  const noneSelected = noTypes || noInversions
  const combinations = selectedTypes.length * selectedInversions.length
  const timeMode = config.mode === 'time'
  const modeLabel = timeMode ? `${config.seconds}s` : `${config.count} zadań`
  const hint = 'Wszystkie dźwięki odtwarzane są jednocześnie (harmonicznie).'

  const optionClass = (active: boolean) =>
    [
      'flex min-h-14 touch-manipulation flex-col items-center justify-center gap-0.5 rounded border px-3 py-2 transition-colors duration-150 outline-none',
      active
        ? 'border-mt-accent bg-mt-accent/10 text-mt-accent'
        : 'border-mt-sub/40 text-mt-sub hover:border-mt-text/60 hover:text-mt-text active:bg-mt-sub/10',
    ].join(' ')

  return (
    <section className="flex flex-col gap-6">
      <div className="text-center">
        <h1 className="text-xl font-bold text-mt-text">Zakres trójdźwięków</h1>
        <p className="mt-1 text-sm text-mt-sub">
          Wybierz typy i przewroty do ćwiczenia · {modeLabel}
        </p>
      </div>

      <div className="flex flex-col gap-2">
        <span className="text-xs uppercase tracking-wider text-mt-sub">Typy trójdźwięków</span>
        <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
          {TRIAD_TYPES.map((type) => {
            const active = selectedTypes.includes(type.value)
            return (
              <button
                key={type.value}
                type="button"
                aria-pressed={active}
                onClick={() => onToggleType(type.value)}
                className={optionClass(active)}
              >
                <span className="text-base font-bold leading-none">{type.short}</span>
                <span className="text-[11px] leading-tight">{type.name}</span>
                <span className="text-[10px] leading-none opacity-60">
                  {type.intervals.join(' - ')}
                </span>
              </button>
            )
          })}
        </div>
      </div>

      <div className="flex flex-col gap-2">
        <span className="text-xs uppercase tracking-wider text-mt-sub">Przewroty</span>
        <div className="grid grid-cols-3 gap-2">
          {TRIAD_INVERSIONS.map((inversion) => {
            const active = selectedInversions.includes(inversion.value)
            return (
              <button
                key={inversion.value}
                type="button"
                aria-pressed={active}
                onClick={() => onToggleInversion(inversion.value)}
                className={optionClass(active)}
              >
                <span className="text-base font-bold leading-none">{inversion.short}</span>
                <span className="text-[11px] leading-tight">{inversion.name}</span>
              </button>
            )
          })}
        </div>
      </div>

      <div className="flex flex-col items-center gap-3">
        <StartControls
          samplesStatus={samplesStatus}
          disabled={noneSelected}
          hint={hint}
          onStart={onStart}
        >
          {noneSelected && (
            <p className="text-sm text-mt-error">
              {noTypes
                ? 'Wybierz co najmniej jeden typ trójdźwięku.'
                : 'Wybierz co najmniej jeden przewrót.'}
            </p>
          )}
          {!noneSelected && (
            <p className="text-xs text-mt-sub">
              Dostępnych kombinacji odpowiedzi:{' '}
              <span className="text-mt-text">{combinations}</span>
            </p>
          )}
        </StartControls>
      </div>
    </section>
  )
}

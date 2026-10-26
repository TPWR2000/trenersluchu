import type { SamplesStatus } from '../audio/engine'
import {
  TRIAD_INVERSIONS,
  TRIAD_TYPES,
  isTriadInversionAllowed,
  triadInversionsFor,
  triadKey,
  triadPool,
} from '../data/triads'
import type { SessionConfig, TriadInversion, TriadType } from '../types'
import { StartControls } from './StartControls'

interface TriadSettingsProps {
  config: SessionConfig
  selectedTriads: string[]
  samplesStatus: SamplesStatus
  onToggleCombination: (type: TriadType, inversion: TriadInversion) => void
  onToggleType: (type: TriadType) => void
  onStart: () => void
}

export function TriadSettings({
  config,
  selectedTriads,
  samplesStatus,
  onToggleCombination,
  onToggleType,
  onStart,
}: TriadSettingsProps) {
  const selected = new Set(selectedTriads)
  const combinations = triadPool(selectedTriads).length
  const noneSelected = combinations === 0
  const timeMode = config.mode === 'time'
  const modeLabel = timeMode ? `${config.seconds}s` : `${config.count} zadań`
  const hint = 'Wszystkie dźwięki odtwarzane są jednocześnie (harmonicznie).'

  const optionClass = (active: boolean, disabled = false) =>
    [
      'flex min-h-12 touch-manipulation flex-col items-center justify-center gap-0.5 rounded border px-2 py-1.5 transition-colors duration-150 outline-none',
      disabled
        ? 'cursor-not-allowed border-mt-sub/15 text-mt-sub/30'
        : active
          ? 'border-mt-accent bg-mt-accent/10 text-mt-accent'
          : 'border-mt-sub/40 text-mt-sub hover:border-mt-text/60 hover:text-mt-text active:bg-mt-sub/10',
    ].join(' ')

  return (
    <section className="flex flex-col gap-6">
      <div className="text-center">
        <h1 className="text-xl font-bold text-mt-text">Zakres trójdźwięków</h1>
        <p className="mt-1 text-sm text-mt-sub">
          Wybierz konkretne warianty (typ + przewrót) do ćwiczenia · {modeLabel}
        </p>
      </div>

      <div className="flex flex-col gap-3">
        {TRIAD_TYPES.map((type) => {
          const allowedInversions = triadInversionsFor(type.value)
          const activeCount = allowedInversions.filter((inversion) =>
            selected.has(triadKey(type.value, inversion)),
          ).length
          const allActive = activeCount === allowedInversions.length
          const typeActive = activeCount > 0

          return (
            <div
              key={type.value}
              className={[
                'flex flex-col gap-2 rounded border p-3 transition-colors duration-150',
                typeActive ? 'border-mt-accent/50' : 'border-mt-sub/25',
              ].join(' ')}
            >
              <div className="flex items-start justify-between gap-3">
                <button
                  type="button"
                  aria-pressed={allActive}
                  onClick={() => onToggleType(type.value)}
                  className="flex flex-1 touch-manipulation flex-wrap items-baseline gap-x-2 gap-y-0.5 rounded text-left outline-none transition-colors duration-150 hover:text-mt-text"
                >
                  <span
                    className={[
                      'text-lg font-bold leading-none',
                      typeActive ? 'text-mt-accent' : 'text-mt-text',
                    ].join(' ')}
                  >
                    {type.short}
                  </span>
                  <span className="text-sm text-mt-sub">{type.name}</span>
                  <span className="text-[10px] leading-none opacity-60">
                    {type.intervals.join(' - ')}
                  </span>
                </button>
                <span className="shrink-0 text-[10px] uppercase tracking-wider text-mt-sub">
                  {allActive ? 'Odznacz' : 'Zaznacz'} ({activeCount}/{allowedInversions.length})
                </span>
              </div>

              <div className="grid grid-cols-3 gap-2">
                {TRIAD_INVERSIONS.map((inversion) => {
                  const allowed = isTriadInversionAllowed(type.value, inversion.value)
                  const key = triadKey(type.value, inversion.value)
                  const active = allowed && selected.has(key)

                  return (
                    <button
                      key={inversion.value}
                      type="button"
                      aria-pressed={active}
                      disabled={!allowed}
                      title={
                        allowed
                          ? undefined
                          : 'Trójdźwięk zwiększony w przewrotach brzmi identycznie jak w postaci zasadniczej.'
                      }
                      onClick={() => onToggleCombination(type.value, inversion.value)}
                      className={optionClass(active, !allowed)}
                    >
                      <span className="text-sm font-bold leading-none">{inversion.short}</span>
                      <span className="text-[10px] leading-tight">{inversion.name}</span>
                      {!allowed && (
                        <span className="text-[9px] uppercase leading-none tracking-wider">
                          niedostępny
                        </span>
                      )}
                    </button>
                  )
                })}
              </div>

              {type.value === 'aug' && (
                <p className="text-[11px] leading-tight text-mt-sub/80">
                  Ze względu na symetrię budowy trójdźwięk zwiększony w przewrotach brzmi tak samo
                  jak w postaci zasadniczej — dostępna jest wyłącznie postać zasadnicza.
                </p>
              )}
            </div>
          )
        })}
      </div>

      <div className="flex flex-col items-center gap-3">
        <StartControls
          samplesStatus={samplesStatus}
          disabled={noneSelected}
          hint={hint}
          onStart={onStart}
        >
          {noneSelected ? (
            <p className="text-sm text-mt-error">
              Wybierz co najmniej jedną kombinację typu i przewrotu.
            </p>
          ) : (
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

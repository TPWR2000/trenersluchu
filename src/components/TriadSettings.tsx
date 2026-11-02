import type {SamplesStatus} from '../audio/engine'
import {TRIAD_TYPES, triadInversionsFor, triadKey, triadPool} from '../data/triads'
import type {TriadInversion, TriadType} from '../types'
import {StartControls} from './StartControls'

interface TriadSettingsProps {
    selectedTriads: string[]
    samplesStatus: SamplesStatus
    onToggleCombination: (type: TriadType, inversion: TriadInversion) => void
    onToggleType: (type: TriadType) => void
    onStart: () => void
}

export function TriadSettings({
                                  selectedTriads,
                                  samplesStatus,
                                  onToggleCombination,
                                  onToggleType,
                                  onStart,
                              }: TriadSettingsProps) {
    const selected = new Set(selectedTriads)
    const combinations = triadPool(selectedTriads).length
    const noneSelected = combinations === 0

    const optionClass = (active: boolean) =>
        [
            'flex min-h-14 touch-manipulation flex-col items-center justify-center gap-0.5 rounded-xl border border-mt-border bg-mt-bg px-2 py-2 transition-all duration-200 outline-none hover:-translate-y-0.5 focus-visible:ring-2 focus-visible:ring-mt-accent',
            active
                ? 'border-mt-accent bg-mt-accent/10 text-mt-accent shadow-lg shadow-brand-400/10'
                : 'text-mt-sub hover:border-mt-sub hover:text-mt-text',
        ].join(' ')

    return (
        <section className="flex flex-col gap-5">
            <div>
                <p className="font-mono text-xs uppercase tracking-[0.2em] text-mt-accent">02 / zakres</p>
                <h1 className="mt-1 text-2xl font-bold tracking-tight text-mt-text">Wybierz trójdźwięki</h1>
            </div>

            <div className="flex flex-col gap-3">
                {TRIAD_TYPES.map((type) => {
                    const allowedInversions = triadInversionsFor(type.value)
                    const activeCount = allowedInversions.filter((inversion) =>
                        selected.has(triadKey(type.value, inversion.value)),
                    ).length
                    const allActive = activeCount === allowedInversions.length
                    const typeActive = activeCount > 0

                    return (
                        <div
                            key={type.value}
                            className={[
                                'flex flex-col gap-3 rounded-xl border bg-mt-sub-alt p-4 transition-colors duration-150',
                                typeActive ? 'border-mt-accent/50' : 'border-mt-border',
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

                            <div
                                className={`grid gap-2 ${allowedInversions.length <= 1 ? 'grid-cols-1' : 'grid-cols-3'}`}
                            >
                                {allowedInversions.map((inversion) => {
                                    const key = triadKey(type.value, inversion.value)
                                    const active = selected.has(key)

                                    return (
                                        <button
                                            key={inversion.value}
                                            type="button"
                                            aria-pressed={active}
                                            onClick={() => onToggleCombination(type.value, inversion.value)}
                                            className={optionClass(active)}
                                        >
                      <span className="text-sm font-bold leading-none">
                        {type.short} ({inversion.short})
                      </span>
                                            <span className="text-[10px] leading-tight">{inversion.name}</span>
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

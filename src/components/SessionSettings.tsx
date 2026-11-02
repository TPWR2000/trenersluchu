import type {SamplesStatus} from '../audio/engine'
import {INTERVALS} from '../data/intervals'
import {StartControls} from './StartControls'

interface SessionSettingsProps {
    selected: number[]
    samplesStatus: SamplesStatus
    onToggle: (semitones: number) => void
    onStart: () => void
}

export function SessionSettings({
                                    selected,
                                    samplesStatus,
                                    onToggle,
                                    onStart,
                                }: SessionSettingsProps) {
    const noneSelected = selected.length === 0

    return (
        <section className="flex flex-col gap-5">
            <div className="flex items-end justify-between">
                <div>
                    <p className="font-mono text-xs uppercase tracking-[0.2em] text-mt-accent">01 / zakres</p>
                    <h1 className="mt-1 text-2xl font-bold tracking-tight text-mt-text">Wybierz interwały</h1>
                </div>
                <span className="font-mono text-xs text-mt-sub">{selected.length} wybrane</span>
            </div>

            <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5">
                {INTERVALS.map((interval) => {
                    const active = selected.includes(interval.semitones)
                    return (
                        <button
                            key={interval.semitones}
                            type="button"
                            aria-pressed={active}
                            onClick={() => onToggle(interval.semitones)}
                            className={[
                                'flex min-h-20 touch-manipulation flex-col items-center justify-center gap-1 rounded-xl border border-mt-border bg-mt-sub-alt px-3 py-3 transition-all duration-200 outline-none hover:-translate-y-0.5 focus-visible:ring-2 focus-visible:ring-mt-accent',
                                active
                                    ? 'border-mt-accent bg-mt-accent/10 text-mt-accent shadow-lg shadow-brand-400/10'
                                    : 'text-mt-sub hover:border-mt-sub hover:text-mt-text',
                            ].join(' ')}
                        >
                            <span className="font-mono text-lg font-bold leading-none">{interval.short}</span>
                            <span className="text-[11px] leading-tight">{interval.name}</span>
                            <span
                                className="font-mono text-[10px] leading-none opacity-60">{interval.semitones} półtonów</span>
                        </button>
                    )
                })}
            </div>

            <div className="flex flex-col items-center gap-3">
                <StartControls
                    samplesStatus={samplesStatus}
                    disabled={noneSelected}
                    onStart={onStart}
                >
                    {noneSelected && (
                        <p className="text-sm text-mt-error">Wybierz co najmniej jeden interwał.</p>
                    )}
                </StartControls>
            </div>
        </section>
    )
}

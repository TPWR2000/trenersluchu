import type {SamplesStatus} from '../audio/engine'
import {INTERVALS} from '../data/intervals'
import type {NameDisplayMode} from '../types'
import {IntervalName} from './IntervalName'
import {StartControls} from './StartControls'

interface SessionSettingsProps {
    selected: number[]
    samplesStatus: SamplesStatus
    nameMode: NameDisplayMode
    onToggle: (semitones: number) => void
    onSelectAll: () => void
    onClear: () => void
    onStart: () => void
}

export function SessionSettings({
                                    selected,
                                    samplesStatus,
                                    nameMode,
                                    onToggle,
                                    onSelectAll,
                                    onClear,
                                    onStart,
                                }: SessionSettingsProps) {
    const noneSelected = selected.length === 0

    return (
        <section className="flex flex-col gap-5">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
                <div>
                    <p className="font-mono text-xs uppercase tracking-[0.2em] text-mt-accent">01 / zakres</p>
                    <h1 className="mt-1 text-2xl font-bold tracking-tight text-mt-text">Wybierz interwały</h1>
                </div>
                <div className="flex items-center justify-between gap-2 sm:justify-end">
                    <span className="shrink-0 font-mono text-xs text-mt-sub">{selected.length} wybrane</span>
                    <div className="flex items-center gap-1">
                        <button
                            type="button"
                            onClick={onSelectAll}
                            className="min-h-9 whitespace-nowrap rounded-lg px-2 text-[10px] text-mt-sub transition-colors hover:bg-mt-sub-alt hover:text-mt-accent focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-mt-accent sm:px-3 sm:text-xs"
                        >
                            Zaznacz wszystkie
                        </button>
                        <button
                            type="button"
                            onClick={onClear}
                            title="Pozostawia prymę czystą i kwintę czystą"
                            className="min-h-9 whitespace-nowrap rounded-lg px-2 text-[10px] text-mt-sub transition-colors hover:bg-mt-sub-alt hover:text-mt-accent focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-mt-accent sm:px-3 sm:text-xs"
                        >
                            Wyczyść
                        </button>
                    </div>
                </div>
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
                            <IntervalName
                                symbol={interval.short}
                                name={interval.name}
                                mode={nameMode}
                            />
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

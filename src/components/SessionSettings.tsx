import type { SamplesStatus } from '../audio/engine'
import { INTERVALS } from '../data/intervals'
import { StartControls } from './StartControls'

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
  const hint = 'Wszystkie dźwięki odtwarzane są jednocześnie (harmonicznie).'

  return (
    <section className="flex flex-col gap-6">
      <div className="text-center">
        <h1 className="text-xl font-bold text-mt-text">Zakres interwałów</h1>
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
                'flex min-h-14 touch-manipulation flex-col items-center justify-center gap-0.5 rounded-xl border border-neutral-800 dark:border-neutral-700 bg-transparent px-3 py-2 transition-all duration-200 outline-none',
                active
                  ? 'border-mt-accent bg-mt-accent/10 text-mt-accent'
                  : 'text-mt-sub hover:border-mt-text/60 hover:text-mt-text hover:-translate-y-0.5',
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
        <StartControls
          samplesStatus={samplesStatus}
          disabled={noneSelected}
          hint={hint}
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

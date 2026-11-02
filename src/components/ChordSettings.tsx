import type { SamplesStatus } from '../audio/engine'
import { SEVENTH_CHORDS, chordInversionsFor, chordKey, chordPool } from '../data/chords'
import type { SeventhChordInversion, SeventhChordType } from '../types'
import { StartControls } from './StartControls'

interface ChordSettingsProps {
  selectedChords: string[]
  samplesStatus: SamplesStatus
  onToggleCombination: (type: SeventhChordType, inversion: SeventhChordInversion) => void
  onToggleType: (type: SeventhChordType) => void
  onStart: () => void
}

export function ChordSettings({
  selectedChords,
  samplesStatus,
  onToggleCombination,
  onToggleType,
  onStart,
}: ChordSettingsProps) {
  const selected = new Set(selectedChords)
  const combinations = chordPool(selectedChords).length
  const noneSelected = combinations === 0
  const hint = 'Wszystkie dźwięki odtwarzane są jednocześnie (harmonicznie).'

  const optionClass = (active: boolean) =>
    [
      'flex min-h-12 touch-manipulation flex-col items-center justify-center gap-0.5 rounded-xl border border-neutral-800 dark:border-neutral-700 bg-transparent px-2 py-1.5 transition-all duration-200 outline-none',
      active
        ? 'border-mt-accent bg-mt-accent/10 text-mt-accent'
        : 'text-mt-sub hover:border-mt-text/60 hover:text-mt-text hover:-translate-y-0.5',
    ].join(' ')

  return (
    <section className="flex flex-col gap-6">
      <div className="text-center">
        <h1 className="text-xl font-bold text-mt-text">Zakres akordów septymowych</h1>
      </div>

      <div className="flex flex-col gap-3">
        {SEVENTH_CHORDS.map((chord) => {
          const allowedInversions = chordInversionsFor(chord.value)
          const activeCount = allowedInversions.filter((inversion) =>
            selected.has(chordKey(chord.value, inversion.value)),
          ).length
          const allActive = activeCount === allowedInversions.length
          const typeActive = activeCount > 0

          return (
            <div
              key={chord.value}
              className={[
                'flex flex-col gap-2 rounded border p-3 transition-colors duration-150',
                typeActive ? 'border-mt-accent/50' : 'border-mt-sub/25',
              ].join(' ')}
            >
              <div className="flex items-start justify-between gap-3">
                <button
                  type="button"
                  aria-pressed={allActive}
                  onClick={() => onToggleType(chord.value)}
                  className="flex flex-1 touch-manipulation flex-wrap items-baseline gap-x-2 gap-y-0.5 rounded text-left outline-none transition-colors duration-150 hover:text-mt-text"
                >
                  <span
                    className={[
                      'text-lg font-bold leading-none',
                      typeActive ? 'text-mt-accent' : 'text-mt-text',
                    ].join(' ')}
                  >
                    {chord.short}
                  </span>
                  <span className="text-sm text-mt-sub">{chord.name}</span>
                  <span className="text-[10px] leading-none opacity-60">
                    {chord.intervals.join(' - ')}
                  </span>
                </button>
                <span className="shrink-0 text-[10px] uppercase tracking-wider text-mt-sub">
                  {allActive ? 'Odznacz' : 'Zaznacz'} ({activeCount}/{allowedInversions.length})
                </span>
              </div>

              <div
                className={
                  allowedInversions.length <= 1
                    ? 'grid grid-cols-1 gap-2'
                    : 'grid grid-cols-2 gap-2 sm:grid-cols-4'
                }
              >
                {allowedInversions.map((inversion) => {
                  const key = chordKey(chord.value, inversion.value)
                  const active = selected.has(key)

                  return (
                    <button
                      key={inversion.value}
                      type="button"
                      aria-pressed={active}
                      onClick={() => onToggleCombination(chord.value, inversion.value)}
                      className={optionClass(active)}
                    >
                      <span className="text-sm font-bold leading-none">
                        {chord.short} ({inversion.short})
                      </span>
                      <span className="text-[10px] leading-tight">{inversion.name}</span>
                    </button>
                  )
                })}
              </div>

              {chord.value === 'dim7' && (
                <p className="text-[11px] leading-tight text-mt-sub/80">
                  Ze względu na symetrię budowy akord zmniejszony septymowy w przewrotach brzmi tak
                  samo jak w postaci zasadniczej — dostępna jest wyłącznie postać zasadnicza.
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

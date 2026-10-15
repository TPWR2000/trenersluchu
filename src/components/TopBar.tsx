import { DIRECTION_OPTIONS } from '../data/directions'
import type { PlayDirection, SessionConfig } from '../types'

const CATEGORIES = [
  { label: 'Interwały', enabled: true },
  { label: 'Trójdźwięki', enabled: false },
  { label: 'Akordy', enabled: false },
]

const COUNT_OPTIONS = [10, 20, 50]
const TIME_OPTIONS = [15, 30, 60]

interface TopBarProps {
  config: SessionConfig
  locked: boolean
  onSelectCount: (count: number) => void
  onSelectTime: (seconds: number) => void
  onSelectDirection: (direction: PlayDirection) => void
}

export function TopBar({
  config,
  locked,
  onSelectCount,
  onSelectTime,
  onSelectDirection,
}: TopBarProps) {
  const timeMode = config.mode === 'time'
  const directionLocked = locked || timeMode
  const activeDirection: PlayDirection = timeMode ? 'harmonic' : config.direction

  const chipClass = (active: boolean) =>
    [
      'inline-flex min-h-11 items-center justify-center rounded px-4 text-sm transition-colors duration-150 outline-none',
      active
        ? 'bg-mt-accent font-bold text-mt-bg'
        : 'border border-mt-sub/40 text-mt-sub hover:border-mt-text/60 hover:text-mt-text',
      locked ? 'cursor-not-allowed opacity-50' : '',
    ]
      .filter(Boolean)
      .join(' ')

  const groupClass = 'flex flex-col gap-2 sm:flex-row sm:flex-wrap sm:items-center sm:gap-x-3'

  return (
    <header className="flex flex-col items-center gap-6">
      <div className="flex flex-col items-center gap-1 text-center sm:flex-row sm:items-baseline sm:gap-3">
        <span className="text-xl font-bold tracking-tight text-mt-accent sm:text-2xl">
          trener&nbsp;słuchu
        </span>
        <span className="text-[10px] uppercase tracking-[0.3em] text-mt-sub sm:text-xs">
          ear trainer
        </span>
      </div>

      <nav className="flex w-full flex-wrap items-center justify-center gap-x-5 gap-y-1 text-sm">
        {CATEGORIES.map((category) => (
          <button
            key={category.label}
            type="button"
            disabled={!category.enabled || locked}
            className={[
              'min-h-11 px-1 pb-1 transition-colors duration-150',
              category.enabled
                ? 'border-b-2 border-mt-accent text-mt-accent'
                : 'cursor-not-allowed text-mt-sub/60',
            ].join(' ')}
          >
            {category.label}
          </button>
        ))}
      </nav>

      <div className="flex w-full flex-col items-center gap-4 text-sm">
        <div className={groupClass}>
          <span className="text-center text-xs uppercase tracking-wider text-mt-sub sm:text-sm sm:normal-case sm:tracking-normal">
            Liczba zadań
          </span>
          <div className="flex justify-center gap-2">
            {COUNT_OPTIONS.map((count) => (
              <button
                key={count}
                type="button"
                disabled={locked}
                onClick={() => onSelectCount(count)}
                className={chipClass(config.mode === 'count' && config.count === count)}
              >
                {count}
              </button>
            ))}
          </div>
        </div>

        <div className={groupClass}>
          <span className="text-center text-xs uppercase tracking-wider text-mt-sub sm:text-sm sm:normal-case sm:tracking-normal">
            Czas
          </span>
          <div className="flex justify-center gap-2">
            {TIME_OPTIONS.map((seconds) => (
              <button
                key={seconds}
                type="button"
                disabled={locked}
                onClick={() => onSelectTime(seconds)}
                className={chipClass(config.mode === 'time' && config.seconds === seconds)}
              >
                {seconds}s
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="flex w-full flex-col items-center gap-3 text-sm">
        <span className="text-xs uppercase tracking-wider text-mt-sub sm:text-sm sm:normal-case sm:tracking-normal">
          Kierunek odtwarzania
        </span>
        <div className="grid w-full grid-cols-2 gap-2 sm:flex sm:flex-wrap sm:justify-center">
          {DIRECTION_OPTIONS.map((option) => (
            <button
              key={option.value}
              type="button"
              disabled={directionLocked}
              title={option.description}
              onClick={() => onSelectDirection(option.value)}
              className={chipClass(activeDirection === option.value)}
            >
              {option.label}
            </button>
          ))}
        </div>
        {timeMode && (
          <span className="text-center text-xs text-mt-sub/70">
            zablokowane w trybie czasowym — zawsze harmonicznie
          </span>
        )}
      </div>
    </header>
  )
}

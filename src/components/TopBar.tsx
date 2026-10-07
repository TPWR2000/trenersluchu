import { DIRECTION_OPTIONS } from '../data/directions'
import type { PlayDirection, SessionConfig } from '../types'

const CATEGORIES = [
  { label: 'Interwały', enabled: true },
  { label: 'Trójdźwięki', enabled: false },
  { label: 'Akordy', enabled: false },
]

const COUNT_OPTIONS = [10, 20, 50]
const TIME_OPTIONS = [60]

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
      'px-3 py-1 text-sm rounded transition-colors duration-150 outline-none',
      active
        ? 'bg-mt-accent text-mt-bg font-bold'
        : 'text-mt-sub hover:text-mt-text border border-mt-sub/40 hover:border-mt-text/60',
      locked ? 'cursor-not-allowed opacity-50' : '',
    ]
      .filter(Boolean)
      .join(' ')

  return (
    <header className="flex flex-col items-center gap-5">
      <div className="flex items-baseline gap-3">
        <span className="text-2xl font-bold tracking-tight text-mt-accent">trener&nbsp;słuchu</span>
        <span className="text-xs uppercase tracking-[0.3em] text-mt-sub">ear trainer</span>
      </div>

      <nav className="flex flex-wrap items-center justify-center gap-6 text-sm">
        {CATEGORIES.map((category) => (
          <button
            key={category.label}
            type="button"
            disabled={!category.enabled || locked}
            className={[
              'pb-1 transition-colors duration-150',
              category.enabled
                ? 'border-b-2 border-mt-accent text-mt-accent'
                : 'cursor-not-allowed text-mt-sub/60',
            ].join(' ')}
          >
            {category.label}
          </button>
        ))}
      </nav>

      <div className="flex flex-wrap items-center justify-center gap-x-8 gap-y-3 text-sm">
        <div className="flex items-center gap-2">
          <span className="text-mt-sub">Liczba zadań</span>
          <div className="flex gap-2">
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

        <div className="flex items-center gap-2">
          <span className="text-mt-sub">Czas</span>
          <div className="flex gap-2">
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

      <div className="flex flex-wrap items-center justify-center gap-x-4 gap-y-3 text-sm">
        <span className="text-mt-sub">Kierunek odtwarzania</span>
        <div className="flex flex-wrap justify-center gap-2">
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
          <span className="text-xs text-mt-sub/70">
            zablokowane w trybie czasowym — zawsze harmonicznie
          </span>
        )}
      </div>
    </header>
  )
}

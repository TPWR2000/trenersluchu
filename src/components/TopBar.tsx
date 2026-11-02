import {DIRECTION_OPTIONS} from '../data/directions'
import type {Category, PlayDirection, SessionConfig} from '../types'
import {FontAwesomeIcon} from '@fortawesome/react-fontawesome'
import {
    faArrowDown,
    faArrowUp,
    faClock,
    faListOl,
    faMusic,
    faShuffle,
    faSliders,
} from '@fortawesome/free-solid-svg-icons'
import {ThemeToggle} from './ThemeToggle'

const CATEGORIES: { value: Category; label: string }[] = [
    {value: 'intervals', label: 'Interwały'},
    {value: 'triads', label: 'Trójdźwięki'},
    {value: 'chords', label: 'Akordy'},
]

const COUNT_OPTIONS = [10, 20, 50]
const TIME_OPTIONS = [15, 30, 60]
const DIRECTION_ICONS = {
    random: faShuffle,
    up: faArrowUp,
    down: faArrowDown,
    harmonic: faMusic,
} as const

interface TopBarProps {
    config: SessionConfig
    locked: boolean
    isDark: boolean
    onToggleTheme: () => void
    onSelectCategory: (category: Category) => void
    onSelectCount: (count: number) => void
    onSelectTime: (seconds: number) => void
    onSelectDirection: (direction: PlayDirection) => void
}

export function TopBar({
                           config,
                           locked,
                           isDark,
                           onToggleTheme,
                           onSelectCategory,
                           onSelectCount,
                           onSelectTime,
                           onSelectDirection,
                       }: TopBarProps) {
    const timeMode = config.mode === 'time'
    const directionLocked = locked || timeMode
    const activeDirection: PlayDirection = timeMode ? 'harmonic' : config.direction

    const chipClass = (active: boolean) =>
        [
            'inline-flex min-h-10 items-center justify-center gap-2 rounded-lg px-4 text-sm transition-all duration-150 outline-none focus-visible:ring-2 focus-visible:ring-mt-accent',
            active
                ? 'bg-mt-accent font-semibold text-mt-bg shadow-lg shadow-brand-400/10'
                : 'border border-mt-border text-mt-sub hover:border-mt-sub hover:bg-mt-bg hover:text-mt-text',
            locked ? 'cursor-not-allowed opacity-50' : '',
        ]
            .filter(Boolean)
            .join(' ')

    return (
        <header className="flex w-full flex-col gap-6 border-b border-mt-border pb-6 sm:gap-8 sm:pb-8">
            <div className="flex flex-col items-center justify-between gap-4 sm:flex-row">
                <div className="flex items-center gap-3">
                    <div
                        className="flex h-10 w-10 items-center justify-center rounded-xl bg-mt-accent text-mt-bg shadow-lg shadow-brand-400/10">
                        <FontAwesomeIcon icon={faMusic}/>
                    </div>
                    <div>
                        <p className="text-lg font-bold tracking-tight text-mt-text">trener słuchu</p>
                        <p className="font-mono text-[10px] uppercase tracking-[0.2em] text-mt-sub">
                            ear trainer · v0.0.0
                        </p>
                    </div>
                </div>

                <div className="flex w-full items-center justify-between gap-2 sm:w-auto sm:gap-3">
                    <nav aria-label="Rodzaj ćwiczenia"
                         className="flex flex-1 items-center gap-1 rounded-xl border border-mt-border bg-mt-sub-alt p-1 sm:flex-none">
                        {CATEGORIES.map((category) => {
                            const active = category.value === config.category
                            return (
                                <button
                                    key={category.value}
                                    type="button"
                                    disabled={locked}
                                    aria-current={active ? 'page' : undefined}
                                    onClick={() => onSelectCategory(category.value)}
                                    className={[
                                        'min-h-9 flex-1 rounded-lg px-2 text-xs font-medium transition-colors sm:flex-none sm:px-4 sm:text-sm',
                                        active ? 'bg-mt-bg text-mt-accent shadow-sm' : 'text-mt-sub hover:text-mt-text',
                                        locked ? 'cursor-not-allowed opacity-50' : '',
                                    ].join(' ')}
                                >
                                    {category.label}
                                </button>
                            )
                        })}
                    </nav>
                    <ThemeToggle isDark={isDark} onToggle={onToggleTheme}/>
                </div>
            </div>

            <section
                className="grid gap-4 rounded-2xl border border-mt-border bg-mt-sub-alt p-4 sm:grid-cols-2 sm:gap-6 sm:p-5">
                <div className="flex flex-col gap-3">
                    <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-mt-sub">
                        <FontAwesomeIcon icon={faSliders} className="text-mt-accent"/>
                        Tryb sesji
                    </div>
                    <div className="flex gap-2">
                        <button type="button" disabled={locked} aria-pressed={!timeMode}
                                onClick={() => onSelectCount(config.count)}
                                className={`${chipClass(!timeMode)} flex-1`}>
                            <FontAwesomeIcon icon={faListOl}/>
                            Zadania
                        </button>
                        <button type="button" disabled={locked} aria-pressed={timeMode}
                                onClick={() => onSelectTime(config.seconds)}
                                className={`${chipClass(timeMode)} flex-1`}>
                            <FontAwesomeIcon icon={faClock}/>
                            Czas
                        </button>
                    </div>
                    <div className="flex gap-2">
                        {(timeMode ? TIME_OPTIONS : COUNT_OPTIONS).map((value) => (
                            <button
                                key={value}
                                type="button"
                                disabled={locked}
                                onClick={() => (timeMode ? onSelectTime(value) : onSelectCount(value))}
                                className={`${chipClass(timeMode ? config.seconds === value : config.count === value)} flex-1 font-mono`}
                            >
                                {timeMode ? `${value}s` : value}
                            </button>
                        ))}
                    </div>
                </div>

                <div className="flex flex-col gap-3">
                    <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-mt-sub">
                        <FontAwesomeIcon icon={faMusic} className="text-mt-accent"/>
                        Kierunek odtwarzania
                    </div>
                    <div className="grid grid-cols-2 gap-2">
                        {DIRECTION_OPTIONS.map((option) => (
                            <button
                                key={option.value}
                                type="button"
                                disabled={directionLocked}
                                title={option.description}
                                onClick={() => onSelectDirection(option.value)}
                                className={chipClass(activeDirection === option.value)}
                            >
                                <FontAwesomeIcon icon={DIRECTION_ICONS[option.value]} className="text-xs"/>
                                {option.label}
                            </button>
                        ))}
                    </div>
                    <span className="text-xs text-mt-sub/80">
            {timeMode
                ? 'Tryb czasowy zawsze odtwarza dźwięki harmonicznie.'
                : 'Losuj kierunek lub wybierz sposób odtwarzania.'}
          </span>
                </div>
            </section>
        </header>
    )
}

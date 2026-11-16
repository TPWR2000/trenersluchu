import type {NameDisplayMode} from '../types'

interface SettingsPageProps {
    nameDisplayMode: NameDisplayMode
    onNameDisplayModeChange: (mode: NameDisplayMode) => void
}

const nameDisplayOptions: {value: NameDisplayMode; label: string}[] = [
    {value: 'words', label: 'Słownie'},
    {value: 'symbols', label: 'Same oznaczenia'},
    {value: 'both', label: 'Oznaczenia z nazwą słowną'},
]

export function SettingsPage({nameDisplayMode, onNameDisplayModeChange}: SettingsPageProps) {
    return (
        <section className="flex flex-col gap-6">
            <header>
                <p className="font-mono text-xs uppercase tracking-[0.2em] text-mt-accent">Konfiguracja</p>
                <h1 className="mt-1 text-2xl font-bold tracking-tight text-mt-text">Ustawienia</h1>
            </header>

            <fieldset className="flex flex-col gap-4 rounded-2xl border border-mt-border bg-mt-sub-alt p-5">
                <legend className="px-1 text-sm font-medium text-mt-text">Styl wyświetlania nazw i oznaczeń</legend>
                <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
                    {nameDisplayOptions.map((option) => {
                        const selected = nameDisplayMode === option.value
                        return (
                            <button
                                key={option.value}
                                type="button"
                                aria-pressed={selected}
                                onClick={() => onNameDisplayModeChange(option.value)}
                                className={[
                                    'min-h-12 rounded-xl border px-4 py-3 text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-mt-accent',
                                    selected
                                        ? 'border-mt-accent bg-mt-accent/15 text-mt-accent ring-1 ring-mt-accent/40'
                                        : 'border-mt-border bg-mt-bg text-mt-sub hover:border-mt-accent/60 hover:text-mt-text',
                                ].join(' ')}
                            >
                                {option.label}
                            </button>
                        )
                    })}
                </div>
            </fieldset>
        </section>
    )
}

import {useState} from 'react'
import type {SessionDefaults} from '../data/preferences'
import {getSequenceGapPreference, getSessionDefaults, saveSessionDefaults} from '../data/preferences'

interface SettingsPageProps {
    onApplyDefaults: (defaults: SessionDefaults) => void
    onSequenceGapChange: (seconds: number) => void
}

const fieldClass =
    'min-h-11 w-full rounded-lg border border-mt-border bg-mt-bg px-3 text-sm text-mt-text outline-none focus-visible:ring-2 focus-visible:ring-mt-accent'

export function SettingsPage({onApplyDefaults, onSequenceGapChange}: SettingsPageProps) {
    const [defaults, setDefaults] = useState(getSessionDefaults)
    const [sequenceGap, setSequenceGap] = useState(getSequenceGapPreference)
    const [saved, setSaved] = useState(false)

    const updateDefaults = (changes: Partial<SessionDefaults>) => {
        setDefaults((previous) => ({...previous, ...changes}))
        setSaved(false)
    }

    const save = () => {
        saveSessionDefaults(defaults)
        onApplyDefaults(defaults)
        setSaved(true)
    }

    const changeSequenceGap = (value: number) => {
        setSequenceGap(value)
        onSequenceGapChange(value)
    }

    const resetStorage = () => {
        if (!window.confirm('Czy na pewno usunąć wszystkie zapisane ustawienia i dane tej aplikacji?')) return
        const appKeys = Object.keys(window.localStorage).filter((key) => key.startsWith('ear-trainer-'))
        appKeys.forEach((key) => window.localStorage.removeItem(key))
        window.location.reload()
    }

    return (
        <section className="flex flex-col gap-6">
            <header>
                <p className="font-mono text-xs uppercase tracking-[0.2em] text-mt-accent">Konfiguracja</p>
                <h1 className="mt-1 text-2xl font-bold tracking-tight text-mt-text">Ustawienia</h1>
                <p className="mt-2 text-sm text-mt-sub">Zmień domyślne parametry przyszłych sesji i brzmienia.</p>
            </header>

            <div className="grid gap-5 rounded-2xl border border-mt-border bg-mt-sub-alt p-5 sm:grid-cols-2">
                <label className="flex flex-col gap-2 text-sm text-mt-sub">
                    Domyślny moduł
                    <select
                        className={fieldClass}
                        value={defaults.category}
                        onChange={(event) => updateDefaults({category: event.target.value as SessionDefaults['category']})}
                    >
                        <option value="intervals">Interwały</option>
                        <option value="triads">Trójdźwięki</option>
                        <option value="chords">Czterodźwięki</option>
                    </select>
                </label>
                <label className="flex flex-col gap-2 text-sm text-mt-sub">
                    Domyślny tryb sesji
                    <select
                        className={fieldClass}
                        value={defaults.mode}
                        onChange={(event) => updateDefaults({mode: event.target.value as SessionDefaults['mode']})}
                    >
                        <option value="count">Liczba zadań</option>
                        <option value="time">Na czas</option>
                    </select>
                </label>
                <label className="flex flex-col gap-2 text-sm text-mt-sub">
                    Liczba zadań
                    <select
                        className={fieldClass}
                        value={defaults.count}
                        onChange={(event) => updateDefaults({count: Number(event.target.value)})}
                    >
                        {[10, 20, 50].map((count) => <option key={count} value={count}>{count}</option>)}
                    </select>
                </label>
                <label className="flex flex-col gap-2 text-sm text-mt-sub">
                    Czas sesji
                    <select
                        className={fieldClass}
                        value={defaults.seconds}
                        onChange={(event) => updateDefaults({seconds: Number(event.target.value)})}
                    >
                        {[15, 30, 60].map((seconds) => <option key={seconds} value={seconds}>{seconds} s</option>)}
                    </select>
                </label>
                <label className="flex flex-col gap-2 text-sm text-mt-sub sm:col-span-2">
                    Domyślny kierunek odtwarzania
                    <select
                        className={fieldClass}
                        value={defaults.direction}
                        onChange={(event) => updateDefaults({direction: event.target.value as SessionDefaults['direction']})}
                    >
                        <option value="random">Losowo</option>
                        <option value="up">W górę</option>
                        <option value="down">W dół</option>
                        <option value="harmonic">Harmonicznie</option>
                    </select>
                </label>

                <div className="flex flex-col gap-2 text-sm text-mt-sub sm:col-span-2">
                    <label htmlFor="sequence-gap">Odstęp między nutami sekwencji</label>
                    <div className="flex items-center gap-4">
                        <input
                            id="sequence-gap"
                            type="range"
                            min="0.1"
                            max="1"
                            step="0.05"
                            value={sequenceGap}
                            onChange={(event) => changeSequenceGap(Number(event.target.value))}
                            className="w-full accent-mt-accent"
                        />
                        <output htmlFor="sequence-gap" className="w-16 text-right font-mono text-mt-text">
                            {sequenceGap.toFixed(2)} s
                        </output>
                    </div>
                    <p className="text-xs">Ustawienie jest zapisywane automatycznie i dotyczy kolejnych odtworzeń
                        sekwencji.</p>
                </div>
            </div>

            <div className="flex flex-col gap-3 rounded-2xl border border-mt-border bg-mt-sub-alt p-5">
                <h2 className="font-semibold text-mt-text">Skróty klawiszowe</h2>
                <p className="text-sm text-mt-sub">W trakcie ćwiczenia użyj klawiszy 1–9, aby wybrać odpowiedź. Enter
                    odtwarza pytanie ponownie, a Escape kończy sesję.</p>
            </div>

            <div className="flex flex-wrap items-center gap-3">
                <button
                    type="button"
                    onClick={save}
                    className="min-h-11 rounded-lg bg-mt-accent px-5 text-sm font-semibold text-mt-bg transition-opacity hover:opacity-90"
                >
                    Zapisz domyślne ustawienia sesji
                </button>
                {saved && <span role="status" className="text-sm text-mt-success">Ustawienia sesji zapisane.</span>}
                <button
                    type="button"
                    onClick={resetStorage}
                    className="min-h-11 rounded-lg border border-mt-error/50 px-5 text-sm text-mt-error transition-colors hover:bg-mt-error/10"
                >
                    Resetuj zapisane dane
                </button>
            </div>
        </section>
    )
}

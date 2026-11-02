import {PLAY_MODE_GLYPHS, PLAY_MODE_LABELS} from '../data/directions'
import type {SessionConfig, TaskResult} from '../types'
import {FontAwesomeIcon} from '@fortawesome/react-fontawesome'
import {faArrowRotateRight, faVolumeHigh} from '@fortawesome/free-solid-svg-icons'
import {ThemeToggle} from './ThemeToggle'

interface ResultsAreaProps {
    config: SessionConfig
    correct: number
    wrong: number
    history: TaskResult[]
    isDark: boolean
    onToggleTheme: () => void
    onNewSession: () => void
    onReplayTask: (task: TaskResult) => void
}

export function ResultsArea({
                                config,
                                correct,
                                wrong,
                                history,
                                isDark,
                                onToggleTheme,
                                onNewSession,
                                onReplayTask,
                            }: ResultsAreaProps) {
    const total = correct + wrong
    const accuracy = total > 0 ? Math.round((correct / total) * 100) : 0
    const averageMs =
        history.length > 0
            ? history.reduce((sum, task) => sum + task.elapsedMs, 0) / history.length
            : 0
    const averageLabel = `${(averageMs / 1000).toFixed(1)}s`

    return (
        <section className="flex flex-col gap-6">
            <header className="flex items-center justify-between">
                <div>
                    <p className="font-mono text-xs uppercase tracking-[0.2em] text-mt-accent">Podsumowanie</p>
                    <h1 className="mt-1 text-2xl font-bold tracking-tight text-mt-text">
                        {config.mode === 'count' ? 'Koniec sesji' : `Sesja ${config.seconds}s`}
                    </h1>
                </div>
                <ThemeToggle isDark={isDark} onToggle={onToggleTheme}/>
            </header>

            <div
                className="grid grid-cols-3 gap-2 rounded-2xl border border-mt-border bg-mt-sub-alt p-3 sm:gap-4 sm:p-6">
                <div className="rounded-xl border border-mt-border bg-mt-bg p-3 text-center sm:p-5">
                    <p className="text-[10px] uppercase tracking-wider text-mt-sub sm:text-xs">Wynik</p>
                    <p className="mt-2 font-mono text-xl font-bold tabular-nums text-mt-accent sm:text-3xl">
                        {correct}<span className="text-sm text-mt-sub sm:text-lg">/{total}</span>
                    </p>
                </div>
                <div className="rounded-xl border border-mt-border bg-mt-bg p-3 text-center sm:p-5">
                    <p className="text-[10px] uppercase tracking-wider text-mt-sub sm:text-xs">Skuteczność</p>
                    <p className="mt-2 font-mono text-xl font-bold tabular-nums text-mt-accent sm:text-3xl">
                        {accuracy}%
                    </p>
                </div>
                <div className="rounded-xl border border-mt-border bg-mt-bg p-3 text-center sm:p-5">
                    <p className="text-[10px] uppercase tracking-wider text-mt-sub sm:text-xs">Śr. czas</p>
                    <p className="mt-2 font-mono text-xl font-bold tabular-nums text-mt-text sm:text-3xl">
                        {averageLabel}
                    </p>
                </div>
            </div>
            <p className="text-center text-xs text-mt-sub">
                Trafienia: <span className="font-mono text-mt-success">{correct}</span>
                <span className="px-2">·</span>
                Błędy: <span className="font-mono text-mt-error">{wrong}</span>
            </p>

            {history.length > 0 ? (
                <ul className="flex max-h-[35vh] flex-col gap-2 overflow-y-auto pr-1 sm:max-h-[40vh]">
                    {history.map((task) => (
                        <li
                            key={task.taskId}
                            className="flex items-center gap-3 rounded-xl border border-mt-border bg-mt-sub-alt px-3 py-2.5"
                        >
              <span className="w-8 shrink-0 font-mono text-sm tabular-nums text-mt-sub">
                #{task.taskId}
              </span>

                            <span
                                className="w-6 shrink-0 text-center text-lg text-mt-sub"
                                title={PLAY_MODE_LABELS[task.playMode]}
                                aria-label={`Tryb odtwarzania: ${PLAY_MODE_LABELS[task.playMode]}`}
                            >
                {PLAY_MODE_GLYPHS[task.playMode]}
              </span>

                            <div className="min-w-0 flex-1">
                                {task.isCorrect ? (
                                    <p className="truncate text-sm text-mt-success">
                                        Twoja odpowiedź: {task.userAnswer} <span aria-hidden="true">✓</span>
                                    </p>
                                ) : (
                                    <>
                                        <p className="truncate text-sm text-mt-error">
                                            Twoja odpowiedź: {task.userAnswer} <span aria-hidden="true">✕</span>
                                        </p>
                                        <p className="truncate text-xs text-mt-success">
                                            Poprawna: {task.correctAnswer} <span aria-hidden="true">✓</span>
                                        </p>
                                    </>
                                )}
                                <p className="mt-0.5 truncate text-[11px] text-mt-sub/70 tabular-nums">
                                    {task.notesToPlay.join(', ')}
                                </p>
                            </div>

                            <button
                                type="button"
                                onClick={() => onReplayTask(task)}
                                aria-label={`Odsłuchaj zadanie #${task.taskId}`}
                                title="Odsłuchaj"
                                className="flex h-10 w-10 shrink-0 touch-manipulation items-center justify-center rounded-xl border border-mt-border text-mt-sub transition-colors duration-150 hover:border-mt-accent hover:text-mt-accent active:scale-95"
                            >
                                <FontAwesomeIcon icon={faVolumeHigh} aria-hidden="true"/>
                            </button>
                        </li>
                    ))}
                </ul>
            ) : (
                <p className="text-center text-sm text-mt-sub">Brak rozwiązanych zadań w tej sesji.</p>
            )}

            <div className="flex w-full justify-center pt-2">
                <button
                    type="button"
                    onClick={onNewSession}
                    className="min-h-12 w-full touch-manipulation rounded-xl bg-mt-accent px-8 py-3 text-sm font-bold uppercase tracking-widest text-mt-bg shadow-lg shadow-brand-400/10 transition-all duration-150 hover:-translate-y-0.5 hover:bg-brand-300 active:scale-[0.99] sm:w-auto sm:min-w-72"
                >
                    <FontAwesomeIcon icon={faArrowRotateRight} className="mr-2" aria-hidden="true"/>
                    Nowa sesja
                </button>
            </div>
        </section>
    )
}

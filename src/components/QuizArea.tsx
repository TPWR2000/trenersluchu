import type {AnswerOption, Feedback, Question, SessionConfig} from '../types'
import {FontAwesomeIcon} from '@fortawesome/react-fontawesome'
import {faVolumeHigh, faXmark} from '@fortawesome/free-solid-svg-icons'
import {ThemeToggle} from './ThemeToggle'

interface QuizAreaProps {
    config: SessionConfig
    question: Question | null
    answerOptions: AnswerOption[]
    correctKey: string | null
    feedback: Feedback | null
    correct: number
    wrong: number
    answered: number
    timeLeft: number
    isDark: boolean
    onToggleTheme: () => void
    onAnswer: (key: string) => void
    onRepeat: () => void
    onQuit: () => void
}

export function QuizArea({
                             config,
                             question,
                             answerOptions,
                             correctKey,
                             feedback,
                             correct,
                             wrong,
                             answered,
                             timeLeft,
                             isDark,
                             onToggleTheme,
                             onAnswer,
                             onRepeat,
                             onQuit,
                         }: QuizAreaProps) {
    const locked = feedback !== null
    const isTimeMode = config.mode === 'time'
    const secondsLeft = Math.ceil(timeLeft / 1000)
    const taskTotal = Math.max(config.count, 1)
    const taskProgress = Math.min(answered + (locked ? 0 : 1), taskTotal)
    const counterValue = isTimeMode ? `${secondsLeft}s` : `${taskProgress}/${taskTotal}`
    const counterLabel = isTimeMode ? 'Czas' : 'Zadanie'
    const urgent = isTimeMode && secondsLeft <= 10

    const answerClass = (key: string) => {
        if (feedback && feedback.chosen === key) {
            return feedback.correct
                ? 'border-mt-success bg-mt-success/20 text-mt-success'
                : 'border-mt-error bg-mt-error/20 text-mt-error'
        }
        if (feedback && !feedback.correct && key === correctKey) {
            return 'border-mt-success bg-mt-success/10 text-mt-success'
        }
        return 'border-mt-border text-mt-text hover:border-mt-accent hover:text-mt-accent active:bg-mt-accent/10'
    }

    const gridCols = 'grid grid-cols-3 gap-2 sm:grid-cols-4 sm:gap-2.5 lg:grid-cols-5 xl:grid-cols-6'

    const replayDisabled = locked || !question
    const progress = isTimeMode
        ? Math.max(0, Math.min(100, (timeLeft / (config.seconds * 1000)) * 100))
        : (taskProgress / taskTotal) * 100

    return (
        <section className="flex min-h-dvh w-full flex-col px-4 pb-4 pt-5 sm:px-6 sm:pb-6">
            <header className="mx-auto flex w-full max-w-5xl items-center justify-between gap-3">
                <div className="flex flex-col">
          <span className="font-mono text-[10px] uppercase tracking-[0.2em] text-mt-sub">
            trener słuchu · {counterLabel}
          </span>
                    <span
                        className={[
                            'font-mono text-4xl font-bold tabular-nums leading-none sm:text-5xl',
                            urgent ? 'text-mt-error' : 'text-mt-accent',
                        ].join(' ')}
                    >
            {counterValue}
          </span>
                </div>

                <div className="flex items-center gap-3">
          <span className="font-mono text-sm tabular-nums">
            <span className="text-mt-success">{correct}</span>
            <span className="px-1 opacity-50">/</span>
            <span className="text-mt-error">{wrong}</span>
          </span>
                    <ThemeToggle isDark={isDark} onToggle={onToggleTheme}/>
                    <button
                        type="button"
                        onClick={onQuit}
                        aria-label="Anuluj sesję"
                        title="Anuluj sesję"
                        className="flex h-10 w-10 touch-manipulation items-center justify-center rounded-xl border border-mt-border text-lg text-mt-sub transition-colors duration-150 hover:border-mt-error/70 hover:text-mt-error active:scale-95"
                    >
                        <FontAwesomeIcon icon={faXmark} aria-hidden="true"/>
                    </button>
                </div>
            </header>

            <div className="mx-auto mt-4 h-1 w-full max-w-5xl overflow-hidden rounded-full bg-mt-sub-alt"
                 aria-label="Postęp sesji">
                <div
                    className="h-full rounded-full bg-mt-accent transition-[width] duration-300 shadow-lg shadow-brand-400/10"
                    style={{width: `${progress}%`}}
                />
            </div>

            <div className="flex flex-1 flex-col items-center justify-center gap-3 py-5 sm:gap-4">
                <button
                    type="button"
                    onClick={onRepeat}
                    disabled={replayDisabled}
                    aria-label="Odtwórz ponownie"
                    title="Odtwórz ponownie"
                    className={[
                        'relative flex h-32 w-32 touch-manipulation items-center justify-center rounded-full border border-mt-border bg-mt-sub-alt text-mt-accent shadow-lg shadow-brand-400/10 transition-all duration-200 outline-none sm:h-36 sm:w-36',
                        replayDisabled ? 'opacity-60' : 'hover:scale-105 hover:border-mt-accent focus-visible:ring-2 focus-visible:ring-mt-accent',
                    ].join(' ')}
                >
                    <FontAwesomeIcon icon={faVolumeHigh} className="text-4xl sm:text-5xl" aria-hidden="true"/>
                </button>

                <span className="font-mono text-xs font-bold uppercase tracking-[0.2em] text-mt-sub">
          Powtórz
        </span>

                {locked && (
                    <span
                        className={[
                            'text-xs uppercase tracking-[0.3em]',
                            feedback?.correct ? 'text-mt-success' : 'text-mt-error',
                        ].join(' ')}
                    >
            {feedback?.correct ? 'Trafiłeś' : 'Pudło'}
          </span>
                )}
            </div>

            <div className={`mx-auto grid w-full max-w-5xl ${gridCols}`}>
                {answerOptions.map((option) => (
                    <button
                        key={option.key}
                        type="button"
                        disabled={locked}
                        onClick={() => onAnswer(option.key)}
                        className={[
                            'flex min-h-14 touch-manipulation flex-col items-center justify-center gap-1 rounded-xl border border-mt-border bg-mt-sub-alt p-2 transition-all duration-200 outline-none hover:-translate-y-0.5 focus-visible:ring-2 focus-visible:ring-mt-accent',
                            locked ? 'cursor-not-allowed' : '',
                            answerClass(option.key),
                        ].join(' ')}
                    >
                        <span className="font-mono text-base font-bold leading-none">{option.short}</span>
                        <span className="text-center text-[10px] leading-tight text-mt-sub sm:text-xs">
              {option.name}
            </span>
                    </button>
                ))}
            </div>
        </section>
    )
}

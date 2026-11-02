import type { AnswerOption, Feedback, Question, SessionConfig } from '../types'
import { ThemeToggle } from './ThemeToggle'

function SpeakerIcon({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.8}
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      aria-hidden="true"
    >
      <path d="M11 5 6 9H2v6h4l5 4V5Z" />
      <path d="M15.5 8.5a5 5 0 0 1 0 7" />
      <path d="M18.5 5.5a9 9 0 0 1 0 13" />
    </svg>
  )
}

function RepeatIcon({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.8}
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      aria-hidden="true"
    >
      <path d="M17 2l4 4-4 4" />
      <path d="M3 11v-1a4 4 0 0 1 4-4h14" />
      <path d="M7 22l-4-4 4-4" />
      <path d="M21 13v1a4 4 0 0 1-4 4H3" />
    </svg>
  )
}

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
    return 'border-mt-sub/40 text-mt-text hover:border-mt-accent hover:text-mt-accent active:bg-mt-accent/10'
  }

  const gridCols = 'grid grid-cols-3 gap-2 sm:grid-cols-4 lg:grid-cols-5'

  const replayDisabled = locked || !question

  return (
    <section className="flex min-h-dvh w-full flex-col px-4 pb-4 pt-5 sm:px-6 sm:pb-6">
      <header className="mx-auto flex w-full max-w-2xl items-start justify-between gap-3">
        <div className="flex flex-col">
          <span className="text-xs uppercase tracking-[0.2em] text-mt-sub">{counterLabel}</span>
          <span
            className={[
              'text-5xl font-bold tabular-nums leading-none sm:text-6xl',
              urgent ? 'text-mt-error' : 'text-mt-text',
            ].join(' ')}
          >
            {counterValue}
          </span>
        </div>

        <div className="flex items-center gap-3">
          <span className="tabular-nums text-sm">
            <span className="text-mt-success">{correct}</span>
            <span className="px-1 opacity-50">/</span>
            <span className="text-mt-error">{wrong}</span>
          </span>
          <ThemeToggle isDark={isDark} onToggle={onToggleTheme} />
          <button
            type="button"
            onClick={onQuit}
            aria-label="Anuluj sesję"
            title="Anuluj sesję"
            className="flex h-11 w-11 touch-manipulation items-center justify-center rounded border border-mt-sub/40 text-lg text-mt-sub transition-colors duration-150 hover:border-mt-error/70 hover:text-mt-error active:scale-95"
          >
            ✕
          </button>
        </div>
      </header>

      <div className="flex flex-1 flex-col items-center justify-center gap-4 py-6">
        <button
          type="button"
          onClick={onRepeat}
          disabled={replayDisabled}
          aria-label="Odtwórz ponownie"
          title="Odtwórz ponownie"
          className={[
            'relative flex h-36 w-full max-w-64 touch-manipulation items-center justify-center rounded-3xl border border-neutral-800 bg-mt-accent/10 px-4 transition-all duration-200 outline-none sm:h-40',
            replayDisabled ? 'opacity-70' : 'hover:-translate-y-0.5',
          ].join(' ')}
        >
          {!replayDisabled && (
            <span
              className="absolute inset-0 animate-pulse rounded-3xl bg-mt-accent/10"
              aria-hidden="true"
            />
          )}
          <SpeakerIcon
            className={`relative h-14 w-14 sm:h-16 sm:w-16 ${replayDisabled ? 'text-mt-sub' : 'text-mt-accent'}`}
          />
        </button>

        <span className="flex items-center gap-2 text-sm font-bold uppercase tracking-widest text-mt-sub">
          <RepeatIcon className="h-4 w-4" />
          Odtwórz ponownie
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

      <div className={`mx-auto grid w-full max-w-2xl gap-2.5 ${gridCols}`}>
        {answerOptions.map((option) => (
          <button
            key={option.key}
            type="button"
            disabled={locked}
            onClick={() => onAnswer(option.key)}
            className={[
              'flex min-h-12 touch-manipulation flex-col items-center justify-center gap-0.5 rounded-xl border border-neutral-800 dark:border-neutral-700 bg-transparent p-2 transition-all duration-200 outline-none hover:-translate-y-0.5',
              locked ? 'cursor-not-allowed' : '',
              answerClass(option.key),
            ].join(' ')}
          >
            <span className="text-lg font-bold leading-none">{option.short}</span>
            <span className="text-xs leading-tight text-neutral-400 dark:text-neutral-400">
              {option.name}
            </span>
          </button>
        ))}
      </div>
    </section>
  )
}

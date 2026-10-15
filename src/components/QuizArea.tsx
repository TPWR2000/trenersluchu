import { INTERVALS } from '../data/intervals'
import type { Feedback, Question, SessionConfig } from '../types'

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
  feedback: Feedback | null
  selected: number[]
  correct: number
  wrong: number
  answered: number
  timeLeft: number
  onAnswer: (semitones: number) => void
  onRepeat: () => void
  onQuit: () => void
}

export function QuizArea({
  config,
  question,
  feedback,
  selected,
  correct,
  wrong,
  answered,
  timeLeft,
  onAnswer,
  onRepeat,
  onQuit,
}: QuizAreaProps) {
  const locked = feedback !== null
  const isTimeMode = config.mode === 'time'
  const secondsLeft = Math.ceil(timeLeft / 1000)
  const counterValue = isTimeMode
    ? `${secondsLeft}s`
    : `${Math.min(answered + (locked ? 0 : 1), config.count)}/${config.count}`
  const counterLabel = isTimeMode ? 'Czas' : 'Zadanie'
  const urgent = isTimeMode && secondsLeft <= 10

  const answerClass = (semitones: number) => {
    if (feedback && feedback.chosen === semitones) {
      return feedback.correct
        ? 'border-mt-success bg-mt-success/20 text-mt-success'
        : 'border-mt-error bg-mt-error/20 text-mt-error'
    }
    if (feedback && !feedback.correct && semitones === question?.semitones) {
      return 'border-mt-success bg-mt-success/10 text-mt-success'
    }
    return 'border-mt-sub/40 text-mt-text hover:border-mt-accent hover:text-mt-accent active:bg-mt-accent/10'
  }

  const activeIntervals = INTERVALS.filter((interval) => selected.includes(interval.semitones))
  const gridCols =
    activeIntervals.length <= 4
      ? 'grid-cols-2'
      : 'grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5'

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
          className={[
            'flex h-28 w-28 touch-manipulation items-center justify-center rounded-full transition-transform duration-150 sm:h-32 sm:w-32',
            replayDisabled
              ? 'cursor-not-allowed bg-mt-sub/20 text-mt-sub'
              : 'bg-mt-accent text-mt-bg hover:bg-mt-accent/85 active:scale-95',
          ].join(' ')}
        >
          <SpeakerIcon className="h-14 w-14 sm:h-16 sm:w-16" />
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
        {activeIntervals.map((interval) => (
          <button
            key={interval.semitones}
            type="button"
            disabled={locked}
            onClick={() => onAnswer(interval.semitones)}
            className={[
              'flex min-h-12 touch-manipulation flex-col items-center justify-center gap-0.5 rounded border px-3 py-2 transition-colors duration-150 outline-none',
              locked ? 'cursor-not-allowed' : '',
              answerClass(interval.semitones),
            ].join(' ')}
          >
            <span className="text-lg font-bold leading-none">{interval.short}</span>
            <span className="text-[11px] leading-tight">{interval.name}</span>
          </button>
        ))}
      </div>
    </section>
  )
}

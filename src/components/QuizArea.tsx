import { DIRECTION_SOURCE_LABELS, RESOLVED_DIRECTION_LABELS } from '../data/directions'
import { INTERVALS } from '../data/intervals'
import type { Feedback, Question, SessionConfig } from '../types'

const pluralizeIntervals = (count: number) => {
  if (count === 1) return 'interwał'
  const lastTwo = count % 100
  const last = count % 10
  if (last >= 2 && last <= 4 && !(lastTwo >= 12 && lastTwo <= 14)) return 'interwały'
  return 'interwałów'
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
}: QuizAreaProps) {
  const locked = feedback !== null
  const isTimeMode = config.mode === 'time'
  const secondsLeft = Math.ceil(timeLeft / 1000)
  const counterLabel = isTimeMode
    ? `${secondsLeft}s`
    : `Pytanie ${Math.min(answered + 1, config.count)} / ${config.count}`

  const answerClass = (semitones: number) => {
    if (feedback && feedback.chosen === semitones) {
      return feedback.correct
        ? 'border-mt-success bg-mt-success/20 text-mt-success'
        : 'border-mt-error bg-mt-error/20 text-mt-error'
    }
    if (feedback && !feedback.correct && semitones === question?.semitones) {
      return 'border-mt-success bg-mt-success/10 text-mt-success'
    }
    return 'border-mt-sub/40 text-mt-text hover:border-mt-accent hover:text-mt-accent'
  }

  return (
    <section className="flex flex-col gap-8">
      <div className="flex items-center justify-between text-sm">
        <span className="uppercase tracking-[0.2em] text-mt-sub">
          {isTimeMode ? 'Czas' : 'Zadania'}
        </span>
        <span
          className={[
            'text-4xl font-bold tabular-nums',
            isTimeMode && secondsLeft <= 10 ? 'text-mt-error' : 'text-mt-text',
          ].join(' ')}
        >
          {counterLabel}
        </span>
        <span className="tabular-nums text-mt-sub">
          <span className="text-mt-success">{correct}</span>
          <span className="px-1 opacity-50">/</span>
          <span className="text-mt-error">{wrong}</span>
        </span>
      </div>

      <div className="flex flex-col items-center gap-4 rounded border border-mt-sub/25 bg-mt-sub-alt px-6 py-8">
        <span className="text-xs uppercase tracking-[0.3em] text-mt-sub">
          {locked ? feedback?.correct ? 'Trafiłeś' : 'Pudło' : 'Słuchaj…'}
        </span>

        <button
          type="button"
          onClick={onRepeat}
          disabled={locked || !question}
          className={[
            'flex items-center gap-3 rounded px-8 py-4 text-lg font-bold uppercase tracking-widest transition-colors duration-150',
            locked || !question
              ? 'cursor-not-allowed bg-mt-sub/20 text-mt-sub'
              : 'bg-mt-accent text-mt-bg hover:bg-mt-accent/85',
          ].join(' ')}
        >
          <span aria-hidden="true">↻</span>
          Powtórz dźwięk
        </button>

        <p className="text-xs text-mt-sub">
          {question && (
            <>
              Kierunek: {RESOLVED_DIRECTION_LABELS[question.direction].toLowerCase()} (
              {DIRECTION_SOURCE_LABELS[question.directionSource].toLowerCase()}) ·{' '}
            </>
          )}
          {selected.length} {pluralizeIntervals(selected.length)} w grze
        </p>
      </div>

      <div className="grid grid-cols-2 gap-2 sm:grid-cols-3 md:grid-cols-4">
        {INTERVALS.filter((interval) => selected.includes(interval.semitones)).map((interval) => (
          <button
            key={interval.semitones}
            type="button"
            disabled={locked}
            onClick={() => onAnswer(interval.semitones)}
            className={[
              'flex flex-col items-center gap-0.5 rounded border px-3 py-3 transition-colors duration-150 outline-none',
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

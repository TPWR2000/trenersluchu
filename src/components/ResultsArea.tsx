import { DIRECTION_GLYPHS } from '../data/directions'
import type { SessionConfig, TaskResult } from '../types'

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

interface ResultsAreaProps {
  config: SessionConfig
  correct: number
  wrong: number
  history: TaskResult[]
  onNewSession: () => void
  onReplayTask: (task: TaskResult) => void
}

export function ResultsArea({
  config,
  correct,
  wrong,
  history,
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
      <div className="text-center">
        <p className="text-xs uppercase tracking-[0.3em] text-mt-sub">
          {config.mode === 'count' ? 'Koniec sesji' : `Wynik w ${config.seconds}s`}
        </p>
        <p className="mt-2 text-4xl font-bold tabular-nums text-mt-accent sm:text-5xl">
          Wynik: {correct}/{total} ({accuracy}%)
        </p>
        <p className="mt-2 flex flex-wrap items-center justify-center gap-x-5 gap-y-1 text-sm text-mt-sub">
          <span>
            Średni czas: <span className="tabular-nums text-mt-text">{averageLabel}</span>
          </span>
          <span>
            Trafienia: <span className="tabular-nums text-mt-success">{correct}</span>
          </span>
          <span>
            Błędy: <span className="tabular-nums text-mt-error">{wrong}</span>
          </span>
        </p>
      </div>

      {history.length > 0 ? (
        <ul className="flex max-h-[55vh] flex-col gap-2 overflow-y-auto pr-1 sm:max-h-[60vh]">
          {history.map((task) => (
            <li
              key={task.taskId}
              className="flex items-center gap-3 rounded border border-mt-sub/25 bg-mt-sub-alt px-3 py-2.5"
            >
              <span className="w-8 shrink-0 text-sm tabular-nums text-mt-sub">#{task.taskId}</span>

              <span
                className="w-6 shrink-0 text-center text-lg text-mt-sub"
                title={task.playMode}
                aria-label={`Kierunek: ${task.playMode}`}
              >
                {DIRECTION_GLYPHS[task.direction]}
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
                      Poprawna: {task.intervalName} <span aria-hidden="true">✓</span>
                    </p>
                  </>
                )}
                <p className="mt-0.5 truncate text-[11px] text-mt-sub/70 tabular-nums">
                  {task.notesToPlay.join(' → ')}
                </p>
              </div>

              <button
                type="button"
                onClick={() => onReplayTask(task)}
                aria-label={`Odsłuchaj zadanie #${task.taskId}`}
                title="Odsłuchaj"
                className="flex h-11 w-11 shrink-0 touch-manipulation items-center justify-center rounded border border-mt-sub/40 text-mt-sub transition-colors duration-150 hover:border-mt-accent hover:text-mt-accent active:scale-95"
              >
                <SpeakerIcon className="h-5 w-5" />
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
          className="min-h-12 w-full touch-manipulation rounded bg-mt-accent px-8 py-3 text-sm font-bold uppercase tracking-widest text-mt-bg transition-colors duration-150 hover:bg-mt-accent/85 active:scale-[0.99] sm:w-auto sm:min-w-72"
        >
          Nowa sesja / Powrót
        </button>
      </div>
    </section>
  )
}

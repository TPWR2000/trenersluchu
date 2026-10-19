import type { ReactNode } from 'react'
import type { SamplesStatus } from '../audio/engine'

interface StartControlsProps {
  samplesStatus: SamplesStatus
  disabled: boolean
  hint: string
  onStart: () => void
  children?: ReactNode
}

export function StartControls({
  samplesStatus,
  disabled,
  hint,
  onStart,
  children,
}: StartControlsProps) {
  const loading = samplesStatus === 'idle' || samplesStatus === 'loading'
  const failed = samplesStatus === 'error'
  const blocked = disabled || loading || failed

  return (
    <div className="flex flex-col items-center gap-3">
      {children}

      {loading && (
        <p className="animate-pulse text-sm text-mt-accent" role="status" aria-live="polite">
          Ładowanie brzmienia pianina...
        </p>
      )}
      {failed && (
        <p className="text-sm text-mt-error" role="alert">
          Nie udało się pobrać brzmień pianina — sprawdź połączenie i odśwież stronę.
        </p>
      )}

      <button
        type="button"
        disabled={blocked}
        onClick={onStart}
        className={[
          'min-h-12 w-full touch-manipulation rounded px-10 py-3 text-lg font-bold uppercase tracking-widest transition-colors duration-150 sm:w-auto',
          blocked
            ? 'cursor-not-allowed bg-mt-sub/30 text-mt-sub'
            : 'bg-mt-accent text-mt-bg hover:bg-mt-accent/85 active:scale-[0.99]',
        ].join(' ')}
      >
        {loading ? 'Ładowanie brzmienia pianina...' : 'Start'}
      </button>

      <p className="max-w-md text-center text-xs text-mt-sub">{hint}</p>
    </div>
  )
}

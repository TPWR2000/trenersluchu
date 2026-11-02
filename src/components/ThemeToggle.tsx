interface ThemeToggleIconsProps {
  className?: string
}

function SunIcon({ className }: ThemeToggleIconsProps) {
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
      <circle cx="12" cy="12" r="4" />
      <path d="M12 2v2.5M12 19.5V22M2 12h2.5M19.5 12H22M4.2 4.2l1.8 1.8M17.9 17.9l1.8 1.8M19.8 4.2l-1.8 1.8M7.1 16.9l-1.8 1.8" />
    </svg>
  )
}

function MoonIcon({ className }: ThemeToggleIconsProps) {
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
      <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79Z" />
    </svg>
  )
}

interface ThemeToggleProps {
  isDark: boolean
  onToggle: () => void
}

export function ThemeToggle({ isDark, onToggle }: ThemeToggleProps) {
  const label = isDark ? 'Przełącz na tryb jasny' : 'Przełącz na tryb ciemny'

  return (
    <button
      type="button"
      onClick={onToggle}
      aria-label={label}
      title={label}
      aria-pressed={!isDark}
      className="flex h-11 w-11 touch-manipulation items-center justify-center rounded-full border border-mt-sub/40 text-mt-sub transition-colors duration-150 outline-none hover:border-mt-accent hover:text-mt-accent active:scale-95"
    >
      <SunIcon className={isDark ? 'h-6 w-6' : 'hidden h-6 w-6'} />
      <MoonIcon className={isDark ? 'hidden h-6 w-6' : 'h-6 w-6'} />
    </button>
  )
}

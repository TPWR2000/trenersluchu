import type {Category, PlayDirection, SessionConfig, SessionMode} from '../types'

const SESSION_DEFAULTS_KEY = 'ear-trainer-session-defaults'
export const SEQUENCE_GAP_KEY = 'ear-trainer-sequence-gap'

export type SessionDefaults = Pick<
    SessionConfig,
    'category' | 'mode' | 'count' | 'seconds' | 'direction'
>

export const DEFAULT_SESSION_PREFERENCES: SessionDefaults = {
    category: 'intervals',
    mode: 'count',
    count: 10,
    seconds: 60,
    direction: 'random',
}

const categories: Category[] = ['intervals', 'triads', 'chords']
const modes: SessionMode[] = ['count', 'time']
const directions: PlayDirection[] = ['random', 'up', 'down', 'harmonic']

function isSessionDefaults(value: unknown): value is SessionDefaults {
    if (!value || typeof value !== 'object') return false
    const defaults = value as Record<string, unknown>
    return (
        categories.includes(defaults.category as Category) &&
        modes.includes(defaults.mode as SessionMode) &&
        [10, 20, 50].includes(defaults.count as number) &&
        [15, 30, 60].includes(defaults.seconds as number) &&
        directions.includes(defaults.direction as PlayDirection)
    )
}

export function getSessionDefaults(): SessionDefaults {
    const stored = window.localStorage.getItem(SESSION_DEFAULTS_KEY)
    if (!stored) return DEFAULT_SESSION_PREFERENCES

    try {
        const parsed: unknown = JSON.parse(stored)
        return isSessionDefaults(parsed) ? parsed : DEFAULT_SESSION_PREFERENCES
    } catch {
        return DEFAULT_SESSION_PREFERENCES
    }
}

export function saveSessionDefaults(defaults: SessionDefaults): void {
    window.localStorage.setItem(SESSION_DEFAULTS_KEY, JSON.stringify(defaults))
}

export function getSequenceGapPreference(): number {
    const value = Number(window.localStorage.getItem(SEQUENCE_GAP_KEY))
    return Number.isFinite(value) && value >= 0.1 && value <= 1 ? value : 0.35
}

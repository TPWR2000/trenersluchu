export type Phase = 'setup' | 'running' | 'results'

export type SessionMode = 'count' | 'time'

export type PlayDirection = 'random' | 'up' | 'down' | 'harmonic'

export type ResolvedDirection = Exclude<PlayDirection, 'random'>

export type DirectionSource = 'random' | 'chosen' | 'time'

export interface SessionConfig {
  mode: SessionMode
  count: number
  seconds: number
  direction: PlayDirection
}

export interface Question {
  rootMidi: number
  semitones: number
  direction: ResolvedDirection
  directionSource: DirectionSource
}

export interface Feedback {
  chosen: number
  correct: boolean
}

export interface TaskResult {
  taskId: number
  rootNote: string
  targetNote: string
  intervalName: string
  userAnswer: string
  isCorrect: boolean
  playMode: string
  notesToPlay: string[]
  elapsedMs: number
  rootMidi: number
  semitones: number
  direction: ResolvedDirection
  directionSource: DirectionSource
}

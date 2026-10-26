export type Phase = 'setup' | 'running' | 'results'

export type Category = 'intervals' | 'triads' | 'chords'

export type SessionMode = 'count' | 'time'

export type PlayDirection = 'random' | 'up' | 'down' | 'harmonic'

export type PlayMode = 'asc' | 'desc' | 'harmonic'

export type DirectionSource = 'random' | 'chosen' | 'time'

export type TriadType = 'maj' | 'min' | 'dim' | 'aug'

export type TriadInversion = 'root' | 'first' | 'second'

export type SeventhChordType = 'maj7' | 'm7' | 'dom7' | 'dim7' | 'm7b5'

export type SeventhChordInversion = 'root' | 'first' | 'second' | 'third'

export interface SessionConfig {
  category: Category
  mode: SessionMode
  count: number
  seconds: number
  direction: PlayDirection
}

export interface IntervalQuestion {
  category: 'intervals'
  rootMidi: number
  semitones: number
  playMode: PlayMode
  directionSource: DirectionSource
}

export interface TriadQuestion {
  category: 'triads'
  rootMidi: number
  triadType: TriadType
  inversion: TriadInversion
  notes: number[]
  playMode: PlayMode
  directionSource: DirectionSource
}

export interface ChordQuestion {
  category: 'chords'
  rootMidi: number
  chordType: SeventhChordType
  inversion: SeventhChordInversion
  notes: number[]
  playMode: PlayMode
  directionSource: DirectionSource
}

export type Question = IntervalQuestion | TriadQuestion | ChordQuestion

export interface Feedback {
  chosen: string
  correct: boolean
}

export interface AnswerOption {
  key: string
  short: string
  name: string
}

export interface ReplayPayload {
  notes: number[]
  name: string
  playMode: PlayMode
  directionSource: DirectionSource
}

export interface TaskResult {
  taskId: number
  category: Category
  playMode: PlayMode
  notesToPlay: string[]
  userAnswer: string
  correctAnswer: string
  isCorrect: boolean
  elapsedMs: number
  replay: ReplayPayload
}

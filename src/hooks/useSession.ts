import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import {
  ensureAudio,
  getSamplesStatus,
  initSamples,
  midiToNote,
  playNotes,
  releaseAll,
  subscribeSamplesStatus,
} from '../audio/engine'
import type { SamplesStatus } from '../audio/engine'
import {
  DIRECTION_SOURCE_LABELS,
  PLAY_MODE_LABELS,
  PLAY_MODES,
} from '../data/directions'
import {
  ALL_SEMITONES,
  INTERVALS,
  INTERVAL_BY_SEMITONES,
  intervalKey,
  parseIntervalKey,
} from '../data/intervals'
import {
  ALL_CHORD_COMBINATIONS,
  CHORD_INVERSION_BY_VALUE,
  SEVENTH_CHORD_BY_VALUE,
  chordName,
  chordBadgeLabel,
  chordInversionsFor,
  chordKey,
  chordLabel,
  chordMidiNotes,
  chordPool,
  chordShortLabel,
  isChordInversionAllowed,
  parseChordKey,
} from '../data/chords'
import {
  ALL_TRIAD_COMBINATIONS,
  TRIAD_INVERSION_BY_VALUE,
  TRIAD_TYPE_BY_VALUE,
  isTriadInversionAllowed,
  parseTriadKey,
  triadInversionsFor,
  triadName,
  triadFigure,
  triadSymbol,
  triadKey,
  triadLabel,
  triadMidiNotes,
  triadPool,
} from '../data/triads'
import type {
  AnswerOption,
  Category,
  DirectionSource,
  Feedback,
  NameDisplayMode,
  Phase,
  PlayDirection,
  PlayMode,
  Question,
  SessionConfig,
  SeventhChordInversion,
  SeventhChordType,
  TaskResult,
  TriadInversion,
  TriadType,
} from '../types'
import { getSessionDefaults, type SessionDefaults } from '../data/preferences'

const FEEDBACK_MS = 450
const ROOT_MIN_MIDI = 57
const ROOT_MIDI_RANGE = 10
const TRIAD_ROOT_MIN_MIDI = 48
const TRIAD_ROOT_MIDI_RANGE = 25
const CHORD_ROOT_MIN_MIDI = 48
const CHORD_ROOT_MIDI_RANGE = 20

interface ResolvedPlay {
  playMode: PlayMode
  source: DirectionSource
}
function directionToPlayMode(direction: PlayDirection, source: DirectionSource): ResolvedPlay {
  if (source === 'time') {
    return { playMode: 'harmonic', source }
  }
  switch (direction) {
    case 'random':
      return { playMode: PLAY_MODES[Math.floor(Math.random() * PLAY_MODES.length)], source }
    case 'up':
      return { playMode: 'asc', source }
    case 'down':
      return { playMode: 'desc', source }
    case 'harmonic':
      return { playMode: 'harmonic', source }
  }
}

function intervalNotes(question: Extract<Question, { category: 'intervals' }>): number[] {
  if (question.playMode === 'desc') {
    return [question.rootMidi - question.semitones, question.rootMidi]
  }
  return [question.rootMidi, question.rootMidi + question.semitones]
}

function nameModeLabel(mode: NameDisplayMode): string {
  if (mode === 'words') return 'słownie'
  if (mode === 'symbols') return 'same oznaczenia'
  return 'oznaczenia z nazwą słowną'
}

function questionName(question: Question, nameMode: NameDisplayMode): string {
  if (question.category === 'intervals') {
    const interval = INTERVAL_BY_SEMITONES[question.semitones]
    if (!interval) return 'Nieznany interwał'
    if (nameMode === 'words') return interval.name
    return nameMode === 'symbols' ? interval.short : `${interval.short} · ${interval.name}`
  }
  if (question.category === 'triads') {
    return triadName(question.triadType, question.inversion, nameMode)
  }
  return chordName(question.chordType, question.inversion, nameMode)
}

function questionNotes(question: Question): number[] {
  return question.category === 'intervals' ? intervalNotes(question) : question.notes
}

function questionKey(question: Question): string {
  if (question.category === 'intervals') return intervalKey(question.semitones)
  if (question.category === 'triads') return triadKey(question.triadType, question.inversion)
  return chordKey(question.chordType, question.inversion)
}

function logTriadDetails(question: Extract<Question, { category: 'triads' }>, nameMode: NameDisplayMode, action: string): void {
  const inversion = TRIAD_INVERSION_BY_VALUE[question.inversion]
  const figure = triadFigure(question.inversion)
  const symbol = triadSymbol(question.triadType)
  const usedSymbol = figure ? `${figure} nad ${symbol}` : symbol
  console.log(
    `[AudioEngine - Trójdźwięk] ${action} | Akord: ${TRIAD_TYPE_BY_VALUE[question.triadType].name} | ` +
      `Przewrót: ${inversion.name} | Tryb nazw: ${nameModeLabel(nameMode)} | ` +
      `Użyty symbol: ${usedSymbol} | Nuty: ${question.notes.map(midiToNote).join(', ')}`,
  )
}

function logChordDetails(
  question: Extract<Question, { category: 'chords' }>,
  nameMode: NameDisplayMode,
  action: string,
): void {
  const chord = SEVENTH_CHORD_BY_VALUE[question.chordType]
  const inversion = CHORD_INVERSION_BY_VALUE[question.inversion]
  console.log(
    `[AudioEngine - Czterodźwięk] ${action} | Typ: ${chord.name} | ` +
      `Przewrót: ${inversion.name} | Tryb nazw: ${nameModeLabel(nameMode)} | ` +
      `Znaczek: ${chordBadgeLabel(question.chordType, question.inversion)} | ` +
      `Nuty: ${question.notes.map(midiToNote).join(', ')}`,
  )
}

function logNewQuestion(
  question: Question,
  rootMidi: number,
  play: ResolvedPlay,
  triadNameMode: NameDisplayMode,
): void {
  const notes = questionNotes(question)
  if (question.category === 'triads') {
    logTriadDetails(question, triadNameMode, 'Generowanie zadania')
  }
  if (question.category === 'chords') {
    logChordDetails(question, triadNameMode, 'Generowanie zadania')
  }
  console.log(
    `[Session] Nowe pytanie — ${questionName(question, triadNameMode)}, korzeń MIDI ${rootMidi}, ` +
      `nuty: ${notes.map(midiToNote).join(', ')} (MIDI: ${notes.join(', ')}), ` +
      `kierunek: ${PLAY_MODE_LABELS[play.playMode]} (${DIRECTION_SOURCE_LABELS[play.source]}), ` +
      'tryb odtwarzania zastosowany.',
  )
}

function buildTaskResult(
  taskId: number,
  question: Question,
  chosenKey: string,
  elapsedMs: number,
  triadNameMode: NameDisplayMode,
): TaskResult {
  const notes = questionNotes(question).sort((a, b) => a - b)
  const notesToPlay = notes.map(midiToNote)
  const correctAnswer = questionName(question, triadNameMode)

  if (question.category === 'intervals') {
    const chosen = parseIntervalKey(chosenKey)
    return {
      taskId,
      category: 'intervals',
      playMode: question.playMode,
      notesToPlay,
      userAnswer:
        chosen !== null && INTERVAL_BY_SEMITONES[chosen]
          ? questionName({ ...question, semitones: chosen }, triadNameMode)
          : 'Nieznany interwał',
      correctAnswer,
      isCorrect: chosen === question.semitones,
      elapsedMs,
      replay: {
        notes,
        name: correctAnswer,
        playMode: question.playMode,
        directionSource: question.directionSource,
      },
      interval: {correct: question.semitones, chosen},
    }
  }

  if (question.category === 'triads') {
    const chosen = parseTriadKey(chosenKey)
    return {
      taskId,
      category: 'triads',
      playMode: question.playMode,
      notesToPlay,
      userAnswer: chosen ? triadName(chosen.type, chosen.inversion, triadNameMode) : 'Nieznany trójdźwięk',
      correctAnswer,
      isCorrect: chosen?.type === question.triadType && chosen?.inversion === question.inversion,
      elapsedMs,
      replay: {
        notes,
        name: correctAnswer,
        playMode: question.playMode,
        directionSource: question.directionSource,
      },
      triad: {
        correct: {type: question.triadType, inversion: question.inversion},
        chosen,
      },
    }
  }

  const chosen = parseChordKey(chosenKey)
  return {
    taskId,
    category: 'chords',
    playMode: question.playMode,
    notesToPlay,
    userAnswer: chosen
    ? chordName(chosen.type, chosen.inversion, triadNameMode)
      : 'Nieznany czterodźwięk',
    correctAnswer,
    isCorrect:
      chosen?.type === question.chordType && chosen?.inversion === question.inversion,
    elapsedMs,
    replay: {
      notes,
      name: correctAnswer,
      playMode: question.playMode,
      directionSource: question.directionSource,
    },
    chord: {
      correct: {type: question.chordType, inversion: question.inversion},
      chosen,
    },
  }
}

export interface UseSession {
  phase: Phase
  config: SessionConfig
  selectedIntervals: number[]
  selectedTriads: string[]
  selectedChords: string[]
  answerOptions: AnswerOption[]
  question: Question | null
  correctKey: string | null
  feedback: Feedback | null
  correct: number
  wrong: number
  answered: number
  timeLeft: number
  samplesStatus: SamplesStatus
  history: TaskResult[]
  triadNameMode: NameDisplayMode
  canStart: boolean
  setCategory: (category: Category) => void
  setCount: (count: number) => void
  setSeconds: (seconds: number) => void
  setDirection: (direction: PlayDirection) => void
  applyDefaults: (defaults: SessionDefaults) => void
  toggleInterval: (semitones: number) => void
  selectAllIntervals: () => void
  clearIntervals: () => void
  toggleTriadCombination: (type: TriadType, inversion: TriadInversion) => void
  toggleTriadType: (type: TriadType) => void
  toggleChordCombination: (type: SeventhChordType, inversion: SeventhChordInversion) => void
  toggleChordType: (type: SeventhChordType) => void
  start: () => void
  answer: (key: string) => void
  repeat: () => void
  replayTask: (task: TaskResult) => void
  quit: () => void
  restart: () => void
  goToSetup: () => void
}

export function useSession(triadNameMode: NameDisplayMode): UseSession {
  const [phase, setPhase] = useState<Phase>('setup')
  const [config, setConfig] = useState<SessionConfig>(getSessionDefaults)
  const [selectedIntervals, setSelectedIntervals] = useState<number[]>([...ALL_SEMITONES])
  const [selectedTriads, setSelectedTriads] = useState<string[]>([...ALL_TRIAD_COMBINATIONS])
  const [selectedChords, setSelectedChords] = useState<string[]>([...ALL_CHORD_COMBINATIONS])
  const [question, setQuestion] = useState<Question | null>(null)
  const [feedback, setFeedback] = useState<Feedback | null>(null)
  const [correct, setCorrect] = useState(0)
  const [wrong, setWrong] = useState(0)
  const [timeLeft, setTimeLeft] = useState(0)
  const [history, setHistory] = useState<TaskResult[]>([])
  const [samplesStatus, setSamplesStatus] = useState<SamplesStatus>(getSamplesStatus)

  const configRef = useRef(config)
  const selectedIntervalsRef = useRef(selectedIntervals)
  const selectedTriadsRef = useRef(selectedTriads)
  const selectedChordsRef = useRef(selectedChords)
  const phaseRef = useRef(phase)
  const questionRef = useRef(question)
  const answeredRef = useRef(0)
  const lockedRef = useRef(false)
  const busyRef = useRef(false)
  const endAtRef = useRef(0)
  const startedAtRef = useRef(0)
  const advanceRef = useRef<number | null>(null)

  useEffect(() => {
    configRef.current = config
  }, [config])

  useEffect(() => {
    selectedIntervalsRef.current = selectedIntervals
  }, [selectedIntervals])

  useEffect(() => {
    selectedTriadsRef.current = selectedTriads
  }, [selectedTriads])

  useEffect(() => {
    selectedChordsRef.current = selectedChords
  }, [selectedChords])

  useEffect(() => {
    phaseRef.current = phase
  }, [phase])

  useEffect(() => {
    questionRef.current = question
  }, [question])

  useEffect(() => subscribeSamplesStatus(setSamplesStatus), [])

  useEffect(() => {
    initSamples()
  }, [])

  const clearAdvance = useCallback(() => {
    if (advanceRef.current !== null) {
      window.clearTimeout(advanceRef.current)
      advanceRef.current = null
    }
  }, [])

  const finish = useCallback(() => {
    clearAdvance()
    lockedRef.current = false
    releaseAll()
    setFeedback(null)
    setQuestion(null)
    questionRef.current = null
    setPhase('results')
  }, [clearAdvance])

  const resetToSetup = useCallback(
    (message: string) => {
      clearAdvance()
      lockedRef.current = false
      releaseAll()
      setFeedback(null)
      setQuestion(null)
      questionRef.current = null
      setCorrect(0)
      setWrong(0)
      answeredRef.current = 0
      setTimeLeft(0)
      endAtRef.current = 0
      startedAtRef.current = 0
      setHistory([])
      setPhase('setup')
      console.log(message)
    },
    [clearAdvance],
  )

  const playQuestion = useCallback((next: Question) => {
    if (next.category === 'triads') {
      logTriadDetails(next, triadNameMode, 'Odtwarzanie zadania')
    }
    if (next.category === 'chords') {
      logChordDetails(next, triadNameMode, 'Odtwarzanie zadania')
    }
    playNotes({
      notes: questionNotes(next),
      name: questionName(next, triadNameMode),
      playMode: next.playMode,
      directionSource: next.directionSource,
    })
  }, [triadNameMode])

  const pickQuestion = useCallback(() => {
    const cfg = configRef.current
    const previousKey = questionRef.current ? questionKey(questionRef.current) : null

    if (cfg.category === 'intervals') {
      const pool = selectedIntervalsRef.current
      if (pool.length === 0) return

      let semitones = pool[Math.floor(Math.random() * pool.length)]
      if (pool.length > 1 && previousKey !== null) {
        while (intervalKey(semitones) === previousKey) {
          semitones = pool[Math.floor(Math.random() * pool.length)]
        }
      }

      const rootMidi = ROOT_MIN_MIDI + Math.floor(Math.random() * ROOT_MIDI_RANGE)
      const play = directionToPlayMode(cfg.direction, 'chosen')
      const next: Question = {
        category: 'intervals',
        rootMidi,
        semitones,
        playMode: play.playMode,
        directionSource: play.source,
      }
      logNewQuestion(next, rootMidi, play, triadNameMode)
      startedAtRef.current = performance.now()
      questionRef.current = next
      setQuestion(next)
      playQuestion(next)
      return
    }

    if (cfg.category === 'triads') {
      const pool = triadPool(selectedTriadsRef.current)
      if (pool.length === 0) return

      let key = pool[Math.floor(Math.random() * pool.length)]
      if (pool.length > 1 && previousKey !== null) {
        while (key === previousKey) {
          key = pool[Math.floor(Math.random() * pool.length)]
        }
      }

      const parsed = parseTriadKey(key)
      if (!parsed) return
      const { type, inversion } = parsed
      const rootMidi = TRIAD_ROOT_MIN_MIDI + Math.floor(Math.random() * TRIAD_ROOT_MIDI_RANGE)
      const play = directionToPlayMode(cfg.direction, 'chosen')
      const notes = triadMidiNotes(rootMidi, type, inversion)
      const next: Question = {
        category: 'triads',
        rootMidi,
        triadType: type,
        inversion,
        notes,
        playMode: play.playMode,
        directionSource: play.source,
      }
      logNewQuestion(next, rootMidi, play, triadNameMode)
      startedAtRef.current = performance.now()
      questionRef.current = next
      setQuestion(next)
      playQuestion(next)
      return
    }

    const pool = chordPool(selectedChordsRef.current)
    if (pool.length === 0) return

    let key = pool[Math.floor(Math.random() * pool.length)]
    if (pool.length > 1 && previousKey !== null) {
      while (key === previousKey) {
        key = pool[Math.floor(Math.random() * pool.length)]
      }
    }

    const parsed = parseChordKey(key)
    if (!parsed) return
    const { type, inversion } = parsed
    const rootMidi = CHORD_ROOT_MIN_MIDI + Math.floor(Math.random() * CHORD_ROOT_MIDI_RANGE)
    const play = directionToPlayMode(cfg.direction, 'chosen')
    const notes = chordMidiNotes(rootMidi, type, inversion)
    const next: Question = {
      category: 'chords',
      rootMidi,
      chordType: type,
      inversion,
      notes,
      playMode: play.playMode,
      directionSource: play.source,
    }
    logNewQuestion(next, rootMidi, play, triadNameMode)
    startedAtRef.current = performance.now()
    questionRef.current = next
    setQuestion(next)
    playQuestion(next)
  }, [playQuestion, triadNameMode])

  useEffect(() => {
    if (phase !== 'running' || config.mode !== 'time') return

    const id = window.setInterval(() => {
      const left = Math.max(0, endAtRef.current - performance.now())
      setTimeLeft(left)
      if (left <= 0) finish()
    }, 100)

    return () => window.clearInterval(id)
  }, [phase, config.mode, finish])

  const start = useCallback(() => {
    if (busyRef.current || phaseRef.current === 'running') return
    const cfg = configRef.current
    const poolEmpty =
      cfg.category === 'intervals'
        ? selectedIntervalsRef.current.length === 0
        : cfg.category === 'triads'
          ? triadPool(selectedTriadsRef.current).length === 0
          : chordPool(selectedChordsRef.current).length === 0
    if (poolEmpty) return
    if (getSamplesStatus() !== 'ready') {
      console.warn('[Session] Start odrzucony — sample pianina nie są jeszcze gotowe.')
      return
    }

    busyRef.current = true
    void ensureAudio()
      .then(() => {
        if (phaseRef.current === 'running') return

        answeredRef.current = 0
        lockedRef.current = false
        clearAdvance()
        setCorrect(0)
        setWrong(0)
        setFeedback(null)
        setHistory([])
        questionRef.current = null
        setQuestion(null)
        if (cfg.mode === 'time') {
          endAtRef.current = performance.now() + cfg.seconds * 1000
        }
        setTimeLeft(cfg.seconds * 1000)
        setPhase('running')
        pickQuestion()
      })
      .catch((error: unknown) => {
        console.error('[Session] Nie udało się uruchomić kontekstu audio:', error)
      })
      .finally(() => {
        busyRef.current = false
      })
  }, [clearAdvance, pickQuestion])

  const answer = useCallback(
    (key: string) => {
      if (phaseRef.current !== 'running' || lockedRef.current) return
      const current = questionRef.current
      if (!current) return

      lockedRef.current = true
      answeredRef.current += 1
      const elapsedMs = Math.max(0, performance.now() - startedAtRef.current)

      const isCorrect = key === questionKey(current)
      if (isCorrect) {
        setCorrect((value) => value + 1)
      } else {
        setWrong((value) => value + 1)
      }
      setFeedback({ chosen: key, correct: isCorrect })

      const result = buildTaskResult(answeredRef.current, current, key, elapsedMs, triadNameMode)
      setHistory((previous) => [...previous, result])
      console.log(
        `[Session] Zadanie #${result.taskId}: odpowiedź „${result.userAnswer}”, ` +
          `poprawna „${result.correctAnswer}” — ${result.isCorrect ? 'OK' : 'BŁĄD'} ` +
          `(${Math.round(elapsedMs)} ms).`,
      )

      advanceRef.current = window.setTimeout(() => {
        advanceRef.current = null
        if (phaseRef.current !== 'running') return

        setFeedback(null)
        const cfg = configRef.current
        if (cfg.mode === 'count' && answeredRef.current >= cfg.count) {
          finish()
          return
        }
        lockedRef.current = false
        pickQuestion()
      }, FEEDBACK_MS)
    },
    [finish, pickQuestion, triadNameMode],
  )

  const repeat = useCallback(() => {
    if (phaseRef.current !== 'running' || lockedRef.current) return
    const current = questionRef.current
    if (!current) return
    playQuestion(current)
  }, [playQuestion])

  const replayTask = useCallback((task: TaskResult) => {
    void ensureAudio()
      .then(() => {
        console.log(
          `[Session] Odsłuchiwanie zadania #${task.taskId} (${task.replay.name}, ` +
            `tryb: ${PLAY_MODE_LABELS[task.replay.playMode]}).`,
        )
        if (task.triad) {
          const triadQuestion: Extract<Question, {category: 'triads'}> = {
            category: 'triads',
            rootMidi: task.replay.notes[0] ?? 0,
            triadType: task.triad.correct.type,
            inversion: task.triad.correct.inversion,
            notes: task.replay.notes,
            playMode: task.replay.playMode,
            directionSource: task.replay.directionSource,
          }
          logTriadDetails(triadQuestion, triadNameMode, 'Odtwarzanie z podsumowania')
        }
        if (task.chord) {
          const chordQuestion: Extract<Question, {category: 'chords'}> = {
            category: 'chords',
            rootMidi: task.replay.notes[0] ?? 0,
            chordType: task.chord.correct.type,
            inversion: task.chord.correct.inversion,
            notes: task.replay.notes,
            playMode: task.replay.playMode,
            directionSource: task.replay.directionSource,
          }
          logChordDetails(chordQuestion, triadNameMode, 'Odtwarzanie z podsumowania')
        }
        playNotes({
          notes: task.replay.notes,
          name: task.replay.name,
          playMode: task.replay.playMode,
          directionSource: task.replay.directionSource,
        })
      })
      .catch((error: unknown) => {
        console.error('[Session] Nie udało się odtworzyć zadania:', error)
      })
  }, [triadNameMode])

  const setCategory = useCallback((category: Category) => {
    if (phaseRef.current === 'running') return
    setConfig((previous) => ({ ...previous, category }))
  }, [])

  const setCount = useCallback((count: number) => {
    if (phaseRef.current === 'running') return
    setConfig((previous) => ({ ...previous, mode: 'count', count }))
  }, [])

  const setSeconds = useCallback((seconds: number) => {
    if (phaseRef.current === 'running') return
    setConfig((previous) => ({ ...previous, mode: 'time', seconds }))
  }, [])

  const setDirection = useCallback((direction: PlayDirection) => {
    if (phaseRef.current === 'running') return
    setConfig((previous) => ({ ...previous, direction }))
  }, [])

  const applyDefaults = useCallback((defaults: SessionDefaults) => {
    if (phaseRef.current !== 'setup') return
    configRef.current = defaults
    setConfig(defaults)
  }, [])

  const toggleInterval = useCallback((semitones: number) => {
    if (phaseRef.current === 'running') return
    setSelectedIntervals((previous) =>
      previous.includes(semitones)
        ? previous.filter((value) => value !== semitones)
        : [...previous, semitones].sort((a, b) => a - b),
    )
  }, [])

  const selectAllIntervals = useCallback(() => {
    if (phaseRef.current === 'running') return
    setSelectedIntervals([...ALL_SEMITONES])
  }, [])

  const clearIntervals = useCallback(() => {
    if (phaseRef.current === 'running') return
    setSelectedIntervals([0, 7])
  }, [])

  const toggleTriadCombination = useCallback(
    (type: TriadType, inversion: TriadInversion) => {
      if (phaseRef.current === 'running') return
      if (!isTriadInversionAllowed(type, inversion)) return
      const key = triadKey(type, inversion)
      setSelectedTriads((previous) =>
        previous.includes(key)
          ? previous.filter((value) => value !== key)
          : [...previous, key],
      )
    },
    [],
  )

  const toggleTriadType = useCallback((type: TriadType) => {
    if (phaseRef.current === 'running') return
    const typeKeys = triadInversionsFor(type).map((inversion) => triadKey(type, inversion.value))
    setSelectedTriads((previous) => {
      const everySelected = typeKeys.every((key) => previous.includes(key))
      if (everySelected) {
        return previous.filter((key) => !typeKeys.includes(key))
      }
      return [...new Set([...previous, ...typeKeys])]
    })
  }, [])

  const toggleChordCombination = useCallback(
    (type: SeventhChordType, inversion: SeventhChordInversion) => {
      if (phaseRef.current === 'running') return
      if (!isChordInversionAllowed(type, inversion)) return
      const key = chordKey(type, inversion)
      setSelectedChords((previous) =>
        previous.includes(key)
          ? previous.filter((value) => value !== key)
          : [...previous, key],
      )
    },
    [],
  )

  const toggleChordType = useCallback((type: SeventhChordType) => {
    if (phaseRef.current === 'running') return
    const typeKeys = chordInversionsFor(type).map((inversion) => chordKey(type, inversion.value))
    setSelectedChords((previous) => {
      const everySelected = typeKeys.every((key) => previous.includes(key))
      if (everySelected) {
        return previous.filter((key) => !typeKeys.includes(key))
      }
      return [...new Set([...previous, ...typeKeys])]
    })
  }, [])

  const goToSetup = useCallback(() => {
    resetToSetup('[Session] Powrót do ustawień.')
  }, [resetToSetup])

  const quit = useCallback(() => {
    resetToSetup('[Session] Sesja anulowana przez użytkownika.')
  }, [resetToSetup])

  const restart = useCallback(() => {
    start()
  }, [start])

  useEffect(() => {
    return () => {
      clearAdvance()
    }
  }, [clearAdvance])

  const answerOptions = useMemo<AnswerOption[]>(() => {
    if (config.category === 'intervals') {
      return INTERVALS.filter((interval) => selectedIntervals.includes(interval.semitones)).map(
        (interval) => ({
          key: intervalKey(interval.semitones),
          short: interval.short,
          name: interval.name,
          interval: interval.semitones,
        }),
      )
    }

    if (config.category === 'triads') {
      return triadPool(selectedTriads).flatMap((key) => {
        const parsed = parseTriadKey(key)
        if (!parsed) return []
        return [
          {
            key,
            short: triadName(parsed.type, parsed.inversion, triadNameMode),
            name: triadLabel(parsed.type, parsed.inversion),
            triad: parsed,
          },
        ]
      })
    }

    return chordPool(selectedChords).flatMap((key) => {
      const parsed = parseChordKey(key)
      if (!parsed) return []
      return [
        {
          key,
          short: chordShortLabel(parsed.type, parsed.inversion),
          name: chordLabel(parsed.type, parsed.inversion),
          chord: parsed,
        },
      ]
    })
  }, [config.category, selectedIntervals, selectedTriads, selectedChords, triadNameMode])

  const answered = correct + wrong
  const correctKey = question ? questionKey(question) : null
  const canStart = answerOptions.length > 0 && samplesStatus === 'ready'

  return {
    phase,
    config,
    selectedIntervals,
    selectedTriads,
    selectedChords,
    answerOptions,
    question,
    correctKey,
    feedback,
    correct,
    wrong,
    answered,
    timeLeft,
    samplesStatus,
    history,
    triadNameMode,
    canStart,
    setCategory,
    setCount,
    setSeconds,
    setDirection,
    applyDefaults,
    toggleInterval,
    selectAllIntervals,
    clearIntervals,
    toggleTriadCombination,
    toggleTriadType,
    toggleChordCombination,
    toggleChordType,
    start,
    answer,
    repeat,
    replayTask,
    quit,
    restart,
    goToSetup,
  }
}

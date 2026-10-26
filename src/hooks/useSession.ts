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
  ALL_TRIAD_COMBINATIONS,
  isTriadInversionAllowed,
  parseTriadKey,
  triadInversionsFor,
  triadKey,
  triadLabel,
  triadMidiNotes,
  triadPool,
  triadShortLabel,
} from '../data/triads'
import type {
  AnswerOption,
  Category,
  DirectionSource,
  Feedback,
  Phase,
  PlayDirection,
  PlayMode,
  Question,
  SessionConfig,
  TaskResult,
  TriadInversion,
  TriadType,
} from '../types'

const FEEDBACK_MS = 450
const ROOT_MIN_MIDI = 57
const ROOT_MIDI_RANGE = 10
const TRIAD_ROOT_MIN_MIDI = 48
const TRIAD_ROOT_MIDI_RANGE = 25

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

function questionName(question: Question): string {
  return question.category === 'intervals'
    ? INTERVAL_BY_SEMITONES[question.semitones]?.name ?? 'Nieznany interwał'
    : triadLabel(question.triadType, question.inversion)
}

function questionNotes(question: Question): number[] {
  return question.category === 'intervals' ? intervalNotes(question) : question.notes
}

function questionKey(question: Question): string {
  return question.category === 'intervals'
    ? intervalKey(question.semitones)
    : triadKey(question.triadType, question.inversion)
}

function logNewQuestion(question: Question, rootMidi: number, play: ResolvedPlay): void {
  console.log(
    `[Session] Nowe pytanie — ${questionName(question)}, korzeń MIDI ${rootMidi}, ` +
      `kierunek: ${PLAY_MODE_LABELS[play.playMode]} (${DIRECTION_SOURCE_LABELS[play.source]}), ` +
      'tryb odtwarzania zastosowany.',
  )
}

function buildTaskResult(
  taskId: number,
  question: Question,
  chosenKey: string,
  elapsedMs: number,
): TaskResult {
  const notes = questionNotes(question).sort((a, b) => a - b)
  const notesToPlay = notes.map(midiToNote)
  const correctAnswer = questionName(question)

  if (question.category === 'intervals') {
    const chosen = parseIntervalKey(chosenKey)
    return {
      taskId,
      category: 'intervals',
      playMode: question.playMode,
      notesToPlay,
      userAnswer: (chosen !== null && INTERVAL_BY_SEMITONES[chosen]?.name) || 'Nieznany interwał',
      correctAnswer,
      isCorrect: chosen === question.semitones,
      elapsedMs,
      replay: {
        notes,
        name: correctAnswer,
        playMode: question.playMode,
        directionSource: question.directionSource,
      },
    }
  }

  const chosen = parseTriadKey(chosenKey)
  return {
    taskId,
    category: 'triads',
    playMode: question.playMode,
    notesToPlay,
    userAnswer: chosen ? triadLabel(chosen.type, chosen.inversion) : 'Nieznany trójdźwięk',
    correctAnswer,
    isCorrect: chosen?.type === question.triadType && chosen?.inversion === question.inversion,
    elapsedMs,
    replay: {
      notes,
      name: correctAnswer,
      playMode: question.playMode,
      directionSource: question.directionSource,
    },
  }
}

export interface UseSession {
  phase: Phase
  config: SessionConfig
  selectedIntervals: number[]
  selectedTriads: string[]
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
  canStart: boolean
  setCategory: (category: Category) => void
  setCount: (count: number) => void
  setSeconds: (seconds: number) => void
  setDirection: (direction: PlayDirection) => void
  toggleInterval: (semitones: number) => void
  toggleTriadCombination: (type: TriadType, inversion: TriadInversion) => void
  toggleTriadType: (type: TriadType) => void
  start: () => void
  answer: (key: string) => void
  repeat: () => void
  replayTask: (task: TaskResult) => void
  quit: () => void
  restart: () => void
  goToSetup: () => void
}

export function useSession(): UseSession {
  const [phase, setPhase] = useState<Phase>('setup')
  const [config, setConfig] = useState<SessionConfig>({
    category: 'intervals',
    mode: 'count',
    count: 10,
    seconds: 60,
    direction: 'random',
  })
  const [selectedIntervals, setSelectedIntervals] = useState<number[]>([...ALL_SEMITONES])
  const [selectedTriads, setSelectedTriads] = useState<string[]>([...ALL_TRIAD_COMBINATIONS])
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
      setTimeLeft(0)
      setHistory([])
      setPhase('setup')
      console.log(message)
    },
    [clearAdvance],
  )

  const playQuestion = useCallback((next: Question) => {
    playNotes({
      notes: questionNotes(next),
      name: questionName(next),
      playMode: next.playMode,
      directionSource: next.directionSource,
    })
  }, [])

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
      const play = directionToPlayMode(cfg.direction, cfg.mode === 'time' ? 'time' : 'chosen')
      const next: Question = {
        category: 'intervals',
        rootMidi,
        semitones,
        playMode: play.playMode,
        directionSource: play.source,
      }
      logNewQuestion(next, rootMidi, play)
      startedAtRef.current = performance.now()
      questionRef.current = next
      setQuestion(next)
      playQuestion(next)
      return
    }

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
    const play = directionToPlayMode(cfg.direction, cfg.mode === 'time' ? 'time' : 'chosen')
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
    logNewQuestion(next, rootMidi, play)
    startedAtRef.current = performance.now()
    questionRef.current = next
    setQuestion(next)
    playQuestion(next)
  }, [playQuestion])

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
        : triadPool(selectedTriadsRef.current).length === 0
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

      const result = buildTaskResult(answeredRef.current, current, key, elapsedMs)
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
    [finish, pickQuestion],
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
  }, [])

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

  const toggleInterval = useCallback((semitones: number) => {
    if (phaseRef.current === 'running') return
    setSelectedIntervals((previous) =>
      previous.includes(semitones)
        ? previous.filter((value) => value !== semitones)
        : [...previous, semitones].sort((a, b) => a - b),
    )
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
    const typeKeys = triadInversionsFor(type).map((inversion) => triadKey(type, inversion))
    setSelectedTriads((previous) => {
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
        }),
      )
    }

    return triadPool(selectedTriads).flatMap((key) => {
      const parsed = parseTriadKey(key)
      if (!parsed) return []
      return [
        {
          key,
          short: triadShortLabel(parsed.type, parsed.inversion),
          name: triadLabel(parsed.type, parsed.inversion),
        },
      ]
    })
  }, [config.category, selectedIntervals, selectedTriads])

  const answered = correct + wrong
  const correctKey = question ? questionKey(question) : null
  const canStart = answerOptions.length > 0 && samplesStatus === 'ready'

  return {
    phase,
    config,
    selectedIntervals,
    selectedTriads,
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
    canStart,
    setCategory,
    setCount,
    setSeconds,
    setDirection,
    toggleInterval,
    toggleTriadCombination,
    toggleTriadType,
    start,
    answer,
    repeat,
    replayTask,
    quit,
    restart,
    goToSetup,
  }
}

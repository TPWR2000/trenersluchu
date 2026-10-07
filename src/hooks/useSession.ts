import { useCallback, useEffect, useRef, useState } from 'react'
import {
  ensureAudio,
  getSamplesStatus,
  initSamples,
  playInterval,
  releaseAll,
  subscribeSamplesStatus,
} from '../audio/engine'
import type { SamplesStatus } from '../audio/engine'
import {
  DIRECTION_SOURCE_LABELS,
  RESOLVED_DIRECTIONS,
  RESOLVED_DIRECTION_LABELS,
} from '../data/directions'
import { ALL_SEMITONES, INTERVAL_BY_SEMITONES } from '../data/intervals'
import type {
  DirectionSource,
  Feedback,
  Phase,
  PlayDirection,
  Question,
  ResolvedDirection,
  SessionConfig,
} from '../types'

const FEEDBACK_MS = 450
const ROOT_MIN_MIDI = 57
const ROOT_MIDI_RANGE = 10

interface ResolvedPlay {
  direction: ResolvedDirection
  source: DirectionSource
}

function resolvePlayDirection(config: SessionConfig): ResolvedPlay {
  if (config.mode === 'time') {
    return { direction: 'harmonic', source: 'time' }
  }
  if (config.direction === 'random') {
    const index = Math.floor(Math.random() * RESOLVED_DIRECTIONS.length)
    return { direction: RESOLVED_DIRECTIONS[index], source: 'random' }
  }
  return { direction: config.direction, source: 'chosen' }
}

export interface UseSession {
  phase: Phase
  config: SessionConfig
  selected: number[]
  question: Question | null
  feedback: Feedback | null
  correct: number
  wrong: number
  answered: number
  timeLeft: number
  samplesStatus: SamplesStatus
  canStart: boolean
  setCount: (count: number) => void
  setSeconds: (seconds: number) => void
  setDirection: (direction: PlayDirection) => void
  toggleInterval: (semitones: number) => void
  start: () => void
  answer: (semitones: number) => void
  repeat: () => void
  restart: () => void
  goToSetup: () => void
}

export function useSession(): UseSession {
  const [phase, setPhase] = useState<Phase>('setup')
  const [config, setConfig] = useState<SessionConfig>({
    mode: 'count',
    count: 10,
    seconds: 60,
    direction: 'random',
  })
  const [selected, setSelected] = useState<number[]>([...ALL_SEMITONES])
  const [question, setQuestion] = useState<Question | null>(null)
  const [feedback, setFeedback] = useState<Feedback | null>(null)
  const [correct, setCorrect] = useState(0)
  const [wrong, setWrong] = useState(0)
  const [timeLeft, setTimeLeft] = useState(0)
  const [samplesStatus, setSamplesStatus] = useState<SamplesStatus>(getSamplesStatus)

  const configRef = useRef(config)
  const selectedRef = useRef(selected)
  const phaseRef = useRef(phase)
  const questionRef = useRef(question)
  const answeredRef = useRef(0)
  const lockedRef = useRef(false)
  const busyRef = useRef(false)
  const endAtRef = useRef(0)
  const advanceRef = useRef<number | null>(null)

  useEffect(() => {
    configRef.current = config
  }, [config])

  useEffect(() => {
    selectedRef.current = selected
  }, [selected])

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

  const pickQuestion = useCallback(() => {
    const pool = selectedRef.current
    if (pool.length === 0) return

    const previous = questionRef.current?.semitones
    let semitones = pool[Math.floor(Math.random() * pool.length)]
    if (pool.length > 1 && previous !== undefined) {
      while (semitones === previous) {
        semitones = pool[Math.floor(Math.random() * pool.length)]
      }
    }

    const rootMidi = ROOT_MIN_MIDI + Math.floor(Math.random() * ROOT_MIDI_RANGE)
    const play = resolvePlayDirection(configRef.current)
    const next: Question = {
      rootMidi,
      semitones,
      direction: play.direction,
      directionSource: play.source,
    }
    const intervalName = INTERVAL_BY_SEMITONES[semitones]?.name ?? 'Nieznany interwał'
    console.log(
      `[Session] Nowe pytanie — ${intervalName} (${semitones} pt.), korzeń MIDI ${rootMidi}, ` +
        `kierunek: ${RESOLVED_DIRECTION_LABELS[play.direction]} (${DIRECTION_SOURCE_LABELS[play.source]})`,
    )
    questionRef.current = next
    setQuestion(next)
    playInterval({ rootMidi, semitones, direction: play.direction, source: play.source })
  }, [])

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
    if (selectedRef.current.length === 0) return
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
        questionRef.current = null
        setQuestion(null)
        const cfg = configRef.current
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
    (semitones: number) => {
      if (phaseRef.current !== 'running' || lockedRef.current) return
      const current = questionRef.current
      if (!current) return

      lockedRef.current = true
      answeredRef.current += 1

      const isCorrect = semitones === current.semitones
      if (isCorrect) {
        setCorrect((value) => value + 1)
      } else {
        setWrong((value) => value + 1)
      }
      setFeedback({ chosen: semitones, correct: isCorrect })

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
    playInterval({
      rootMidi: current.rootMidi,
      semitones: current.semitones,
      direction: current.direction,
      source: current.directionSource,
    })
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
    setSelected((previous) =>
      previous.includes(semitones)
        ? previous.filter((value) => value !== semitones)
        : [...previous, semitones].sort((a, b) => a - b),
    )
  }, [])

  const goToSetup = useCallback(() => {
    clearAdvance()
    lockedRef.current = false
    releaseAll()
    setFeedback(null)
    setQuestion(null)
    questionRef.current = null
    setPhase('setup')
  }, [clearAdvance])

  const restart = useCallback(() => {
    start()
  }, [start])

  useEffect(() => {
    return () => {
      clearAdvance()
    }
  }, [clearAdvance])

  const answered = correct + wrong

  return {
    phase,
    config,
    selected,
    question,
    feedback,
    correct,
    wrong,
    answered,
    timeLeft,
    samplesStatus,
    canStart: selected.length > 0 && samplesStatus === 'ready',
    setCount,
    setSeconds,
    setDirection,
    toggleInterval,
    start,
    answer,
    repeat,
    restart,
    goToSetup,
  }
}

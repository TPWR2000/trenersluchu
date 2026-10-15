import * as Tone from 'tone'
import { DIRECTION_SOURCE_LABELS, RESOLVED_DIRECTION_LABELS } from '../data/directions'
import { INTERVAL_BY_SEMITONES } from '../data/intervals'
import type { DirectionSource, ResolvedDirection } from '../types'

export type SamplesStatus = 'idle' | 'loading' | 'ready' | 'error'

export interface PlaybackRequest {
  rootMidi: number
  semitones: number
  direction: ResolvedDirection
  source: DirectionSource
}

const PIANO_BASE_URL = 'https://tonejs.github.io/audio/salamander/'

const PIANO_URLS = {
  A0: 'A0.mp3',
  C1: 'C1.mp3',
  C2: 'C2.mp3',
  C3: 'C3.mp3',
  C4: 'C4.mp3',
  C5: 'C5.mp3',
  C6: 'C6.mp3',
  C7: 'C7.mp3',
  C8: 'C8.mp3',
}

const NOTE_DURATION = 0.5
const NOTE_GAP = 0.5
const HARMONIC_DURATION = 1.2
const UNISON_DURATION = 0.7

let sampler: Tone.Sampler | null = null
let samplesStatus: SamplesStatus = 'idle'
const listeners = new Set<(status: SamplesStatus) => void>()

function setStatus(next: SamplesStatus): void {
  if (samplesStatus === next) return
  samplesStatus = next
  listeners.forEach((listener) => listener(next))
}

export function getSamplesStatus(): SamplesStatus {
  return samplesStatus
}

export function subscribeSamplesStatus(listener: (status: SamplesStatus) => void): () => void {
  listener(samplesStatus)
  listeners.add(listener)
  return () => {
    listeners.delete(listener)
  }
}

export function initSamples(): void {
  if (sampler || samplesStatus === 'loading' || samplesStatus === 'ready') return

  setStatus('loading')
  console.log('[AudioEngine] Rozpoczęto ładowanie sampli pianina...')

  sampler = new Tone.Sampler({
    urls: PIANO_URLS,
    baseUrl: PIANO_BASE_URL,
    volume: -6,
    onload: () => {
      console.log('[AudioEngine] Pianino zostało pomyślnie załadowane.')
      setStatus('ready')
    },
    onerror: (error: Error) => {
      console.error('[AudioEngine] Nie udało się załadować sampli pianina:', error)
      setStatus('error')
    },
  }).toDestination()
}

export async function ensureAudio(): Promise<void> {
  await Tone.start()
  const context = Tone.getContext()
  if (context.state !== 'running') {
    await context.resume()
  }
  console.log(`[AudioEngine] Kontekst audio uruchomiony (stan: ${context.state}).`)
}

export function midiToNote(midi: number): string {
  return Tone.Frequency(midi, 'midi').toNote()
}

function logPlayback(request: PlaybackRequest, note1: string, midi1: number, note2: string, midi2: number): void {
  const { semitones, direction, source } = request
  const intervalName = INTERVAL_BY_SEMITONES[semitones]?.name ?? 'Nieznany interwał'
  const directionLabel = RESOLVED_DIRECTION_LABELS[direction]
  const sourceLabel = DIRECTION_SOURCE_LABELS[source]

  console.log(
    [
      '========================================',
      '[AUDIO PLAYBACK]',
      `Tryb odtwarzania: ${directionLabel} (${sourceLabel})`,
      `Nuta 1: ${note1} (MIDI: ${midi1})`,
      `Nuta 2: ${note2} (MIDI: ${midi2})`,
      `Interwał: ${intervalName} (${semitones} półtonów)`,
      '========================================',
    ].join('\n'),
  )
}

export function playInterval(request: PlaybackRequest): void {
  const { rootMidi, semitones, direction } = request

  if (!sampler || samplesStatus !== 'ready') {
    console.warn(
      `[AudioEngine] Odtwarzanie pominięte — sample pianina nie są gotowe (status: ${samplesStatus}).`,
    )
    return
  }

  sampler.releaseAll()

  const lowerMidi = rootMidi
  const upperMidi = rootMidi + semitones
  const lower = midiToNote(lowerMidi)
  const upper = midiToNote(upperMidi)

  const descending = direction === 'down'
  const note1 = descending ? upper : lower
  const midi1 = descending ? upperMidi : lowerMidi
  const note2 = descending ? lower : upper
  const midi2 = descending ? lowerMidi : upperMidi

  logPlayback(request, note1, midi1, note2, midi2)

  const now = Tone.now()

  if (direction === 'harmonic') {
    if (semitones === 0) {
      sampler.triggerAttackRelease(lower, UNISON_DURATION, now)
    } else {
      sampler.triggerAttackRelease([lower, upper], HARMONIC_DURATION, now)
    }
    return
  }

  sampler.triggerAttackRelease(note1, NOTE_DURATION, now)
  sampler.triggerAttackRelease(note2, NOTE_DURATION, now + NOTE_GAP)
}

export function releaseAll(): void {
  sampler?.releaseAll()
}

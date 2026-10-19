import * as Tone from 'tone'
import {
  DIRECTION_SOURCE_LABELS,
  PLAY_MODE_LABELS,
} from '../data/directions'
import type { DirectionSource, PlayMode } from '../types'

export type SamplesStatus = 'idle' | 'loading' | 'ready' | 'error'

export interface PlaybackRequest {
  notes: number[]
  name: string
  playMode: PlayMode
  directionSource: DirectionSource
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

const HARMONIC_DURATION = '2n' //1n oznacza całąnute 2n półnute i itp
const SEQUENCE_NOTE_DURATION = '4n'
const SEQUENCE_GAP = 0.35

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

function describeMode(request: PlaybackRequest): string {
  const label = PLAY_MODE_LABELS[request.playMode]
  if (request.directionSource === 'chosen') return label
  return `${label} (${DIRECTION_SOURCE_LABELS[request.directionSource]})`
}

export function playNotes(request: PlaybackRequest): void {
  if (!sampler || samplesStatus !== 'ready') {
    console.warn(
      `[AudioEngine] Odtwarzanie pominięte — sample pianina nie są gotowe (status: ${samplesStatus}).`,
    )
    return
  }

  sampler.releaseAll()

  const sortedNotes = [...new Set(request.notes)].sort((a, b) => a - b)
  const noteNames = sortedNotes.map(midiToNote)
  const playModeLabel = describeMode(request)

  console.log(
    [
      '========================================',
      '[AUDIO PLAYBACK]',
      `Tryb odtwarzania: ${playModeLabel}`,
      `Nazwa: ${request.name}`,
      `Nuty: ${noteNames.join(', ')} (MIDI: ${sortedNotes.join(', ')})`,
      '========================================',
    ].join('\n'),
  )

  if (request.playMode === 'harmonic') {
    sampler.triggerAttackRelease(noteNames, HARMONIC_DURATION)
    return
  }

  const orderedNames = request.playMode === 'desc' ? [...noteNames].reverse() : noteNames
  const start = Tone.now()
  orderedNames.forEach((note, index) => {
    sampler?.triggerAttackRelease(note, SEQUENCE_NOTE_DURATION, start + index * SEQUENCE_GAP)
  })
}

export function releaseAll(): void {
  sampler?.releaseAll()
}

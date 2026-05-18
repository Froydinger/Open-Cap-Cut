import { create } from 'zustand'
import type { Clip, Project, Track, VideoClip, AudioClip, TextClip } from '../types'

let nextId = 1
export function genId() {
  return `clip_${nextId++}`
}

interface TimelineState {
  project: Project
  selectedId: string | null
  pxPerSecond: number

  addClip: (clip: Clip, trackType: Track['type']) => void
  removeClip: (id: string) => void
  updateClip: (id: string, patch: Partial<Clip>) => void
  splitClipAt: (id: string, atTime: number) => void
  setSelected: (id: string | null) => void
  setPxPerSecond: (v: number) => void
  reorderClip: (id: string, newStartAt: number) => void
  addTextClip: (clip: TextClip) => void
  totalDuration: () => number
  findClip: (id: string) => { clip: Clip; track: Track } | null
}

function ensureTrack(project: Project, type: Track['type']): Track {
  const existing = project.tracks.find(t => t.type === type)
  if (existing) return existing
  const track: Track = { id: `track_${type}_${Date.now()}`, type, clips: [] }
  project.tracks.push(track)
  return track
}

function calcEndTime(clip: Clip): number {
  return clip.startAt + clip.duration
}

function nextStartAt(track: Track): number {
  if (track.clips.length === 0) return 0
  return Math.max(...track.clips.map(calcEndTime))
}

export const useTimelineStore = create<TimelineState>((set, get) => ({
  project: {
    tracks: [],
    width: 1080,
    height: 1920,
    fps: 30,
    backgroundColor: '#000000',
  },
  selectedId: null,
  pxPerSecond: 100,

  addClip: (clip, trackType) => {
    set(state => {
      const project = { ...state.project, tracks: state.project.tracks.map(t => ({ ...t, clips: [...t.clips] })) }
      const track = ensureTrack(project, trackType)
      const placed = { ...clip, startAt: nextStartAt(track) }
      track.clips.push(placed)
      if (trackType === 'video' && project.tracks[0]?.clips.length === 1) {
        const vc = placed as VideoClip
        project.width = vc.width || 1080
        project.height = vc.height || 1920
      }
      return { project }
    })
  },

  addTextClip: (clip) => {
    set(state => {
      const project = { ...state.project, tracks: state.project.tracks.map(t => ({ ...t, clips: [...t.clips] })) }
      const track = ensureTrack(project, 'text')
      track.clips.push(clip)
      return { project }
    })
  },

  removeClip: (id) => {
    set(state => ({
      project: {
        ...state.project,
        tracks: state.project.tracks.map(t => ({
          ...t,
          clips: t.clips.filter(c => c.id !== id),
        })),
      },
      selectedId: state.selectedId === id ? null : state.selectedId,
    }))
  },

  updateClip: (id, patch) => {
    set(state => ({
      project: {
        ...state.project,
        tracks: state.project.tracks.map(t => ({
          ...t,
          clips: t.clips.map(c => (c.id === id ? { ...c, ...patch } as Clip : c)),
        })),
      },
    }))
  },

  splitClipAt: (id, atTime) => {
    set(state => {
      const result = state.findClip(id)
      if (!result) return state
      const { clip, track } = result
      if (clip.type === 'text') return state

      const mc = clip as VideoClip | AudioClip
      const relTime = atTime - mc.startAt
      if (relTime <= 0.05 || relTime >= mc.duration - 0.05) return state

      const aId = genId()
      const bId = genId()

      const a: typeof mc = {
        ...mc,
        id: aId,
        duration: relTime,
      }
      const b: typeof mc = {
        ...mc,
        id: bId,
        startAt: atTime,
        duration: mc.duration - relTime,
        trimStart: mc.trimStart + relTime * mc.speed,
      }

      return {
        project: {
          ...state.project,
          tracks: state.project.tracks.map(t =>
            t.id !== track.id ? t : {
              ...t,
              clips: t.clips.flatMap(c => c.id === id ? [a, b] : [c]),
            }
          ),
        },
      }
    })
  },

  setSelected: (id) => set({ selectedId: id }),
  setPxPerSecond: (v) => set({ pxPerSecond: Math.min(800, Math.max(20, v)) }),

  reorderClip: (id, newStartAt) => {
    set(state => ({
      project: {
        ...state.project,
        tracks: state.project.tracks.map(t => ({
          ...t,
          clips: t.clips.map(c => (c.id === id ? { ...c, startAt: Math.max(0, newStartAt) } : c)),
        })),
      },
    }))
  },

  totalDuration: () => {
    const { project } = get()
    let max = 0
    for (const t of project.tracks) {
      for (const c of t.clips) {
        const end = c.startAt + c.duration
        if (end > max) max = end
      }
    }
    return max
  },

  findClip: (id) => {
    const { project } = get()
    for (const track of project.tracks) {
      const clip = track.clips.find(c => c.id === id)
      if (clip) return { clip, track }
    }
    return null
  },
}))

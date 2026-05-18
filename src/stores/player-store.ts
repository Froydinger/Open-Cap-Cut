import { create } from 'zustand'

interface PlayerState {
  playing: boolean
  currentTime: number
  duration: number
  volume: number

  setPlaying: (v: boolean) => void
  setCurrentTime: (t: number) => void
  setDuration: (d: number) => void
  setVolume: (v: number) => void
  togglePlay: () => void
}

export const usePlayerStore = create<PlayerState>((set) => ({
  playing: false,
  currentTime: 0,
  duration: 0,
  volume: 1,

  setPlaying: (v) => set({ playing: v }),
  setCurrentTime: (t) => set({ currentTime: t }),
  setDuration: (d) => set({ duration: d }),
  setVolume: (v) => set({ volume: v }),
  togglePlay: () => set(s => ({ playing: !s.playing })),
}))

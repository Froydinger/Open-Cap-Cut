import { useEffect, useRef } from 'react'
import { usePlayerStore } from '../stores/player-store'
import { useTimelineStore } from '../stores/timeline-store'
import { Compositor } from '../engine/compositor'

export function usePlayer(canvasRef: React.RefObject<HTMLCanvasElement | null>) {
  const compRef = useRef<Compositor | null>(null)
  const playing = usePlayerStore(s => s.playing)
  const currentTime = usePlayerStore(s => s.currentTime)
  const setCurrentTime = usePlayerStore(s => s.setCurrentTime)
  const setPlaying = usePlayerStore(s => s.setPlaying)
  const setDuration = usePlayerStore(s => s.setDuration)

  const project = useTimelineStore(s => s.project)
  const totalDuration = useTimelineStore(s => s.totalDuration)

  useEffect(() => {
    if (!canvasRef.current) return
    if (!compRef.current) {
      compRef.current = new Compositor(canvasRef.current)
    }
    const comp = compRef.current
    comp.syncProject(project)

    const dur = totalDuration()
    setDuration(dur)

    comp.onTimeUpdate = (t) => setCurrentTime(t)
    comp.onEnded = () => {
      setPlaying(false)
      setCurrentTime(0)
      comp.seekTo(project, 0)
    }

    return () => {
      comp.onTimeUpdate = undefined
      comp.onEnded = undefined
    }
  }, [project, totalDuration, setDuration, setCurrentTime, setPlaying, canvasRef])

  useEffect(() => {
    if (!compRef.current) return
    const comp = compRef.current
    const dur = totalDuration()
    if (playing) {
      comp.startPlayback(project, currentTime, dur)
    } else {
      comp.stopPlayback()
      comp.seekTo(project, currentTime)
    }
  }, [playing]) // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    if (!compRef.current || playing) return
    compRef.current.seekTo(project, currentTime)
  }, [currentTime, project, playing])

  useEffect(() => {
    return () => compRef.current?.destroy()
  }, [])

  return compRef
}

import { useRef } from 'react'
import { useTimelineStore } from '../stores/timeline-store'

type Side = 'left' | 'right'

export function useTrimDrag(clipId: string, side: Side) {
  const updateClip = useTimelineStore(s => s.updateClip)
  const findClip = useTimelineStore(s => s.findClip)
  const pxPerSecond = useTimelineStore(s => s.pxPerSecond)
  const startXRef = useRef<number | null>(null)
  const startValRef = useRef({ startAt: 0, duration: 0, trimStart: 0 })

  const onTouchStart = (e: React.TouchEvent) => {
    e.stopPropagation()
    startXRef.current = e.touches[0].clientX
    const result = findClip(clipId)
    if (!result) return
    const c = result.clip
    if (c.type === 'text') return
    startValRef.current = {
      startAt: c.startAt,
      duration: c.duration,
      trimStart: c.trimStart,
    }
  }

  const onTouchMove = (e: React.TouchEvent) => {
    e.stopPropagation()
    if (startXRef.current === null) return
    const dx = e.touches[0].clientX - startXRef.current
    const dt = dx / pxPerSecond

    const { startAt, duration, trimStart } = startValRef.current
    const result = findClip(clipId)
    if (!result || result.clip.type === 'text') return
    const src = result.clip as import('../types').MediaClip
    const maxDuration = src.sourceDuration - trimStart

    if (side === 'left') {
      const newTrimStart = Math.max(0, trimStart + dt)
      const trimDelta = newTrimStart - trimStart
      const newDuration = Math.max(0.1, duration - trimDelta)
      const newStartAt = Math.max(0, startAt + trimDelta)
      updateClip(clipId, {
        trimStart: newTrimStart,
        duration: newDuration,
        startAt: newStartAt,
      })
    } else {
      const newDuration = Math.max(0.1, Math.min(maxDuration, duration + dt))
      updateClip(clipId, { duration: newDuration })
    }
  }

  const onTouchEnd = (e: React.TouchEvent) => {
    e.stopPropagation()
    startXRef.current = null
  }

  const onMouseDown = (e: React.MouseEvent) => {
    e.stopPropagation()
    startXRef.current = e.clientX
    const result = findClip(clipId)
    if (!result || result.clip.type === 'text') return
    const c = result.clip
    startValRef.current = {
      startAt: c.startAt,
      duration: c.duration,
      trimStart: c.trimStart,
    }

    const onMouseMove = (ev: MouseEvent) => {
      if (startXRef.current === null) return
      const dx = ev.clientX - startXRef.current
      const dt = dx / pxPerSecond

      const { startAt, duration, trimStart } = startValRef.current
      const res = findClip(clipId)
      if (!res || res.clip.type === 'text') return
      const src = res.clip as import('../types').MediaClip
      const maxDuration = src.sourceDuration - trimStart

      if (side === 'left') {
        const newTrimStart = Math.max(0, trimStart + dt)
        const trimDelta = newTrimStart - trimStart
        const newDuration = Math.max(0.1, duration - trimDelta)
        const newStartAt = Math.max(0, startAt + trimDelta)
        updateClip(clipId, { trimStart: newTrimStart, duration: newDuration, startAt: newStartAt })
      } else {
        const newDuration = Math.max(0.1, Math.min(maxDuration, duration + dt))
        updateClip(clipId, { duration: newDuration })
      }
    }

    const onMouseUp = () => {
      startXRef.current = null
      window.removeEventListener('mousemove', onMouseMove)
      window.removeEventListener('mouseup', onMouseUp)
    }

    window.addEventListener('mousemove', onMouseMove)
    window.addEventListener('mouseup', onMouseUp)
  }

  return { onTouchStart, onTouchMove, onTouchEnd, onMouseDown }
}

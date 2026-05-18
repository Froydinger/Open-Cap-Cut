import { useRef } from 'react'
import { useTimelineStore } from '../stores/timeline-store'

export function usePinchZoom(_containerRef: React.RefObject<HTMLElement | null>) {
  const setPxPerSecond = useTimelineStore(s => s.setPxPerSecond)
  const pxPerSecond = useTimelineStore(s => s.pxPerSecond)
  const lastDistRef = useRef<number | null>(null)
  const basePxRef = useRef(pxPerSecond)

  const onTouchStart = (e: React.TouchEvent) => {
    if (e.touches.length === 2) {
      const dx = e.touches[0].clientX - e.touches[1].clientX
      const dy = e.touches[0].clientY - e.touches[1].clientY
      lastDistRef.current = Math.hypot(dx, dy)
      basePxRef.current = pxPerSecond
    }
  }

  const onTouchMove = (e: React.TouchEvent) => {
    if (e.touches.length !== 2 || lastDistRef.current === null) return
    e.preventDefault()
    const dx = e.touches[0].clientX - e.touches[1].clientX
    const dy = e.touches[0].clientY - e.touches[1].clientY
    const dist = Math.hypot(dx, dy)
    const scale = dist / lastDistRef.current
    setPxPerSecond(basePxRef.current * scale)
  }

  const onTouchEnd = () => {
    lastDistRef.current = null
  }

  return { onTouchStart, onTouchMove, onTouchEnd }
}

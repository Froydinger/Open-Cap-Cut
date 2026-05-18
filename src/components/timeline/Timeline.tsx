import { useRef } from 'react'
import { useTimelineStore } from '../../stores/timeline-store'
import { usePinchZoom } from '../../hooks/usePinchZoom'
import { TimelineTrack } from './TimelineTrack'
import { Playhead } from './Playhead'

const MIN_TOTAL_WIDTH = 800

export function Timeline() {
  const containerRef = useRef<HTMLDivElement>(null)
  const scrollRef = useRef<HTMLDivElement>(null)
  const project = useTimelineStore(s => s.project)
  const pxPerSecond = useTimelineStore(s => s.pxPerSecond)
  const totalDuration = useTimelineStore(s => s.totalDuration)
  const pinch = usePinchZoom(containerRef)

  const dur = totalDuration()
  const totalWidth = Math.max(MIN_TOTAL_WIDTH, dur * pxPerSecond + 200)

  const renderRuler = () => {
    const marks: React.ReactNode[] = []
    const step = pxPerSecond >= 200 ? 1 : pxPerSecond >= 80 ? 2 : pxPerSecond >= 30 ? 5 : 10
    const count = Math.ceil(totalWidth / pxPerSecond / step)
    for (let i = 0; i <= count; i++) {
      const t = i * step
      const x = t * pxPerSecond
      marks.push(
        <div key={i} className="ruler-mark" style={{ left: x }}>
          <span className="ruler-label">{t}s</span>
        </div>
      )
    }
    return marks
  }

  return (
    <div
      ref={containerRef}
      className="timeline-container"
      {...pinch}
    >
      <div
        ref={scrollRef}
        className="tl-scroll"
      >
        <div className="ruler" style={{ width: totalWidth }}>
          {renderRuler()}
        </div>
        <div className="tl-tracks" style={{ width: totalWidth, position: 'relative' }}>
          <Playhead pxPerSecond={pxPerSecond} />
          {project.tracks.map(track => (
            <TimelineTrack
              key={track.id}
              track={track}
              pxPerSecond={pxPerSecond}
              totalWidth={totalWidth}
            />
          ))}
          {project.tracks.length === 0 && (
            <div className="tl-empty">
              Import videos to start editing
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

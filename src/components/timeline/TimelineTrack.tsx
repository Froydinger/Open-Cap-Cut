import { useTimelineStore } from '../../stores/timeline-store'
import { usePlayerStore } from '../../stores/player-store'
import { TimelineClip } from './TimelineClip'
import type { Track } from '../../types'

const TRACK_ICONS: Record<string, string> = {
  video: '🎬',
  audio: '🔊',
  text: 'T',
}

const TRACK_HEIGHT = 52

interface Props {
  track: Track
  pxPerSecond: number
  totalWidth: number
}

export function TimelineTrack({ track, pxPerSecond, totalWidth }: Props) {
  const selectedId = useTimelineStore(s => s.selectedId)
  const setSelected = useTimelineStore(s => s.setSelected)
  const setPlaying = usePlayerStore(s => s.setPlaying)
  const setCurrentTime = usePlayerStore(s => s.setCurrentTime)

  const handleTrackClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if ((e.target as HTMLElement).closest('.tl-clip')) return
    const rect = e.currentTarget.getBoundingClientRect()
    const scrollLeft = e.currentTarget.closest('.tl-scroll')?.scrollLeft || 0
    const x = e.clientX - rect.left + scrollLeft
    const t = x / pxPerSecond
    setPlaying(false)
    setCurrentTime(t)
    setSelected(null)
  }

  return (
    <div className="tl-track-row">
      <div className="tl-track-label">
        <span>{TRACK_ICONS[track.type] ?? '▪'}</span>
      </div>
      <div
        className="tl-track-body"
        style={{ width: totalWidth, height: TRACK_HEIGHT }}
        onClick={handleTrackClick}
      >
        {track.clips.map(clip => (
          <TimelineClip
            key={clip.id}
            clip={clip}
            pxPerSecond={pxPerSecond}
            trackHeight={TRACK_HEIGHT}
            isSelected={selectedId === clip.id}
            onSelect={() => setSelected(clip.id)}
          />
        ))}
      </div>
    </div>
  )
}

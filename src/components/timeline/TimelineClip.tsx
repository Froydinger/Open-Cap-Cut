import { useTrimDrag } from '../../hooks/useTrimDrag'
import type { Clip, VideoClip } from '../../types'

interface Props {
  clip: Clip
  pxPerSecond: number
  trackHeight: number
  isSelected: boolean
  onSelect: () => void
}

const TRACK_COLORS: Record<string, string> = {
  video: '#3b82f6',
  audio: '#22c55e',
  text: '#f59e0b',
}

export function TimelineClip({ clip, pxPerSecond, trackHeight, isSelected, onSelect }: Props) {
  const width = Math.max(2, clip.duration * pxPerSecond)
  const left = clip.startAt * pxPerSecond
  const color = TRACK_COLORS[clip.type] || '#6366f1'

  const leftTrim = useTrimDrag(clip.id, 'left')
  const rightTrim = useTrimDrag(clip.id, 'right')

  const vc = clip.type === 'video' ? (clip as VideoClip) : null

  const label = clip.type === 'text'
    ? clip.text.slice(0, 20)
    : clip.name

  return (
    <div
      className={`tl-clip ${isSelected ? 'tl-clip--selected' : ''}`}
      style={{
        left,
        width,
        height: trackHeight,
        background: isSelected ? color : color + 'cc',
        borderColor: isSelected ? '#fff' : color,
      }}
      onTouchStart={(e) => {
        if ((e.target as HTMLElement).classList.contains('tl-handle')) return
        onSelect()
      }}
      onClick={(e) => {
        if ((e.target as HTMLElement).classList.contains('tl-handle')) return
        onSelect()
      }}
    >
      {vc?.thumbnail && width > 40 && (
        <img
          src={vc.thumbnail}
          alt=""
          className="tl-clip-thumb"
          draggable={false}
        />
      )}
      {width > 50 && (
        <span className="tl-clip-label">{label}</span>
      )}

      <div
        className="tl-handle tl-handle--left"
        {...leftTrim}
      />
      <div
        className="tl-handle tl-handle--right"
        {...rightTrim}
      />
    </div>
  )
}

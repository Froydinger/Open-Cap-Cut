import { useRef } from 'react'
import { usePlayerStore } from '../../stores/player-store'
import { formatTime } from '../../engine/video-meta'

export function PreviewControls() {
  const playing = usePlayerStore(s => s.playing)
  const currentTime = usePlayerStore(s => s.currentTime)
  const duration = usePlayerStore(s => s.duration)
  const togglePlay = usePlayerStore(s => s.togglePlay)
  const setCurrentTime = usePlayerStore(s => s.setCurrentTime)
  const setPlaying = usePlayerStore(s => s.setPlaying)

  const seekBarRef = useRef<HTMLDivElement>(null)

  const handleSeekTouch = (e: React.TouchEvent) => {
    const bar = seekBarRef.current
    if (!bar || duration === 0) return
    const rect = bar.getBoundingClientRect()
    const x = e.touches[0].clientX - rect.left
    const t = Math.max(0, Math.min(duration, (x / rect.width) * duration))
    setPlaying(false)
    setCurrentTime(t)
  }

  const handleSeekClick = (e: React.MouseEvent) => {
    const bar = seekBarRef.current
    if (!bar || duration === 0) return
    const rect = bar.getBoundingClientRect()
    const x = e.clientX - rect.left
    const t = Math.max(0, Math.min(duration, (x / rect.width) * duration))
    setPlaying(false)
    setCurrentTime(t)
  }

  const pct = duration > 0 ? (currentTime / duration) * 100 : 0

  return (
    <div className="transport">
      <div
        ref={seekBarRef}
        className="seek-bar"
        onTouchStart={handleSeekTouch}
        onTouchMove={handleSeekTouch}
        onClick={handleSeekClick}
      >
        <div className="seek-fill" style={{ width: `${pct}%` }} />
        <div className="seek-thumb" style={{ left: `${pct}%` }} />
      </div>
      <div className="transport-row">
        <button
          className="transport-btn"
          onClick={() => { setPlaying(false); setCurrentTime(0) }}
          title="Rewind"
        >⏮</button>
        <button className="transport-btn play-btn" onClick={togglePlay}>
          {playing ? '⏸' : '▶'}
        </button>
        <button
          className="transport-btn"
          onClick={() => { setPlaying(false); setCurrentTime(Math.min(duration, currentTime + 5)) }}
          title="Forward 5s"
        >⏭</button>
        <span className="time-display">
          {formatTime(currentTime)} / {formatTime(duration)}
        </span>
      </div>
    </div>
  )
}

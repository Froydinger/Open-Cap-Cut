import { useTimelineStore } from '../../stores/timeline-store'
import type { VideoClip, AudioClip } from '../../types'

export function ClipSheet() {
  const selectedId = useTimelineStore(s => s.selectedId)
  const setSelected = useTimelineStore(s => s.setSelected)
  const findClip = useTimelineStore(s => s.findClip)
  const updateClip = useTimelineStore(s => s.updateClip)
  const removeClip = useTimelineStore(s => s.removeClip)

  if (!selectedId) return null
  const result = findClip(selectedId)
  if (!result) return null
  const { clip } = result
  if (clip.type === 'text') return null

  const mc = clip as VideoClip | AudioClip

  const SPEEDS = [0.25, 0.5, 0.75, 1, 1.5, 2, 4]

  return (
    <div className="bottom-sheet" onClick={e => e.stopPropagation()}>
      <div className="sheet-handle" />
      <div className="sheet-header">
        <span className="sheet-title">{'name' in mc ? mc.name : 'Clip'}</span>
        <button className="sheet-close" onClick={() => setSelected(null)}>✕</button>
      </div>

      <div className="sheet-row">
        <label>Volume</label>
        <input
          type="range"
          min={0}
          max={1}
          step={0.05}
          value={mc.volume}
          onChange={e => updateClip(selectedId, { volume: parseFloat(e.target.value) })}
        />
        <span>{Math.round(mc.volume * 100)}%</span>
      </div>

      <div className="sheet-row">
        <label>Speed</label>
        <div className="speed-pills">
          {SPEEDS.map(s => (
            <button
              key={s}
              className={`speed-pill ${mc.speed === s ? 'speed-pill--active' : ''}`}
              onClick={() => updateClip(selectedId, { speed: s })}
            >
              {s}x
            </button>
          ))}
        </div>
      </div>

      <button
        className="btn-danger"
        onClick={() => removeClip(selectedId)}
      >
        🗑 Delete clip
      </button>
    </div>
  )
}

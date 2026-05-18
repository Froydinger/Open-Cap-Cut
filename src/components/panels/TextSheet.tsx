import { useState } from 'react'
import { useTimelineStore, genId } from '../../stores/timeline-store'
import { usePlayerStore } from '../../stores/player-store'
import type { TextClip } from '../../types'

interface Props {
  open: boolean
  onClose: () => void
}

export function TextSheet({ open, onClose }: Props) {
  const addTextClip = useTimelineStore(s => s.addTextClip)
  const currentTime = usePlayerStore(s => s.currentTime)

  const [text, setText] = useState('Your text here')
  const [fontSize, setFontSize] = useState(32)
  const [color, setColor] = useState('#ffffff')
  const [bold, setBold] = useState(false)
  const [italic, setItalic] = useState(false)
  const [bgColor, setBgColor] = useState('#000000')
  const [bgOpacity, setBgOpacity] = useState(0)
  const [align, setAlign] = useState<'left' | 'center' | 'right'>('center')

  if (!open) return null

  const handleAdd = () => {
    const clip: TextClip = {
      id: genId(),
      type: 'text',
      text,
      startAt: currentTime,
      duration: 3,
      x: 50,
      y: 80,
      fontSize,
      color,
      fontWeight: bold ? 'bold' : 'normal',
      fontStyle: italic ? 'italic' : 'normal',
      align,
      bgColor,
      bgOpacity,
    }
    addTextClip(clip)
    onClose()
  }

  return (
    <div className="bottom-sheet bottom-sheet--tall" onClick={e => e.stopPropagation()}>
      <div className="sheet-handle" />
      <div className="sheet-header">
        <span className="sheet-title">Add Text</span>
        <button className="sheet-close" onClick={onClose}>✕</button>
      </div>

      <textarea
        className="text-input"
        value={text}
        onChange={e => setText(e.target.value)}
        rows={3}
        placeholder="Enter text..."
      />

      <div className="sheet-row">
        <label>Size</label>
        <input
          type="range"
          min={12}
          max={96}
          value={fontSize}
          onChange={e => setFontSize(parseInt(e.target.value))}
        />
        <span>{fontSize}px</span>
      </div>

      <div className="sheet-row">
        <label>Color</label>
        <input type="color" value={color} onChange={e => setColor(e.target.value)} />
        <div className="toggle-row">
          <button className={`toggle-btn ${bold ? 'active' : ''}`} onClick={() => setBold(b => !b)}><b>B</b></button>
          <button className={`toggle-btn ${italic ? 'active' : ''}`} onClick={() => setItalic(i => !i)}><i>I</i></button>
        </div>
      </div>

      <div className="sheet-row">
        <label>Align</label>
        <div className="toggle-row">
          {(['left', 'center', 'right'] as const).map(a => (
            <button
              key={a}
              className={`toggle-btn ${align === a ? 'active' : ''}`}
              onClick={() => setAlign(a)}
            >
              {a === 'left' ? '⬛▫▫' : a === 'center' ? '▫⬛▫' : '▫▫⬛'}
            </button>
          ))}
        </div>
      </div>

      <div className="sheet-row">
        <label>Background</label>
        <input type="color" value={bgColor} onChange={e => setBgColor(e.target.value)} />
        <input
          type="range"
          min={0}
          max={1}
          step={0.05}
          value={bgOpacity}
          onChange={e => setBgOpacity(parseFloat(e.target.value))}
        />
        <span>{Math.round(bgOpacity * 100)}%</span>
      </div>

      <button className="btn-primary" onClick={handleAdd}>
        Add to timeline
      </button>
    </div>
  )
}

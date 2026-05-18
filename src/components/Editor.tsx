import { useRef } from 'react'
import { Toolbar } from './toolbar/Toolbar'
import { PreviewCanvas } from './preview/PreviewCanvas'
import { PreviewControls } from './preview/PreviewControls'
import { Timeline } from './timeline/Timeline'
import { ClipSheet } from './panels/ClipSheet'
import { useTimelineStore } from '../stores/timeline-store'

export function Editor() {
  const canvasRef = useRef<HTMLCanvasElement>(null!) as React.RefObject<HTMLCanvasElement>
  const selectedId = useTimelineStore(s => s.selectedId)
  const setSelected = useTimelineStore(s => s.setSelected)

  return (
    <div className="editor" onClick={() => { if (selectedId) setSelected(null) }}>
      <Toolbar />
      <div className="preview-area">
        <PreviewCanvas canvasRef={canvasRef} />
      </div>
      <PreviewControls />
      <Timeline />
      {selectedId && <ClipSheet />}
    </div>
  )
}

import { useRef } from 'react'
import { Toolbar, type ToolbarHandle } from './toolbar/Toolbar'
import { PreviewCanvas } from './preview/PreviewCanvas'
import { PreviewControls } from './preview/PreviewControls'
import { Timeline } from './timeline/Timeline'
import { ClipSheet } from './panels/ClipSheet'
import { useTimelineStore } from '../stores/timeline-store'
import { useKeyboardShortcuts } from '../hooks/useKeyboardShortcuts'

export function Editor() {
  const canvasRef = useRef<HTMLCanvasElement>(null!) as React.RefObject<HTMLCanvasElement>
  const toolbarRef = useRef<ToolbarHandle>(null)
  const selectedId = useTimelineStore(s => s.selectedId)
  const setSelected = useTimelineStore(s => s.setSelected)

  useKeyboardShortcuts(
    () => toolbarRef.current?.openImport(),
    () => toolbarRef.current?.export(),
    () => toolbarRef.current?.openText(),
  )

  return (
    <div className="editor">
      <Toolbar ref={toolbarRef} />
      <div className="editor-body">
        <div className="editor-main" onClick={() => { if (selectedId) setSelected(null) }}>
          <div className="preview-area">
            <PreviewCanvas canvasRef={canvasRef} />
          </div>
          <PreviewControls />
          <Timeline />
        </div>
        {selectedId && <ClipSheet />}
      </div>
    </div>
  )
}

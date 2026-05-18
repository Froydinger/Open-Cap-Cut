import { usePlayer } from '../../hooks/usePlayer'
import { useTimelineStore } from '../../stores/timeline-store'

interface Props {
  canvasRef: React.RefObject<HTMLCanvasElement>
}

export function PreviewCanvas({ canvasRef }: Props) {
  const project = useTimelineStore(s => s.project)
  usePlayer(canvasRef)

  const aspect = project.width / project.height

  return (
    <div className="preview-wrap" style={{ aspectRatio: String(aspect) }}>
      <canvas
        ref={canvasRef}
        width={project.width}
        height={project.height}
        className="preview-canvas"
      />
      {project.tracks.flatMap(t => t.clips).length === 0 && (
        <div className="preview-empty">
          <span>✂</span>
          <p>Import a video to get started</p>
        </div>
      )}
    </div>
  )
}

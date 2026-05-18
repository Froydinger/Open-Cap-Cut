import type { Project } from '../types'
import { Compositor } from './compositor'

export async function exportWithMediaRecorder(
  project: Project,
  totalDuration: number,
  onProgress?: (p: number) => void
): Promise<Blob> {
  const canvas = document.createElement('canvas')
  canvas.width = project.width
  canvas.height = project.height

  const comp = new Compositor(canvas)
  comp.syncProject(project)

  await new Promise(r => setTimeout(r, 500))

  const stream = canvas.captureStream(project.fps)

  const mimeTypes = [
    'video/mp4;codecs=avc1',
    'video/webm;codecs=vp9',
    'video/webm;codecs=vp8',
    'video/webm',
  ]
  const mimeType = mimeTypes.find(m => MediaRecorder.isTypeSupported(m)) || 'video/webm'

  const recorder = new MediaRecorder(stream, { mimeType, videoBitsPerSecond: 8_000_000 })
  const chunks: Blob[] = []
  recorder.ondataavailable = e => { if (e.data.size > 0) chunks.push(e.data) }

  recorder.start(100)

  await new Promise<void>((resolve) => {
    let t = 0
    const step = 1 / project.fps
    let raf: number

    const render = () => {
      if (t >= totalDuration) {
        recorder.stop()
        resolve()
        return
      }
      comp.renderFrame(project, t)
      onProgress?.(t / totalDuration)
      t += step
      raf = requestAnimationFrame(render)
    }
    raf = requestAnimationFrame(render)

    recorder.onstop = () => {
      cancelAnimationFrame(raf)
    }
  })

  comp.destroy()
  return new Blob(chunks, { type: mimeType })
}

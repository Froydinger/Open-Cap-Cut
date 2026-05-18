import type { Project } from '../types'
import { Compositor } from './compositor'

// Uses mp4-muxer for proper MP4 container output via WebCodecs
export async function exportWithWebCodecs(
  project: Project,
  totalDuration: number,
  onProgress?: (p: number) => void
): Promise<Blob> {
  const { Muxer, ArrayBufferTarget } = await import('mp4-muxer')

  const target = new ArrayBufferTarget()
  const muxer = new Muxer({
    target,
    video: {
      codec: 'avc',
      width: project.width,
      height: project.height,
    },
    fastStart: 'in-memory',
  })

  const canvas = new OffscreenCanvas(project.width, project.height)
  const comp = new Compositor(canvas as unknown as HTMLCanvasElement)
  comp.syncProject(project)

  await new Promise(r => setTimeout(r, 300))

  const encoder = new VideoEncoder({
    output: (chunk, meta) => muxer.addVideoChunk(chunk, meta ?? undefined),
    error: (e) => console.error('VideoEncoder error', e),
  })

  encoder.configure({
    codec: 'avc1.640028',
    width: project.width,
    height: project.height,
    bitrate: 8_000_000,
    framerate: project.fps,
    avc: { format: 'avc' },
  })

  const step = 1 / project.fps
  let t = 0
  let frameIndex = 0

  while (t <= totalDuration) {
    comp.renderFrame(project, t)
    const frame = new VideoFrame(canvas as unknown as CanvasImageSource, {
      timestamp: Math.round(t * 1_000_000),
      duration: Math.round(step * 1_000_000),
    })
    encoder.encode(frame, { keyFrame: frameIndex % 30 === 0 })
    frame.close()
    onProgress?.(t / totalDuration)
    t += step
    frameIndex++

    if (frameIndex % 10 === 0) {
      await new Promise(r => setTimeout(r, 0))
    }
  }

  await encoder.flush()
  encoder.close()
  comp.destroy()
  muxer.finalize()

  return new Blob([target.buffer], { type: 'video/mp4' })
}

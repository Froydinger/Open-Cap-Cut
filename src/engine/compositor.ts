import type { Project, VideoClip, TextClip } from '../types'

export class Compositor {
  private canvas: HTMLCanvasElement
  private ctx: CanvasRenderingContext2D
  private videoEls: Map<string, HTMLVideoElement> = new Map()
  private audioEls: Map<string, HTMLAudioElement> = new Map()
  private rafId: number | null = null
  private playing = false
  private startWallTime = 0
  private startProjectTime = 0

  onTimeUpdate?: (t: number) => void
  onEnded?: () => void

  constructor(canvas: HTMLCanvasElement) {
    this.canvas = canvas
    this.ctx = canvas.getContext('2d')!
  }

  syncProject(project: Project) {
    const needed = new Set<string>()

    for (const track of project.tracks) {
      for (const clip of track.clips) {
        if (clip.type === 'video') {
          needed.add(clip.id)
          if (!this.videoEls.has(clip.id)) {
            const el = document.createElement('video')
            el.src = clip.blobUrl
            el.preload = 'auto'
            el.muted = true
            el.playsInline = true
            this.videoEls.set(clip.id, el)
          }
        }
        if (clip.type === 'audio') {
          needed.add(clip.id)
          if (!this.audioEls.has(clip.id)) {
            const el = document.createElement('audio')
            el.src = clip.blobUrl
            el.preload = 'auto'
            this.audioEls.set(clip.id, el)
          }
        }
      }
    }

    for (const [id, el] of this.videoEls) {
      if (!needed.has(id)) {
        el.src = ''
        this.videoEls.delete(id)
      }
    }
    for (const [id, el] of this.audioEls) {
      if (!needed.has(id)) {
        el.src = ''
        this.audioEls.delete(id)
      }
    }
  }

  renderFrame(project: Project, currentTime: number) {
    const { width, height, backgroundColor } = project
    this.canvas.width = width
    this.canvas.height = height
    const ctx = this.ctx

    ctx.fillStyle = backgroundColor
    ctx.fillRect(0, 0, width, height)

    for (const track of project.tracks) {
      if (track.type !== 'video') continue
      for (const clip of track.clips) {
        const vc = clip as VideoClip
        if (currentTime < vc.startAt || currentTime >= vc.startAt + vc.duration) continue
        const el = this.videoEls.get(vc.id)
        if (!el) continue
        const sourceTime = (currentTime - vc.startAt) * vc.speed + vc.trimStart
        if (Math.abs(el.currentTime - sourceTime) > 0.15) {
          el.currentTime = sourceTime
        }
        if (el.readyState >= 2) {
          ctx.globalAlpha = 1
          ctx.drawImage(el, 0, 0, width, height)
        }
      }
    }

    for (const track of project.tracks) {
      if (track.type !== 'text') continue
      for (const clip of track.clips) {
        const tc = clip as TextClip
        if (currentTime < tc.startAt || currentTime >= tc.startAt + tc.duration) continue
        this.drawText(ctx, tc, width, height)
      }
    }
  }

  private drawText(ctx: CanvasRenderingContext2D, tc: TextClip, w: number, h: number) {
    const x = (tc.x / 100) * w
    const y = (tc.y / 100) * h
    const fontSize = tc.fontSize * (w / 375)
    ctx.font = `${tc.fontStyle} ${tc.fontWeight} ${fontSize}px system-ui, sans-serif`
    ctx.textAlign = tc.align
    ctx.textBaseline = 'middle'

    const lines = tc.text.split('\n')
    const lineH = fontSize * 1.3
    const totalH = lines.length * lineH
    const padding = fontSize * 0.3

    if (tc.bgOpacity > 0) {
      const maxW = lines.reduce((m, l) => {
        const mw = ctx.measureText(l).width
        return mw > m ? mw : m
      }, 0)
      ctx.globalAlpha = tc.bgOpacity
      ctx.fillStyle = tc.bgColor
      const bx = tc.align === 'center' ? x - maxW / 2 - padding
        : tc.align === 'right' ? x - maxW - padding
        : x - padding
      ctx.fillRect(bx, y - totalH / 2 - padding, maxW + padding * 2, totalH + padding * 2)
    }

    ctx.globalAlpha = 1
    ctx.fillStyle = tc.color
    lines.forEach((line, i) => {
      ctx.fillText(line, x, y - totalH / 2 + lineH * i + lineH / 2)
    })
  }

  startPlayback(project: Project, currentTime: number, totalDuration: number) {
    this.playing = true
    this.startWallTime = performance.now()
    this.startProjectTime = currentTime

    const activeVideos = new Set<string>()
    const activeAudios = new Set<string>()

    const loop = () => {
      if (!this.playing) return
      const elapsed = (performance.now() - this.startWallTime) / 1000
      const t = this.startProjectTime + elapsed

      if (t >= totalDuration) {
        this.stopPlayback(project)
        this.renderFrame(project, 0)
        this.onEnded?.()
        return
      }

      this.onTimeUpdate?.(t)

      for (const track of project.tracks) {
        for (const clip of track.clips) {
          if (clip.type === 'video') {
            const vc = clip as VideoClip
            const el = this.videoEls.get(vc.id)
            if (!el) continue
            const inRange = t >= vc.startAt && t < vc.startAt + vc.duration
            if (inRange) {
              if (!activeVideos.has(vc.id)) {
                activeVideos.add(vc.id)
                const sourceTime = (t - vc.startAt) * vc.speed + vc.trimStart
                el.currentTime = sourceTime
                el.playbackRate = vc.speed
                el.volume = vc.volume
                el.play().catch(() => {})
              }
            } else {
              if (activeVideos.has(vc.id)) {
                activeVideos.delete(vc.id)
                el.pause()
              }
            }
          }
          if (clip.type === 'audio') {
            const ac = clip
            const el = this.audioEls.get(ac.id)
            if (!el) continue
            const inRange = t >= ac.startAt && t < ac.startAt + ac.duration
            if (inRange) {
              if (!activeAudios.has(ac.id)) {
                activeAudios.add(ac.id)
                const sourceTime = (t - ac.startAt) * ac.speed + ac.trimStart
                el.currentTime = sourceTime
                el.playbackRate = ac.speed
                el.volume = ac.volume
                el.play().catch(() => {})
              }
            } else {
              if (activeAudios.has(ac.id)) {
                activeAudios.delete(ac.id)
                el.pause()
              }
            }
          }
        }
      }

      this.renderFrame(project, t)
      this.rafId = requestAnimationFrame(loop)
    }
    this.rafId = requestAnimationFrame(loop)
  }

  stopPlayback(_project?: Project) {
    this.playing = false
    if (this.rafId !== null) {
      cancelAnimationFrame(this.rafId)
      this.rafId = null
    }
    for (const el of this.videoEls.values()) el.pause()
    for (const el of this.audioEls.values()) el.pause()
  }

  seekTo(project: Project, t: number) {
    this.renderFrame(project, t)
  }

  destroy() {
    this.playing = false
    if (this.rafId !== null) {
      cancelAnimationFrame(this.rafId)
      this.rafId = null
    }
    for (const el of this.videoEls.values()) { el.pause(); el.src = '' }
    for (const el of this.audioEls.values()) { el.pause(); el.src = '' }
    this.videoEls.clear()
    this.audioEls.clear()
  }
}

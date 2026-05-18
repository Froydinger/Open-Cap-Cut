export interface VideoMeta {
  duration: number
  width: number
  height: number
  thumbnail: string
}

export interface AudioMeta {
  duration: number
}

export async function getVideoMeta(file: File): Promise<VideoMeta> {
  return new Promise((resolve, reject) => {
    const url = URL.createObjectURL(file)
    const video = document.createElement('video')
    video.preload = 'metadata'
    video.muted = true
    video.playsInline = true

    video.onloadedmetadata = () => {
      video.currentTime = 0.5
    }

    video.onseeked = () => {
      const canvas = document.createElement('canvas')
      const w = video.videoWidth || 640
      const h = video.videoHeight || 480
      canvas.width = Math.min(w, 320)
      canvas.height = Math.round((Math.min(w, 320) / w) * h)
      const ctx = canvas.getContext('2d')!
      ctx.drawImage(video, 0, 0, canvas.width, canvas.height)
      const thumbnail = canvas.toDataURL('image/jpeg', 0.7)
      URL.revokeObjectURL(url)
      resolve({
        duration: video.duration,
        width: video.videoWidth || 640,
        height: video.videoHeight || 480,
        thumbnail,
      })
    }

    video.onerror = () => {
      URL.revokeObjectURL(url)
      reject(new Error('Failed to load video metadata'))
    }

    video.src = url
  })
}

export async function getAudioMeta(file: File): Promise<AudioMeta> {
  return new Promise((resolve, reject) => {
    const url = URL.createObjectURL(file)
    const audio = document.createElement('audio')
    audio.preload = 'metadata'
    audio.onloadedmetadata = () => {
      URL.revokeObjectURL(url)
      resolve({ duration: audio.duration })
    }
    audio.onerror = () => {
      URL.revokeObjectURL(url)
      reject(new Error('Failed to load audio metadata'))
    }
    audio.src = url
  })
}

export function formatTime(seconds: number): string {
  const m = Math.floor(seconds / 60)
  const s = Math.floor(seconds % 60)
  const ms = Math.floor((seconds % 1) * 10)
  return `${m}:${String(s).padStart(2, '0')}.${ms}`
}

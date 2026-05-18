export interface VideoClip {
  id: string
  type: 'video'
  file: File
  blobUrl: string
  name: string
  startAt: number
  duration: number
  trimStart: number
  trimEnd: number
  sourceDuration: number
  volume: number
  speed: number
  width: number
  height: number
  thumbnail?: string
}

export interface AudioClip {
  id: string
  type: 'audio'
  file: File
  blobUrl: string
  name: string
  startAt: number
  duration: number
  trimStart: number
  trimEnd: number
  sourceDuration: number
  volume: number
  speed: number
}

export interface TextClip {
  id: string
  type: 'text'
  text: string
  startAt: number
  duration: number
  x: number
  y: number
  fontSize: number
  color: string
  fontWeight: 'normal' | 'bold'
  fontStyle: 'normal' | 'italic'
  align: 'left' | 'center' | 'right'
  bgColor: string
  bgOpacity: number
}

export type Clip = VideoClip | AudioClip | TextClip
export type MediaClip = VideoClip | AudioClip

export interface Track {
  id: string
  type: 'video' | 'audio' | 'text'
  clips: Clip[]
}

export interface Project {
  tracks: Track[]
  width: number
  height: number
  fps: number
  backgroundColor: string
}

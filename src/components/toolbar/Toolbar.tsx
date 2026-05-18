import { useRef, useState } from 'react'
import { useTimelineStore, genId } from '../../stores/timeline-store'
import { usePlayerStore } from '../../stores/player-store'
import { getVideoMeta, getAudioMeta } from '../../engine/video-meta'
import { TextSheet } from '../panels/TextSheet'
import type { VideoClip, AudioClip } from '../../types'

export function Toolbar() {
  const fileRef = useRef<HTMLInputElement>(null)
  const addClip = useTimelineStore(s => s.addClip)
  const selectedId = useTimelineStore(s => s.selectedId)
  const splitClipAt = useTimelineStore(s => s.splitClipAt)
  const currentTime = usePlayerStore(s => s.currentTime)
  const totalDuration = useTimelineStore(s => s.totalDuration)
  const project = useTimelineStore(s => s.project)

  const [exporting, setExporting] = useState(false)
  const [progress, setProgress] = useState(0)
  const [textOpen, setTextOpen] = useState(false)
  const [importing, setImporting] = useState(false)

  const handleImport = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || [])
    if (!files.length) return
    setImporting(true)
    for (const file of files) {
      try {
        if (file.type.startsWith('video/')) {
          const meta = await getVideoMeta(file)
          const clip: VideoClip = {
            id: genId(),
            type: 'video',
            file,
            blobUrl: URL.createObjectURL(file),
            name: file.name.replace(/\.[^.]+$/, ''),
            startAt: 0,
            duration: meta.duration,
            trimStart: 0,
            trimEnd: 0,
            sourceDuration: meta.duration,
            volume: 1,
            speed: 1,
            width: meta.width,
            height: meta.height,
            thumbnail: meta.thumbnail,
          }
          addClip(clip, 'video')
        } else if (file.type.startsWith('audio/')) {
          const meta = await getAudioMeta(file)
          const clip: AudioClip = {
            id: genId(),
            type: 'audio',
            file,
            blobUrl: URL.createObjectURL(file),
            name: file.name.replace(/\.[^.]+$/, ''),
            startAt: 0,
            duration: meta.duration,
            trimStart: 0,
            trimEnd: 0,
            sourceDuration: meta.duration,
            volume: 1,
            speed: 1,
          }
          addClip(clip, 'audio')
        }
      } catch (err) {
        console.error('Import failed:', err)
      }
    }
    setImporting(false)
    if (fileRef.current) fileRef.current.value = ''
  }

  const handleExport = async () => {
    const dur = totalDuration()
    if (dur === 0) return
    setExporting(true)
    setProgress(0)
    try {
      let blob: Blob
      if ('VideoEncoder' in window) {
        const { exportWithWebCodecs } = await import('../../engine/export-webcodecs')
        blob = await exportWithWebCodecs(project, dur, p => setProgress(Math.round(p * 100)))
      } else {
        const { exportWithMediaRecorder } = await import('../../engine/export-mediarecorder')
        blob = await exportWithMediaRecorder(project, dur, p => setProgress(Math.round(p * 100)))
      }
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `opencut-export.${blob.type.includes('mp4') ? 'mp4' : 'webm'}`
      a.click()
      setTimeout(() => URL.revokeObjectURL(url), 5000)
    } catch (err) {
      console.error('Export failed:', err)
      alert('Export failed. See console for details.')
    }
    setExporting(false)
    setProgress(0)
  }

  const handleSplit = () => {
    if (!selectedId) return
    splitClipAt(selectedId, currentTime)
  }

  return (
    <>
      <div className="toolbar">
        <div className="toolbar-left">
          <span className="app-title">✂ OpenCut</span>
        </div>
        <div className="toolbar-actions">
          <button
            className="btn-tool"
            onClick={() => fileRef.current?.click()}
            disabled={importing}
            title="Import video or audio"
          >
            {importing ? '⏳' : '＋'} Import
          </button>
          <button
            className="btn-tool"
            onClick={() => setTextOpen(true)}
            title="Add text overlay"
          >
            T Text
          </button>
          <button
            className="btn-tool"
            onClick={handleSplit}
            disabled={!selectedId}
            title="Split selected clip at playhead"
          >
            ✂ Split
          </button>
          <button
            className="btn-export"
            onClick={handleExport}
            disabled={exporting || totalDuration() === 0}
            title="Export video"
          >
            {exporting ? `${progress}%` : '⬇ Export'}
          </button>
        </div>
      </div>
      <input
        ref={fileRef}
        type="file"
        accept="video/*,audio/*"
        multiple
        style={{ display: 'none' }}
        onChange={handleImport}
      />
      <TextSheet open={textOpen} onClose={() => setTextOpen(false)} />
    </>
  )
}

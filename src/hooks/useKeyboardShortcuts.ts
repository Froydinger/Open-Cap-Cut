import { useEffect } from 'react'
import { useTimelineStore } from '../stores/timeline-store'
import { usePlayerStore } from '../stores/player-store'

export function useKeyboardShortcuts(onImport: () => void, onExport: () => void, onAddText: () => void) {
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      const target = e.target as HTMLElement
      if (
        target.tagName === 'INPUT' ||
        target.tagName === 'TEXTAREA' ||
        target.isContentEditable
      ) return

      const { selectedId, splitClipAt, removeClip, setSelected, setPxPerSecond, pxPerSecond } = useTimelineStore.getState()
      const { currentTime, duration, setCurrentTime, togglePlay, setPlaying } = usePlayerStore.getState()

      const cmd = e.metaKey || e.ctrlKey

      switch (e.key) {
        case ' ':
          e.preventDefault()
          togglePlay()
          break
        case 'Delete':
        case 'Backspace':
          if (selectedId) {
            e.preventDefault()
            removeClip(selectedId)
          }
          break
        case 'ArrowLeft':
          e.preventDefault()
          setPlaying(false)
          setCurrentTime(Math.max(0, currentTime - (e.shiftKey ? 5 : 0.1)))
          break
        case 'ArrowRight':
          e.preventDefault()
          setPlaying(false)
          setCurrentTime(Math.min(duration, currentTime + (e.shiftKey ? 5 : 0.1)))
          break
        case 'Home':
          e.preventDefault()
          setPlaying(false)
          setCurrentTime(0)
          break
        case 'End':
          e.preventDefault()
          setPlaying(false)
          setCurrentTime(duration)
          break
        case 'Escape':
          setSelected(null)
          break
        case 's':
        case 'S':
          if (!cmd && selectedId) {
            e.preventDefault()
            splitClipAt(selectedId, currentTime)
          }
          break
        case 'i':
        case 'I':
          if (!cmd) {
            e.preventDefault()
            onImport()
          }
          break
        case 't':
        case 'T':
          if (!cmd) {
            e.preventDefault()
            onAddText()
          }
          break
        case 'e':
        case 'E':
          if (cmd) {
            e.preventDefault()
            onExport()
          }
          break
        case '=':
        case '+':
          e.preventDefault()
          setPxPerSecond(pxPerSecond * 1.25)
          break
        case '-':
        case '_':
          e.preventDefault()
          setPxPerSecond(pxPerSecond / 1.25)
          break
      }
    }
    window.addEventListener('keydown', handler)
    return () => window.removeEventListener('keydown', handler)
  }, [onImport, onExport, onAddText])
}

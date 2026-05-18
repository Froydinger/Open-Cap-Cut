import { usePlayerStore } from '../../stores/player-store'

interface Props {
  pxPerSecond: number
}

export function Playhead({ pxPerSecond }: Props) {
  const currentTime = usePlayerStore(s => s.currentTime)
  const x = currentTime * pxPerSecond

  return (
    <div className="playhead" style={{ left: x }}>
      <div className="playhead-head" />
      <div className="playhead-line" />
    </div>
  )
}

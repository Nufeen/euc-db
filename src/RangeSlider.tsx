import { useRef } from 'react'
import styles from './RangeSlider.module.css'

interface RangeSliderProps {
  label: string
  min: number
  max: number
  value: [number, number]
  onChange: (value: [number, number]) => void
}

function RangeSlider({ label, min, max, value, onChange }: RangeSliderProps) {
  const trackRef = useRef<HTMLDivElement>(null)
  const [minVal, maxVal] = value

  const toPercent = (v: number) => ((v - min) / (max - min)) * 100

  const getValueFromX = (clientX: number) => {
    const track = trackRef.current
    if (!track) return 0
    const rect = track.getBoundingClientRect()
    const ratio = Math.max(0, Math.min(1, (clientX - rect.left) / rect.width))
    return Math.round(min + ratio * (max - min))
  }

  const handlePointerDown = (thumb: 'min' | 'max') => (e: React.PointerEvent) => {
    e.preventDefault()
    const onMove = (ev: PointerEvent) => {
      const v = getValueFromX(ev.clientX)
      if (thumb === 'min') {
        onChange([Math.min(Math.max(v, min), maxVal), maxVal])
      } else {
        onChange([minVal, Math.max(Math.min(v, max), minVal)])
      }
    }
    const onUp = () => {
      window.removeEventListener('pointermove', onMove)
      window.removeEventListener('pointerup', onUp)
    }
    window.addEventListener('pointermove', onMove)
    window.addEventListener('pointerup', onUp)
  }

  return (
    <div className={styles.rangeSlider}>
      <span className={styles.rangeSliderLabel}>{label}</span>
      <div className={styles.rangeSliderTrack} ref={trackRef}>
        <div
          className={styles.rangeSliderFill}
          style={{
            left: `${toPercent(minVal)}%`,
            width: `${toPercent(maxVal) - toPercent(minVal)}%`,
          }}
        />
        {(['min', 'max'] as const).map((thumb) => {
          const val = thumb === 'min' ? minVal : maxVal
          return (
            <div
              key={thumb}
              className={styles.rangeSliderThumb}
              style={{ left: `${toPercent(val)}%` }}
              onPointerDown={handlePointerDown(thumb)}
            >
              <span className={styles.rangeSliderValue}>{val}</span>
            </div>
          )
        })}
      </div>
    </div>
  )
}

export default RangeSlider

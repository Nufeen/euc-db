import { useRef, useState } from 'react'
import styles from './Table.module.css'

interface BegodeItem {
  [key: string]: string | number | boolean | null
}

interface TableProps {
  data: BegodeItem[]
}

interface SortConfig {
  column: string | null
  direction: 'asc' | 'desc'
}

interface SpeedFilter {
  min: number | null
  max: number | null
}

const unitMap: Record<string, string> = {
  power_w: 'W',
  battery_wh: 'Wh',
  voltage_v: 'V',
  weight_kg: 'kg',
  max_speed_kmh: 'km/h',
  range_km: 'km',
}

const columnLabels: Record<string, string> = {
  power_w: 'Power',
  battery_wh: 'Battery',
  voltage_v: 'Voltage',
  weight_kg: 'Weight',
  max_speed_kmh: 'Max Speed',
  range_km: 'Range',
}

function RangeSlider({
  label,
  min,
  max,
  value,
  onChange,
}: {
  label: string
  min: number
  max: number
  value: [number, number]
  onChange: (value: [number, number]) => void
}) {
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

function formatValue(value: string | number | boolean | null, unit: string | undefined): string {
  if (value === null || value === undefined) {
    return '—'
  }
  if (typeof value === 'boolean') {
    return value ? 'Yes' : 'No'
  }
  if (typeof value === 'number' && unit) {
    return `${value} ${unit}`
  }
  return String(value)
}

function Table({ data }: TableProps) {
  const [sortConfig, setSortConfig] = useState<SortConfig>({ column: null, direction: 'asc' })
  const [speedFilter, setSpeedFilter] = useState<SpeedFilter>({ min: null, max: null })

  if (!data || data.length === 0) {
    return <p>No data</p>
  }

  const columns = Object.keys(data[0])

  const maxSpeedValues = data
    .filter((row) => typeof row.max_speed_kmh === 'number')
    .map((row) => row.max_speed_kmh as number)
  const globalMinSpeed = maxSpeedValues.length > 0 ? Math.min(...maxSpeedValues) : 0
  const globalMaxSpeed = maxSpeedValues.length > 0 ? Math.max(...maxSpeedValues) : 100

  const effectiveMin = speedFilter.min ?? globalMinSpeed
  const effectiveMax = speedFilter.max ?? globalMaxSpeed

  const filteredData = data.filter((row) => {
    const speed = row.max_speed_kmh
    if (typeof speed !== 'number') return false
    if (speedFilter.min !== null && speed < speedFilter.min) return false
    if (speedFilter.max !== null && speed > speedFilter.max) return false
    return true
  })

  const sortedData = [...filteredData]
  if (sortConfig.column) {
    sortedData.sort((a, b) => {
      const aVal = a[sortConfig.column!]
      const bVal = b[sortConfig.column!]

      if (aVal === null || aVal === undefined) return 1
      if (bVal === null || bVal === undefined) return -1

      let comparison = 0
      if (typeof aVal === 'number' && typeof bVal === 'number') {
        comparison = aVal - bVal
      } else {
        comparison = String(aVal).localeCompare(String(bVal))
      }

      return sortConfig.direction === 'asc' ? comparison : -comparison
    })
  }

  const handleSort = (column: string) => {
    setSortConfig((prev) => ({
      column,
      direction: prev.column === column && prev.direction === 'asc' ? 'desc' : 'asc',
    }))
  }

  const getSortIcon = (column: string) => {
    if (sortConfig.column !== column) return ' ⇅'
    return sortConfig.direction === 'asc' ? ' ↑' : ' ↓'
  }

  const handleSpeedFilterChange = ([newMin, newMax]: [number, number]) => {
    setSpeedFilter({
      min: newMin === globalMinSpeed ? null : newMin,
      max: newMax === globalMaxSpeed ? null : newMax,
    })
  }

  return (
    <div className={styles.container}>
      <div className={styles.filterRow}>
        <RangeSlider
          label="Max Speed"
          min={globalMinSpeed}
          max={globalMaxSpeed}
          value={[effectiveMin, effectiveMax]}
          onChange={handleSpeedFilterChange}
        />
      </div>
      <table>
        <thead>
          <tr className={styles.headerRow}>
            {columns.map((col) => (
              <th key={col} onClick={() => handleSort(col)} className={styles.sortableHeader}>
                {columnLabels[col] || col}
                <span
                  className={sortConfig.column === col ? styles.sortIconActive : styles.sortIcon}
                >
                  {getSortIcon(col)}
                </span>
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {sortedData.map((row, idx) => (
            <tr key={idx}>
              {columns.map((col) => {
                const unit = unitMap[col]
                const value = row[col]
                return <td key={col}>{formatValue(value, unit)}</td>
              })}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}

export default Table

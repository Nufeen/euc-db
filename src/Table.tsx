import { useState } from 'react'
import styles from './Table.module.css'
import RangeSlider from './RangeSlider'

interface BegodeItem {
  [key: string]: string | number | boolean | null | undefined
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

interface WeightFilter {
  min: number | null
  max: number | null
}

interface SuspensionFilter {
  enabled: boolean
}

const unitMap: Record<string, string> = {
  power_w: 'W',
  battery_wh: 'Wh',
  voltage_v: 'V',
  weight_kg: 'kg',
  max_speed_kmh: 'km/h',
  range_km: 'km',
  diameter_inch: '"',
}

const columnLabels: Record<string, string> = {
  power_w: 'Power',
  battery_wh: 'Battery',
  voltage_v: 'Voltage',
  weight_kg: 'Weight',
  max_speed_kmh: 'Max Speed',
  range_km: 'Range',
  diameter_inch: 'Diameter',
}

function getSpeedBgColor(value: number, min: number, max: number): string {
  const pct = (value - min) / (max - min)
  if (pct >= 0.8) return 'var(--pico-color-green-600)'
  if (pct >= 0.6) return 'var(--pico-color-green-700)'
  if (pct >= 0.4) return 'var(--pico-color-green-800)'
  return 'transparent'
}

function getWeightBgColor(value: number, min: number, max: number): string {
  const pct = (value - min) / (max - min)
  if (pct >= 0.9) return 'var(--pico-color-red-600)'
  if (pct >= 0.8) return 'var(--pico-color-red-700)'
  if (pct >= 0.7) return 'var(--pico-color-red-800)'
  if (pct >= 0.6) return 'var(--pico-color-red-800)'

  return 'transparent'
}

function formatValue(
  value: string | number | boolean | null | undefined,
  unit: string | undefined,
): string {
  if (value === null || value === undefined) {
    return '—'
  }
  if (typeof value === 'boolean') {
    return value ? '✅' : '—'
  }
  if (typeof value === 'number' && unit) {
    return `${value} ${unit}`
  }
  return String(value)
}

function Table({ data }: TableProps) {
  const [sortConfig, setSortConfig] = useState<SortConfig>({
    column: 'model',
    direction: 'asc',
  })
  const [speedFilter, setSpeedFilter] = useState<SpeedFilter>({ min: null, max: null })
  const [weightFilter, setWeightFilter] = useState<WeightFilter>({ min: null, max: null })
  const [suspensionFilter, setSuspensionFilter] = useState<SuspensionFilter>({ enabled: false })

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

  const weightValues = data
    .filter((row) => typeof row.weight_kg === 'number')
    .map((row) => row.weight_kg as number)
  const globalMinWeight = weightValues.length > 0 ? Math.min(...weightValues) : 0
  const globalMaxWeight = weightValues.length > 0 ? Math.max(...weightValues) : 100

  const effectiveWeightMin = weightFilter.min ?? globalMinWeight
  const effectiveWeightMax = weightFilter.max ?? globalMaxWeight

  const filteredData = data.filter((row) => {
    const speed = row.max_speed_kmh
    if (typeof speed !== 'number') return false
    if (speedFilter.min !== null && speed < speedFilter.min) return false
    if (speedFilter.max !== null && speed > speedFilter.max) return false

    const weight = row.weight_kg
    if (typeof weight !== 'number') return false
    if (weightFilter.min !== null && weight < weightFilter.min) return false
    if (weightFilter.max !== null && weight > weightFilter.max) return false

    if (suspensionFilter.enabled && row.suspension !== true) return false

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

  const handleWeightFilterChange = ([newMin, newMax]: [number, number]) => {
    setWeightFilter({
      min: newMin === globalMinWeight ? null : newMin,
      max: newMax === globalMaxWeight ? null : newMax,
    })
  }
  const H = [
    'cell_model',
    'year',
    'suspension',
    'voltage_v',
    'power_w',
    'range_km',
    'diameter_inch',
  ]

  return (
    <div className={styles.container}>
      <header>
        <div className={styles.filterRow}>
          <RangeSlider
            label="Max Speed"
            min={globalMinSpeed}
            max={globalMaxSpeed}
            value={[effectiveMin, effectiveMax]}
            onChange={handleSpeedFilterChange}
          />
          <RangeSlider
            label="Weight"
            min={globalMinWeight}
            max={globalMaxWeight}
            value={[effectiveWeightMin, effectiveWeightMax]}
            onChange={handleWeightFilterChange}
          />
        </div>
        <div className="pico-color-pink-500">
          ⚠️ Data is gathered by robots and may contain errors
        </div>
      </header>

      <table>
        <thead>
          <tr className={styles.headerRow}>
            {columns.map((col) => (
              <th
                key={col}
                onClick={() => handleSort(col)}
                className={`${styles.sortableHeader} ${H.includes(col) ? styles.hideOnMobile : ''}`}
              >
                {col === 'suspension' ? (
                  <input
                    type="checkbox"
                    checked={suspensionFilter.enabled}
                    onChange={(e) => setSuspensionFilter({ enabled: e.target.checked })}
                    onClick={(e) => e.stopPropagation()}
                    title="Filter by suspension"
                  />
                ) : null}
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
                const isMobileHidden = H.includes(col)

                if (col === 'model') {
                  return (
                    <td key={col}>
                      {row.model}
                      <span className={styles.mobileYear}> ({row.year})</span>
                    </td>
                  )
                }

                if (col === 'max_speed_kmh' && typeof value === 'number') {
                  return (
                    <td
                      key={col}
                      style={{
                        backgroundColor: getSpeedBgColor(value, globalMinSpeed, globalMaxSpeed),
                      }}
                    >
                      {formatValue(value, unit)}
                    </td>
                  )
                }

                if (col === 'weight_kg' && typeof value === 'number') {
                  return (
                    <td
                      key={col}
                      className={isMobileHidden ? styles.hideOnMobile : ''}
                      style={{
                        backgroundColor: getWeightBgColor(value, globalMinWeight, globalMaxWeight),
                      }}
                    >
                      {formatValue(value, unit)}
                    </td>
                  )
                }

                return (
                  <td key={col} className={isMobileHidden ? styles.hideOnMobile : ''}>
                    {formatValue(value, unit)}
                  </td>
                )
              })}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}

export default Table

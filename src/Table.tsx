import { useState } from 'react'

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

  if (!data || data.length === 0) {
    return <p>No data</p>
  }

  const columns = Object.keys(data[0])

  const sortedData = [...data]
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

  const getSortIconStyle = (column: string) => {
    return {
      opacity: sortConfig.column === column ? 1 : 0.3,
    }
  }

  return (
    <table>
      <thead>
        <tr>
          {columns.map((col) => (
            <th key={col} onClick={() => handleSort(col)} style={{ cursor: 'pointer' }}>
              {columnLabels[col] || col}
              <span style={getSortIconStyle(col)}>{getSortIcon(col)}</span>
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
  )
}

export default Table

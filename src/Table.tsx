interface BegodeItem {
  [key: string]: string | number | boolean | null
}

interface TableProps {
  data: BegodeItem[]
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
  if (!data || data.length === 0) {
    return <p>No data</p>
  }

  const columns = Object.keys(data[0])

  return (
    <table>
      <thead>
        <tr>
          {columns.map((col) => (
            <th key={col}>{columnLabels[col] || col}</th>
          ))}
        </tr>
      </thead>
      <tbody>
        {data.map((row, idx) => (
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

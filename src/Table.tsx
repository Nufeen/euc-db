interface BegodeItem {
  [key: string]: string | number | boolean | null
}

interface TableProps {
  data: BegodeItem[]
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
            <th key={col}>{col}</th>
          ))}
        </tr>
      </thead>
      <tbody>
        {data.map((row, idx) => (
          <tr key={idx}>
            {columns.map((col) => (
              <td key={col}>{row[col]}</td>
            ))}
          </tr>
        ))}
      </tbody>
    </table>
  )
}

export default Table

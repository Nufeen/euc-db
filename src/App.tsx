import Table from './Table'
import data from '../assets/begode.json'

function App() {
  return (
    <div>
      <h1>Begode Data</h1>
      <Table data={data} />
    </div>
  )
}

export default App

import Table from './Table'
import data from '../assets/begode.json'
import S from './App.module.css'

function App() {
  return (
    <div className={S.root}>
      <Table data={data} />
    </div>
  )
}

export default App

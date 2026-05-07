import Table from './Table'
import begodeData from '../assets/begode.json'
import gotwayData from '../assets/gotway.json'
import kingsongData from '../assets/kingsong.json'
import veteranData from '../assets/veteran.json'
import extremeBullData from '../assets/extreme_bull.json'
import ninebotData from '../assets/ninebot.json'
import inmotionData from '../assets/inmotion.json'
import nosfetData from '../assets/nosfet.json'
import S from './App.module.css'
import { useState } from 'react'

interface BegodeItem {
  [key: string]: string | number | boolean | null | undefined
}

function App() {
  // Load all data sources
  const dataSources = {
    begode: begodeData as BegodeItem[],
    gotway: gotwayData as BegodeItem[],
    kingsong: kingsongData as BegodeItem[],
    veteran: veteranData as BegodeItem[],
    extreme_bull: extremeBullData as BegodeItem[],
    ninebot: ninebotData as BegodeItem[],
    inmotion: inmotionData as BegodeItem[],
    nosfet: nosfetData as BegodeItem[],
  } as Record<string, BegodeItem[]>

  const [selectedSources, setSelectedSources] = useState<string[]>(Object.keys(dataSources))

  const M = {
    begode: 'Begode',
    gotway: 'Gotway',
    kingsong: 'Kingsong',
    veteran: 'Veteran',
    extreme_bull: 'Extreme Bull',
    ninebot: 'Ninebot',
    inmotion: 'Inmotion',
    nosfet: 'Nosfet',
  } as Record<string, string>

  const chatBrand: Record<string, string> = {
    begode: 'Begode',
    gotway: 'Gotway',
    kingsong: 'Kingsong',
    veteran: 'Veteran',
    extreme_bull: 'Extremebull',
    ninebot: 'Ninebot',
    inmotion: 'Inmotion',
    nosfet: 'Nosfet',
  }

  // Combine data from selected sources and add source information
  const combinedData = selectedSources.flatMap((source) => {
    return (dataSources[source] || []).map((item) => ({
      ...item,
      model: `${M[source]} ${item.model}`,
      _brand: chatBrand[source],
      _model: item.model,
    }))
  })

  const handleSourceSelection = (source: string) => {
    setSelectedSources((prev) => {
      if (prev.includes(source)) {
        return prev.filter((s) => s !== source)
      } else {
        return [...prev, source]
      }
    })
  }

  return (
    <div className={S.root}>
      <div className={S.filterLine}>
        {Object.keys(dataSources).map((source) => (
          <button
            key={source}
            onClick={() => handleSourceSelection(source)}
            className={selectedSources.includes(source) ? S.selected : ''}
          >
            {M[source]}
          </button>
        ))}
        <button
          onClick={() => setSelectedSources(Object.keys(dataSources))}
          className={selectedSources.length === Object.keys(dataSources).length ? S.selected : ''}
        >
          All
        </button>
      </div>
      <Table data={combinedData} />
    </div>
  )
}

export default App

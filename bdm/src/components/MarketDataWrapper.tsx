import { some, every } from 'lodash'
import React from 'react'
import { RouteComponentProps } from 'react-router-dom'
import { Progress } from 'antd'

import { IMarketContext } from '../models'
import {
  useGenericBranches,
  useMarkt,
  useMarktConfig,
  useObstakel,
  usePlaatseigenschap,
  useSaveMarktConfig,
} from '../hooks'
import CreateMarketConfig from './CreateMarketConfig'
import ErrorPage from '../pages/ErrorPage'

export const MarketContext = React.createContext<Partial<IMarketContext>>({})

const MarketDataWrapper: React.FC<RouteComponentProps<{ id: string }>> = (props) => {
  const marktId = props.match.params.id
  const { mutate: saveMarktConfig, isLoading: saveInProgress } = useSaveMarktConfig(marktId)

  const markt = useMarkt(marktId)
  const marktConfig = useMarktConfig(marktId)
  const genericBranches = useGenericBranches()
  const obstakel = useObstakel()
  const plaatseigenschap = usePlaatseigenschap()
  const data = [markt, marktConfig, genericBranches, obstakel, plaatseigenschap]
  let page = null

  if (some(data, (item) => item.isLoading)) {
    const percent = (data.filter((item) => item.isSuccess).length / data.length) * 100
    const style: React.CSSProperties = {
      position: 'absolute',
      top: '50%',
      left: '50%',
      transform: 'translate(-50%, -50%)',
    }
    return (
      <div style={style}>
        <Progress type="circle" percent={percent} />
      </div>
    )
  }

  const marketContext: IMarketContext = {
    marktId,
    saveMarktConfig,
    saveInProgress,
    markt: markt.data,
    marktConfig: marktConfig.data,
    genericBranches: genericBranches.data,
    obstakel: obstakel.data,
    plaatseigenschap: plaatseigenschap.data,
  }

  if (every(data, (item) => item.isSuccess)) {
    page = props.children
  }

  if (marktConfig.error?.status === 404 && markt.data) {
    page = <CreateMarketConfig />
  }

  if (page) {
    return <MarketContext.Provider value={marketContext}>{page}</MarketContext.Provider>
  }

  console.error(data)
  if (markt.error?.status === 404) {
    return <h1>Markt met id {marktId} kon niet gevonden worden</h1>
  }
  return <ErrorPage />
}

export default MarketDataWrapper

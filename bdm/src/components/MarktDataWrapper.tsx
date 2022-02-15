import { some, every } from 'lodash'
import React from 'react'
import { RouteComponentProps } from 'react-router-dom'

import { IMarktContext } from '../models'
import {
  useGenericBranches,
  useMarkt,
  useMarktConfig,
  useObstakel,
  usePlaatseigenschap,
  useSaveMarktConfig,
} from '../hooks'
import CreateMarktConfig from './CreateMarktConfig'
import ErrorPage from '../pages/ErrorPage'
import QueryProgress from './QueryProgress'
import CenterStageStyled from './CenterStage.styled'

export const MarktContext = React.createContext<Partial<IMarktContext>>({})

const MarketDataWrapper: React.FC<RouteComponentProps<{ id: string }>> = (props) => {
  const marktId = props.match.params.id
  const { mutate: saveMarktConfig, isLoading: saveInProgress } = useSaveMarktConfig(marktId)

  const markt = useMarkt(marktId)
  const marktConfig = useMarktConfig(marktId)
  const genericBranches = useGenericBranches()
  const obstakel = useObstakel()
  const plaatseigenschap = usePlaatseigenschap()
  const data = [markt, marktConfig, genericBranches, obstakel, plaatseigenschap]

  const marktContext: IMarktContext = {
    marktId,
    saveMarktConfig,
    saveInProgress,
    markt: markt.data,
    marktConfig: marktConfig.data,
    genericBranches: genericBranches.data,
    obstakel: obstakel.data,
    plaatseigenschap: plaatseigenschap.data,
  }

  const getPageByApiStatus = () => {
    if (some(data, (item) => item.isLoading)) {
      return (
        <CenterStageStyled>
          <QueryProgress queryData={data} />
        </CenterStageStyled>
      )
    }

    if (every(data, (item) => item.isSuccess)) {
      return props.children
    }

    if (marktConfig.error?.status === 404 && markt.data) {
      return <CreateMarktConfig />
    }

    if (markt.error?.status === 404) {
      return <p>Markt met id {marktId} kon niet gevonden worden</p>
    }
    return <ErrorPage />
  }

  return <MarktContext.Provider value={marktContext}>{getPageByApiStatus()}</MarktContext.Provider>
}

export default MarketDataWrapper

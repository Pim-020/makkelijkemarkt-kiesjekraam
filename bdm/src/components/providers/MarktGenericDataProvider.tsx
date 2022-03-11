import { some, every } from 'lodash'
import React from 'react'
import { UseQueryResult } from 'react-query'

import { IMarktGenericContext, IQueryContext } from '../../models'
import { useGenericBranches, useObstakel, usePlaatseigenschap } from '../../hooks'

export const getQueryContext = (queries: UseQueryResult<any, any>[]): IQueryContext => {
  return {
    isLoading: some(queries, (query) => query.isLoading),
    isSuccess: every(queries, (query) => query.isSuccess),
    errors: queries.map((query) => query.error),
    queryProgress: queries.filter((query) => query.isSuccess).length / queries.length,
  }
}

const initialMarktGenericDataContext: IMarktGenericContext = {
  genericBranches: [],
  obstakel: [],
  plaatseigenschap: [],
}
export const MarktGenericContext = React.createContext(initialMarktGenericDataContext)

const MarktGenericDataProvider: React.FC = (props) => {
  const genericBranches = useGenericBranches()
  const obstakel = useObstakel()
  const plaatseigenschap = usePlaatseigenschap()
  const queries = [genericBranches, obstakel, plaatseigenschap]

  const marktGenericContext: IMarktGenericContext & IQueryContext = {
    genericBranches: genericBranches.data || [],
    obstakel: obstakel.data || [],
    plaatseigenschap: plaatseigenschap.data || [],
    ...getQueryContext(queries),
  }

  return <MarktGenericContext.Provider value={marktGenericContext}>{props.children}</MarktGenericContext.Provider>
}

export default MarktGenericDataProvider

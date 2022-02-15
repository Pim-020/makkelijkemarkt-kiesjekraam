import React from 'react'
import { UseQueryResult } from 'react-query'
import { Progress } from 'antd'

import { IApiError } from '../models'

interface Props {
  queryData: UseQueryResult<any, IApiError>[]
}

const QueryProgress: React.VFC<Props> = ({ queryData }) => {
  const percent = (queryData.filter((query) => query.isSuccess).length / queryData.length) * 100
  return <Progress type="circle" percent={percent} />
}

export default QueryProgress

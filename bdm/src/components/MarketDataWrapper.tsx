import { some, every} from 'lodash'
import React from 'react'
import { RouteComponentProps } from 'react-router-dom'
import {Progress} from 'antd'

import { IMarketContext } from '../models'
import { useGenericBranches, useMarkt, useMarktConfig, useObstakel, usePlaatseigenschap, useSaveMarktConfig } from '../hooks'

export const MarketContext = React.createContext<Partial<IMarketContext>>({});

const MarketDataWrapper: React.FC<RouteComponentProps<{id: string}>> = (props) => {
    const marktId = props.match.params.id
    const { mutate: saveMarktConfig, isLoading:saveInProgress } = useSaveMarktConfig(marktId)

    const markt = useMarkt(marktId)
    const marktConfig = useMarktConfig(marktId)
    const genericBranches = useGenericBranches()
    const obstakel = useObstakel()
    const plaatseigenschap = usePlaatseigenschap()
    const data = [markt, marktConfig, genericBranches, obstakel, plaatseigenschap]

    if (some(data, item => item.isLoading)) {
        const percent = (data.filter(item => item.isSuccess).length / data.length) * 100
        return (
            <Progress type="circle" percent={percent} />
        )
    }
    if (some(data, item => item.isError)) {
        console.log(data)
        if (markt.error?.status === 404) {
            return (<h1>Markt bestaat helemaal niet</h1>)
        }
        if (marktConfig.error?.status === 404) {
            return (<h1>MarktConfig bestaat niet - nieuwe aanmaken</h1>)
        }
        return (
            <h1>ERROR</h1>
        )
    }

    if (every(data, item => item.isSuccess)) {
        console.log(data)
        const marketContext: Partial<IMarketContext> = {
            marktId,
            saveMarktConfig,
            saveInProgress,
            markt: markt.data,
            marktConfig: marktConfig.data,
            genericBranches: genericBranches.data,
            obstakel: obstakel.data,
            plaatseigenschap: plaatseigenschap.data,
        }
        return (
            <MarketContext.Provider value={marketContext}>
                {props.children}
            </MarketContext.Provider>
        )
    }
    return null;
}

export default MarketDataWrapper;

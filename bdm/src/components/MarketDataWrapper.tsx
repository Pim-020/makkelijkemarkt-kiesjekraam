import { some, every} from 'lodash'
import React from 'react'

import { IMarketContext } from '../models'
import { useGenericBranches, useMarktConfig, useObstakel } from '../hooks'

export const MarketContext = React.createContext<Partial<IMarketContext>>({});

const MarketDataWrapper: React.FC<{match: any}> = (props) => {
    console.log(props)
    const marktId = props.match.params.id

    const marktConfig = useMarktConfig(marktId)
    // const markt = useMarkt(marktId)
    const genericBranches = useGenericBranches()
    const obstakel = useObstakel()

    const data = [marktConfig, genericBranches, obstakel]

    if (some(data, item => item.isLoading)) {
        return (
            <h1>Loading</h1>
        )
    }
    if (some(data, item => item.isError)) {
        console.log(data)
        // if (markt.error?.status === 404) {
        //     return (<h1>Markt bestaat helemaal niet</h1>)
        // }
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
            genericBranches: genericBranches.data,
            marktConfig: marktConfig.data,
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

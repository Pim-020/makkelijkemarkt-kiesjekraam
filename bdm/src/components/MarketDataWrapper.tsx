import { some, every} from 'lodash'
import React from 'react'
import { useGenericBranches, useMarktConfig } from '../hooks'

interface IMarketContext {
    marktId: string
    genericBranches: [],
    marktConfig: [],
}

export const MarketContext = React.createContext<Partial<IMarketContext>>({});

const MarketDataWrapper: React.FC<{match: any}> = (props) => {
    console.log(props)
    const marktId = props.match.params.id

    const genericBranches = useGenericBranches()
    const marktConfig = useMarktConfig(marktId)

    // console.log({genericBranches, marktConfig})
    const data = [genericBranches, marktConfig]

    if (some(data, item => item.isLoading)) {
        return (
            <h1>Loading</h1>
        )
    }
    if (some(data, item => item.error)) {
        return (
            <h1>ERROR</h1>
        )
    }

    if (every(data, item => item.isSuccess)) {
        console.log(genericBranches.data, marktConfig.data)
        const marketContext: IMarketContext = {
            marktId,
            genericBranches: genericBranches.data,
            marktConfig: marktConfig.data,
        }
        return (
            <MarketContext.Provider value={marketContext}>
                {props.children}
                {/* <MarketPage marktId={marktId}  /> */}
            </MarketContext.Provider>
        )
    }
    return null;
}

export default MarketDataWrapper;

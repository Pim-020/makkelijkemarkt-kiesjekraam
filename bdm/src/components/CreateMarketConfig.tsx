import React, { useContext } from 'react'

import { MarketContext } from './MarketDataWrapper'
import { initialMarktConfiguratie } from '../services/mmApi'
import { IMarketContext } from '../models'

const CreateMarketConfig = () => {
    const marketContext = useContext(MarketContext) as IMarketContext
    const createNewMarketConfig = () => {
        marketContext.saveMarktConfig(initialMarktConfiguratie)
    }
    return (
        <div>
            <h1>{marketContext.markt?.naam}</h1>
            <h2>MarktConfig bestaat niet</h2>
            <button onClick={createNewMarketConfig}>Eerste marktConfig aanmaken</button>
        </div>
    )
}

export default CreateMarketConfig

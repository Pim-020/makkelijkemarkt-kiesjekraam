import React from 'react'
import { initialMarktConfiguratie } from '../services/mmApi'

const CreateMarketConfig = (props: any) => {
    console.log(props)
    const createNewMarketConfig = () => {
        console.log('new')

        props.saveMarktConfig(initialMarktConfiguratie)
    }
    return (
        <div>
            <h1>{props.markt.naam}</h1>
            <h2>MarktConfig bestaat niet</h2>
            <button onClick={createNewMarketConfig}>Eerste marktConfig aanmaken</button>
        </div>
    )
}

export default CreateMarketConfig

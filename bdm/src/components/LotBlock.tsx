import React, { Component, MouseEvent } from "react"
import Stand from "../graphics/Stand"
import Obstacle from "../graphics/Obstacle"
import { AssignedBranche, Lot } from "../models"

export default class LotBlock extends Component<{
    index: number
    lot: Lot
    invert: boolean
    classDef: string
    branche?: AssignedBranche
    lotOnClick: (event: MouseEvent) => void
}> {

    render() {
        const { index, lot, classDef, lotOnClick, invert, branche } = this.props
        return <div key={index} className={classDef} onClick={lotOnClick}>
            {lot.type === "stand" &&
                <Stand stand={lot} invert={invert} branche={branche} classDef={classDef} />
            }
            {lot.type === "obstacle" &&
                <Obstacle obstacle={lot} invert={invert} classDef={classDef} />
            }
        </div>
    }
}
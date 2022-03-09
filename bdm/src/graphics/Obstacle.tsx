import React, { Component } from 'react'
import { COLOR } from '../constants'
import { Lot } from '../models'
import SvgBench from './SvgBench'
import SvgElectra from './SvgElectra'
import SvgLight from './SvgLight'
import SvgLoopje from './SvgLoopje'
import SvgTree from './SvgTree'
import SvgWalkthrough from './SvgWalkthrough'
import SvgWalkWithClose from './SvgWalkWithClose'
import SvgWater from './SvgWater'

export default class Obstacle extends Component<{
  obstacle: Lot
  invert: boolean
  classDef: string
}> {
  getStrokeColor = () => {
    if (this.props.classDef.indexOf('selected') > -1) {
      return '#1890ff'
    }
    return COLOR.WHITE
  }

  getGraphic = () => {
    const obstacleProperties = []
    if (this.props.obstacle.obstakel && this.props.obstacle.obstakel.indexOf('loopje') > -1) {
      obstacleProperties.push(<SvgLoopje key="loopje" color="red" />)
    }
    if (this.props.obstacle.obstakel && this.props.obstacle.obstakel.indexOf('doorloop') > -1) {
      obstacleProperties.push(<SvgWalkthrough key="doorloop" color="red" />)
    }
    if (this.props.obstacle.obstakel && this.props.obstacle.obstakel.indexOf('loopjediedichtmag') > -1) {
      obstacleProperties.push(<SvgWalkWithClose key="loopjedatdichtmag" color="red" />)
    }
    if (this.props.obstacle.obstakel && this.props.obstacle.obstakel.indexOf('electra') > -1) {
      obstacleProperties.push(<SvgElectra key="electra" position={{ x: 2, y: 18 }} />)
    }
    if (this.props.obstacle.obstakel && this.props.obstacle.obstakel.indexOf('water') > -1) {
      obstacleProperties.push(<SvgWater key="water" position={{ x: 35, y: 20 }} />)
    }
    if (this.props.obstacle.obstakel && this.props.obstacle.obstakel.indexOf('bankje') > -1) {
      obstacleProperties.push(<SvgBench key="bankje" position={{ x: 3, y: 2 }} />)
    }
    if (this.props.obstacle.obstakel && this.props.obstacle.obstakel.indexOf('lantaarnpaal') > -1) {
      obstacleProperties.push(<SvgLight key="lantaarnpaal" position={{ x: 31, y: 0 }} />)
    }
    if (this.props.obstacle.obstakel && this.props.obstacle.obstakel.indexOf('boom') > -1) {
      obstacleProperties.push(<SvgTree key="boom" position={{ x: 31, y: 0 }} />)
    }

    return (
      <>
        {obstacleProperties.map((elem: any) => {
          return elem
        })}
      </>
    )
  }

  render() {
    let strokeColor = this.getStrokeColor()
    return (
      <svg style={{ width: '50px' }} viewBox="0 0 50 50">
        {this.getGraphic()}
        <rect
          x={0}
          y={0}
          width={50}
          height={50}
          style={{
            fill: 'none',
            stroke: strokeColor,
            strokeWidth: '4px',
          }}
        />
      </svg>
    )
  }
}

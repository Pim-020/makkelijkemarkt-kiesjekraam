import React from 'react'
import { Component } from 'react'
import { MMarkt, Soort } from '../models/mmarkt'
import { Link } from 'react-router-dom'

export default class MarketItem extends Component<{ market: MMarkt }> {
  readonly state: { market: MMarkt } = {
    market: {
      id: 0,
      afkorting: '',
      naam: '',
      soort: Soort.Dag,
      kiesJeKraamActief: false,
    },
  }

  getMmarktClass = (): string => {
    if (!this.state.market.kiesJeKraamActief) {
      return 'ugly'
    } else {
      return 'tag'
    }
  }

  componentDidMount() {
    this.setState({
      market: this.props.market,
    })
  }

  render() {
    const { market } = this.props
    return (
      <Link
        key={market.afkorting}
        to={{
          pathname: `/market/${market.afkorting}`,
        }}
      >
        <span style={{ fontWeight: 'bold', fontSize: '1.2em' }}>{market.afkorting} </span>
        <span style={{ color: 'rgba(0, 0, 0, 0.45)' }}> {this.state.market.naam || ''}</span>
        {/* {this.state.market && <>{Object.keys(this.state.market.events).map((key: string) => {
                    if(this.state.market.events[key].weekday){
                        return <div key={key}>{key}</div>
                    }
                    return <div key={key}>{key}*</div>
                })}</>} */}
      </Link>
    )
  }
}

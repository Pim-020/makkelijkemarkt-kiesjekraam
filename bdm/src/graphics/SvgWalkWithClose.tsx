import React, { Component } from 'react'

export default class SvgWalkWithClose extends Component<{ color: string }> {
  render() {
    return (
      <svg x="8" y="8" width="36" height="36" viewBox="0 0 13.229167 13.229167" version="1.1" id="svg8">
        <defs id="defs2" />
        <metadata id="metadata5"></metadata>
        <g id="layer1">
          <path
            d="M 6.6145833,1.3229167 V 11.90625"
            id="path835"
            style={{
              fill: 'none',
              stroke: this.props.color,
              strokeWidth: 0.52916667,
              strokeLinecap: 'round',
              strokeLinejoin: 'round',
              strokeOpacity: 1,
              strokeMiterlimit: 4,
              strokeDasharray: 'none',
            }}
          />
          <path
            style={{
              fill: 'none',
              stroke: this.props.color,
              strokeWidth: 0.52916667,
              strokeLinecap: 'round',
              strokeLinejoin: 'round',
              strokeOpacity: 1,
              strokeMiterlimit: 4,
              strokeDasharray: 'none',
            }}
            d="M 3.96875,3.96875 6.6145832,1.3229166 9.2604167,3.96875"
            id="path837"
          />
          <path
            style={{
              fill: 'none',
              stroke: this.props.color,
              strokeWidth: 0.52916667,
              strokeLinecap: 'round',
              strokeLinejoin: 'round',
              strokeOpacity: 1,
              strokeMiterlimit: 4,
              strokeDasharray: 'none',
            }}
            d="M 9.2604167,9.2604168 6.6145833,11.90625 3.96875,9.2604168"
            id="path837-3"
          />
          <path
            style={{
              fill: 'none',
              stroke: this.props.color,
              strokeWidth: 0.52916667,
              strokeLinecap: 'round',
              strokeLinejoin: 'round',
              strokeOpacity: 1,
              strokeMiterlimit: 4,
              strokeDasharray: 'none',
            }}
            d="M 4,6.6 9.2,6.6"
            id="path837-4"
          />
        </g>
      </svg>
    )
  }
}

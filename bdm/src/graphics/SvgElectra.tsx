import React, { Component } from 'react'

export default class SvgElectra extends Component<{
  color?: string
  invert?: boolean
  position: { x: number; y: number }
}> {
  render() {
    return (
      <svg
        x={this.props.position.x}
        y={this.props.position.y}
        width="12"
        height="16"
        viewBox="0 0 2.1166668 2.6458334"
        version="1.1"
        id="svg8"
      >
        <defs id="defs2" />
        <metadata id="metadata5"></metadata>
        <g id="layer1">
          <path
            id="rect982"
            x="10"
            y="10"
            style={{
              opacity: 1,
              fill: this.props.color || '#000',
              fillOpacity: 1,
            }}
            d="M 0.5386161,0.10394347 V 0.79856061 H 0.19843753 V 1.3103748 c 0,0.7363024 0.31883787,0.6062663 0.68035717,0.6537542 V 2.4851936 H 1.2189733 V 1.964129 C 1.5804926,1.9166411 1.8993304,2.037056 1.8993304,1.3007536 V 0.79856061 H 1.5591518 V 0.10394347 H 1.3040179 V 0.79856061 H 0.79375 V 0.10394347 Z"
          />
        </g>
      </svg>
    )
  }
}

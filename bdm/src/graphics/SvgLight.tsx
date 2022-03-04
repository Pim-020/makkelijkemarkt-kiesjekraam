import React, { Component } from 'react'

export default class SvgLight extends Component<{
  color?: string
  invert?: boolean
  position: { x: number; y: number }
}> {
  render() {
    return (
      <svg
        x={this.props.position.x}
        y={this.props.position.y}
        width="20"
        height="20"
        viewBox="0 0 20 20"
        version="1.1"
        id="light"
      >
        <defs id="defs2" />
        <metadata id="metadata5"></metadata>
        <g id="light-group">
          <circle
            cx={10}
            cy={10}
            r={5}
            style={{
              fill: this.props.color || 'yellow',
              stroke: this.props.color || 'black',
              strokeWidth: 0.4,
              strokeLinecap: 'round',
              strokeLinejoin: 'round',
              strokeOpacity: 1,
            }}
            id="path1048-5"
          />
        </g>
      </svg>
    )
  }
}

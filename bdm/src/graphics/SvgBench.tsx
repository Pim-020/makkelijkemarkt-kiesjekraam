import React, { Component } from 'react'

export default class SvgBench extends Component<{
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
        height="12"
        viewBox="0 0 52.916665 52.916668"
        version="1.1"
        id="bench"
      >
        <defs id="defs2" />
        <metadata id="metadata5"></metadata>
        <g id="bench-group">
          <path
            style={{
              fill: this.props.color || '#c75819',
              stroke: this.props.color || '#c75819',
              strokeWidth: 0.4,
              strokeLinecap: 'round',
              strokeLinejoin: 'round',
              strokeOpacity: 1,
            }}
            d="m 49.268782,29.692869 -5.030304,-0.2186 4.472813,19.695742 2.201486,-0.296939 z m -45.6208971,0 5.030304,-0.2186 -4.4728135,19.695742 -2.2014858,-0.296939 z m 0,-4.194148 H 49.268778 v 4.194148 H 3.6478849 Z"
            id="path1048-5"
          />
        </g>
      </svg>
    )
  }
}

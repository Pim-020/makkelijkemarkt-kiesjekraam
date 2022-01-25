import React, { Component } from "react";

export default class SvgWalkthrough extends Component<{color: string}> {
    render() {
        return <svg
            x="8"
            y="8"
            width="36"
            height="36"
            viewBox="0 0 13.229167 13.229167"
            version="1.1"
            id="svg8">
            <defs
                id="defs2" />
            <metadata
                id="metadata5">
            </metadata>
            <g
                id="layer1">
                <path
                    d="m 6.6145832,3.968761 10e-8,5.2916448"
                    id="path835"
                    style={{
                        fill: "none",
                        stroke: this.props.color,
                        strokeWidth: 0.52916667,
                        strokeLinecap: "round",
                        strokeLinejoin: "round",
                        strokeOpacity: 1,
                        strokeMiterlimit: 4,
                        strokeDasharray: "none"
                    }} />
                <path
                    style={{
                        fill: "none",
                        stroke: this.props.color,
                        strokeWidth: 0.52916667,
                        strokeLinecap: "round",
                        strokeLinejoin: "round",
                        strokeOpacity: 1,
                        strokeMiterlimit: 4,
                        strokeDasharray: "none"
                    }}
                    d="M 3.96875,1.3229276 6.6145832,3.968761 9.2604167,1.3229276"
                    id="path837" />
                <path
                    style={{
                        fill: "none",
                        stroke: this.props.color,
                        strokeWidth: 0.52916667,
                        strokeLinecap: "round",
                        strokeLinejoin: "round",
                        strokeOpacity: 1,
                        strokeMiterlimit: 4,
                        strokeDasharray: "none"
                    }}
                    d="M 9.2604167,11.906239 6.6145833,9.2604058 3.96875,11.906239"
                    id="path837-3" />
            </g>
        </svg>
    }
}
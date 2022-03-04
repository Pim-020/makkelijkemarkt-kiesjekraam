import React from 'react'
import { RouteProps } from 'react-router-dom'

export class DynamicBase extends React.Component<RouteProps> {
  id: string = ''
  router: any

  public constructor(props: any) {
    super(props)
  }

  refresh() {}

  componentDidUpdate(prevProps: RouteProps) {
    if (this.props.location && prevProps.location && prevProps.location.pathname !== this.props.location.pathname) {
      this.refresh()
    }
  }

  componentDidMount() {
    this.refresh()
  }

  render() {
    return <div></div>
  }
}

import {
  Breadcrumb, //Button,
  Col,
  Input,
  Row,
} from 'antd'
import React, { Component } from 'react'
import { Link } from 'react-router-dom'
import { HomeOutlined } from '@ant-design/icons'
import { LotPropertyService } from '../services/service_lookup'
//import { MinusCircleOutlined, PlusOutlined } from '@ant-design/icons';

export default class ObstacleListPage extends Component {
  readonly state: { properties: string[] } = {
    properties: [],
  }

  propertyService: LotPropertyService

  constructor(props: any) {
    super(props)
    this.propertyService = new LotPropertyService()
  }

  componentDidMount = () => {
    this.propertyService.retrieve().then((properties: string[]) => {
      properties.sort((a, b) => {
        if (a < b) {
          return -1
        }
        if (a > b) {
          return 1
        }
        return 0
      })
      this.setState({
        properties,
      })
    })
  }
  add = () => {
    const props: string[] = this.state.properties
    props.push('')
    this.setState({
      properties: props,
    })
  }
  remove = (property: string) => {
    const props: string[] = this.state.properties
    const _idx: number = props.indexOf(property)
    if (_idx > -1) {
      props.splice(_idx, 1)
    }
    this.setState({
      properties: props,
    })
  }

  render() {
    return (
      <>
        <Breadcrumb>
          <Breadcrumb.Item>
            <Link to="/">
              <HomeOutlined />
            </Link>
          </Breadcrumb.Item>
          <Breadcrumb.Item>
            <Link to="/properties">
              <span>Plaatseigenschappen</span>
            </Link>
          </Breadcrumb.Item>
        </Breadcrumb>
        {this.state.properties.map((obstacle: string, i: number) => {
          return (
            <Row key={i} gutter={[8, 8]}>
              <Col>
                <Input value={obstacle} disabled={true} />
              </Col>
              <Col>
                {/* <Button
                    danger
                    type="primary"
                    icon={<DeleteOutlined />}
                    onClick={() => this.remove(obstacle)}
                /> */}
              </Col>
            </Row>
          )
        })}
        {/* <Button
                onClick={() => {
                    this.add();
                }}
                style={{ marginTop: '20px' }}
                icon={<PlusOutlined />}
            >Toevoegen</Button>
            */}
      </>
    )
  }
}

import {
  Breadcrumb, //Button,
  Col,
  Input,
  Row,
} from 'antd'
import React, { Component } from 'react'
import { Link } from 'react-router-dom'
import { HomeOutlined } from '@ant-design/icons'
import { ObstacleTypeService } from '../services/service_lookup'
//import { MinusCircleOutlined, PlusOutlined } from '@ant-design/icons';

export default class ObstacleListPage extends Component {
  readonly state: { obstacleTypes: string[] } = {
    obstacleTypes: [],
  }

  obstacleTypeService: ObstacleTypeService

  constructor(props: any) {
    super(props)
    this.obstacleTypeService = new ObstacleTypeService()
  }

  componentDidMount = () => {
    this.obstacleTypeService.retrieve().then((obstacleTypes: string[]) => {
      obstacleTypes.sort((a, b) => {
        if (a < b) {
          return -1
        }
        if (a > b) {
          return 1
        }
        return 0
      })
      this.setState({
        obstacleTypes,
      })
    })
  }

  add = () => {
    const props: string[] = this.state.obstacleTypes
    props.push('')
    this.setState({
      properties: props,
    })
  }

  remove = (property: string) => {
    const props: string[] = this.state.obstacleTypes
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
            <Link to="/obstacles">
              <span>Obstakels</span>
            </Link>
          </Breadcrumb.Item>
        </Breadcrumb>
        {this.state.obstacleTypes.map((obstacle: string, i: number) => {
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

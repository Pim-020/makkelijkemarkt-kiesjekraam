import { HomeOutlined } from '@ant-design/icons'
import { Button, Col, Row, Modal, Input } from "antd"
import React, { ChangeEvent, Component } from "react"
import { DayOfWeek, Market, Markets, WeekDays } from "../models"
import MarketsService, { PagesService } from "../services/service_markets"
import MarketListItem from '../components/MarketListItem'
import { Breadcrumb } from 'antd'
import { Link, RouteComponentProps } from 'react-router-dom'
import { MMarkt } from '../models/mmarkt'
import { MMarktService } from '../services/service_mmarkt'
import { withRouter } from 'react-router-dom'

const { Search } = Input;

class MarketListPage extends Component<RouteComponentProps> {
    weekdays: DayOfWeek[] = WeekDays
    readonly state: { mmarkets: MMarkt[], markets: Markets, filter: "", filteredMarkets: Markets, newMarketId: string, day: DayOfWeek} = {
        mmarkets: [],
        markets: {},
        filter: "",
        filteredMarkets: {},
        newMarketId: "",
        day: {
            id: 0,
            name: "",
            abbreviation: ""
        }
    }

    marketsService: MarketsService
    pagesService: PagesService
    mmarktService: MMarktService

    constructor(props: any) {
        super(props)
        this.marketsService = new MarketsService()
        this.pagesService = new PagesService()
        this.mmarktService = new MMarktService()
    }

    componentDidMount = () => {
        this.marketsService.retrieve().then((markets: Markets) => {
            // Sort
            markets = Object.keys(markets).sort().reduce((result: any, key: string) => {
                result[key] = markets[key];
                return result;
            }, {})
            this.setState({
                markets,
                filteredMarkets: markets
            })
        })
        this.mmarktService.retrieve().then((mmarkets: MMarkt[]) => {
            const marketKeys: string[] = Object.keys(this.state.markets)
            const _markets: Markets = this.state.markets

            mmarkets.forEach((m: MMarkt) => {

                // extends markets with mmarkets
                if (!marketKeys.includes(m.afkorting)) {
                    _markets[m.afkorting] = {
                        id: m.id,
                        name: m.naam,
                    }
                    if (m.kiesJeKraamFase) {
                        _markets[m.afkorting].phase = m.kiesJeKraamFase
                    }
                    if (m.aantalKramen) {
                        _markets[m.afkorting].stands = m.aantalKramen
                    }
                }
            })
            this.setState({
                mmarkets: mmarkets,
                markets: _markets,
                filteredMarkets: _markets
            })
        })
    }

    applyFilter = () => {
        const _filteredMarkets: Markets = {}
        if (this.state.filter === '') {
            this.setState({
                filteredMarkets: this.state.markets
            })
        } else {
            //const namematches = this.state.markets.filter((m: Market) => m.name === this.state.filter.toLowerCase() )
            Object.keys(this.state.markets).forEach((key: string) => {
                // Match by name
                if (this.state.markets[key].name.toLowerCase().includes(this.state.filter.toLowerCase())) {
                    _filteredMarkets[key] = this.state.markets[key]
                }
                if (key.toLowerCase().includes(this.state.filter.toLowerCase())) {
                    _filteredMarkets[key] = this.state.markets[key]
                }
            })

            this.setState({
                filteredMarkets: _filteredMarkets
            })
        }
    }
    onChange = (e: ChangeEvent<HTMLInputElement>) => {
        this.setState({
            filter: e.target.value
        }, () => {
            this.applyFilter()
        })

    }

    render() {
        return <>
            <Breadcrumb>
                <Breadcrumb.Item>
                    <Link to="/">
                        <HomeOutlined />
                    </Link>
                </Breadcrumb.Item>
                <Breadcrumb.Item>
                    <Link to="/markets">
                        <span>Markten</span>
                    </Link>
                </Breadcrumb.Item>
            </Breadcrumb>
            <Row gutter={[16, 16]}>
                <Col>
                    <Search placeholder="Filter markten" onChange={this.onChange} style={{ width: 200 }} />
                </Col>
            </Row>  
            <Row gutter={[16, 16]}>
                {Object.keys(this.state.filteredMarkets).sort().map((key: string, i: number) => {

                    const market: Market = this.state.markets[key]
                    const mmarket = this.state.mmarkets.find(e => e.afkorting.toLowerCase() === key.toLowerCase())
                    if (mmarket) {
                        if (mmarket.kiesJeKraamFase) {
                            market.phase = mmarket.kiesJeKraamFase
                        }
                        if (mmarket && mmarket.naam) {
                            market.name = mmarket.naam
                        }
                    }
                    return <Col key={key} style={{ margin: "0.5em" }}>
                        <MarketListItem marketId={key} market={market} />
                    </Col>
                })}  
            </Row>
        </>
    }
}

export default withRouter(MarketListPage)

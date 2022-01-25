import React, { Component } from "react"
import { DaysClosedService } from "../services/service_lookup"
import { Breadcrumb, Calendar } from 'antd'
import { HomeOutlined } from '@ant-design/icons'
import MarketsService from "../services/service_markets"
import { Markets } from "../models"

export default class CalendarPage extends Component {
    readonly state: { daysClosed: string[], markets: Markets } = {
        daysClosed: [],
        markets: {}
    }

    daysClosedService: DaysClosedService
    marketsService: MarketsService
    constructor(props: any) {
        super(props)
        this.daysClosedService = new DaysClosedService()
        this.marketsService = new MarketsService()
    }

    componentDidMount = () => {
        
        this.daysClosedService.retrieve().then((daysClosed: string[]) => {
            this.marketsService.retrieve().then((markets: Markets) => {
                this.setState({
                    markets: markets,
                    daysClosed: daysClosed
                })
            })
        })
    }

    getListData(value: any) {
        if(this.state.daysClosed.indexOf(value.format('YYYY-MM-DD')) > -1) {
            return []
        }
        const listData: { type: string, content: any }[] = []

        // select markets for the given day and display them in the calendar
        //Object.keys(this.state.markets).forEach((marketid: string) => {
            //const _market: Market = this.state.markets[marketid]
            // const wl: any = Object.keys(_market.events).filter((eventid: string) => {
            //     return _market.events[eventid].weekday === value.day()
            // })
            // if(wl.length === 1) {
            //     const _item: string = marketid + '-' + wl[0]
            //     listData.push({ type: 'succes', content: <Link to={`market/day/${_item}`}>{_item}</Link> })
            // }
        //})
        return listData
    }

    dateCellRender = (value: any) => {
        const listData = this.getListData(value);
        return (
            <ul className="events">
                {listData.map((item, i) => (
                    <li key={i}>
                        {item.content}
                    </li>
                ))}
            </ul>
        )
    }

    render() {
        return <>
            <Breadcrumb>
                <Breadcrumb.Item href="/">
                    <HomeOutlined />
                </Breadcrumb.Item>
                <Breadcrumb.Item href="/calendar">
                    <span>Kalender</span>
                </Breadcrumb.Item>
            </Breadcrumb>
            {this.state.markets &&
                <Calendar dateCellRender={this.dateCellRender} />
            }
        </>
    }
}
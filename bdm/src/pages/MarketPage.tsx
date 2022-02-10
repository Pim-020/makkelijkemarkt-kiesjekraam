import React, { createRef, MouseEvent, RefObject, KeyboardEvent, useEffect, useState } from "react"
import Day from "../components/Day"
// import MarketsService from "../services/service_markets"
import { Transformer } from "../services/transformer"
import { mmApiSaveService } from "../services/service_mm_api"
import { DynamicBase } from "./DynamicBase"
import { Breadcrumb, Tabs, Row, Col, //Button, Upload
    } from 'antd'
import { HomeOutlined, //UploadOutlined, FileZipOutlined 
    } from '@ant-design/icons'
import { Link } from "react-router-dom"
import { AssignedBranche, Branche, Geography, Lot, MarketEventDetails, Page, Plan, Rows } from "../models"
// import { BrancheService } from "../services/service_lookup"
import Branches from "../components/Branches"
import Configuration from "../services/configuration"
import { validateLots } from "../common/validator"
//import { zipMarket } from "../common/generic"

import MarketDataWrapper, { MarketContext } from '../components/MarketDataWrapper'

const { TabPane } = Tabs

class MarketPage extends React.Component {
    static contextType = MarketContext
    // id: string = ""
    // router: any

    readonly state: {
        lookupBranches?: Branche[],
        marketEventDetails?: MarketEventDetails,
        activeKey: string,
        plan?: Plan,
        pfdReadyForUpload?: boolean
        pdfSelected?: File
        uploadProps?: any
    } = {
            activeKey: "0"
        }
    branchesRef: RefObject<Branches>
    config: Configuration
    dayRef: RefObject<Day>

    // marketsService: MarketsService
    transformer: Transformer

    // lookupBrancheService: BrancheService

    constructor(props: any) {
        super(props)
        this.config = new Configuration()

        this.transformer = new Transformer()
        // this.marketsService = new MarketsService()
        // this.lookupBrancheService = new BrancheService()

        this.branchesRef = createRef()
        this.dayRef = createRef()
    }

    dayChanged = () => {
        this.transformer.encode(this.context.marktConfig, this.context.genericBranches, this.state.marketEventDetails).then(result => {
            validateLots(result)
            this.branchesRef.current?.updateStorage(result.branches)
        })
    }

    updateAssignedBranches = (branches: AssignedBranche[]) => {
        const _m = this.state.marketEventDetails
        if (_m) {
            _m.branches = branches
            this.setState({
                marketEventDetails: _m
            }, () => {

                this.dayRef.current?.setState({
                    marketEventDetails: _m
                })
            })
        }
    }
    save() {
        const branches_json = require(`../tmp/markt/AC-DI/branches.json`)
        const locaties_json = require(`../tmp/markt/AC-DI/locaties.json`)
        const markt_json = require(`../tmp/markt/AC-DI/markt.json`)
        const geografie_json = require(`../tmp/markt/AC-DI/geografie.json`)
        const paginas_json = require(`../tmp/markt/AC-DI/paginas.json`)

        if (this.state.marketEventDetails) {
            const { pages } = this.state.marketEventDetails
            const locaties = this.transformer.layoutToStands(pages)
            const marktOpstelling = this.transformer.layoutToRows(pages)
            const geografie = this.transformer.layoutToGeography(pages)
            const paginas = this.transformer.layoutToPages(pages)
            
            // const { branches } = this.state.marketEventDetails
            const branches = this.transformer.decodeBranches(this.state.marketEventDetails.branches)
            
            console.log('SAVE', { branches, geografie, locaties, marktOpstelling, paginas })
            console.log('branches', JSON.stringify(branches_json) === JSON.stringify(branches))
            console.log('locaties', JSON.stringify(locaties_json) === JSON.stringify(locaties))
            console.log('markt', JSON.stringify(markt_json) === JSON.stringify(marktOpstelling))
            console.log('geografie', JSON.stringify(geografie_json) === JSON.stringify(geografie))
            console.log('paginas', JSON.stringify(paginas_json) === JSON.stringify(paginas))

            const marktConfiguratie = {branches, locaties, marktOpstelling, geografie, paginas}
            console.log(marktConfiguratie)

            mmApiSaveService(`/api/markt/${this.context.marktId}/marktconfiguratie`, marktConfiguratie)
        }
    }

    componentDidMount() {
        // this.id = (this.props as any).match.params.id

        // mmApiService(`/branches`).then((lookupBranches: Branche[]) => {
        //     this.setState({
        //         lookupBranches
        //     })
        // })
        //this.getPlan()
        this.transformer.encode(this.context.marktConfig, this.context.genericBranches).then(result => {
            validateLots(result)
            this.branchesRef.current?.updateStorage(result.branches)
            this.setState({
                marketEventDetails: result,
                activeKey: result.pages.length === 0 ? "1" : "0"  // show branche toewijzing tab instead of marktindeling when no pages in result
            }, () => {
                this.dayRef.current?.setState({
                    marketEventDetails: result
                })
            })
        })
    }

    render() {
        console.log('MarketPage', this.state)
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
                {this.context.marktId && <>
                    <Breadcrumb.Item><Link to={`/market/${this.context.marktId}`}>
                        <span>{this.context.marktId}</span></Link>
                    </Breadcrumb.Item>
                    </>
                }
            </Breadcrumb>
            <button onClick={this.save.bind(this)}>SAVE</button>
            <Row align="top" gutter={[16, 16]}>
                <Col>
                    {/* {this.state.uploadProps &&
                        <Upload {...this.state.uploadProps}>
                            <Button icon={<UploadOutlined />}>Kaart uploaden/vervangen</Button>
                        </Upload>
                    } */}

                </Col>
             </Row>
            {this.context.genericBranches &&
                <Tabs activeKey={this.state.activeKey} onTabClick={(key: string, e: MouseEvent | KeyboardEvent) => {
                    this.setState({ activeKey: key })
                }}>
                    <TabPane tab="Marktindeling" key="0">
                        <Day id={this.context.marktId} ref={this.dayRef} changed={this.dayChanged} />
                    </TabPane>
                    <TabPane tab="Branche toewijzing" key="1" forceRender={true}>
                        <Branches id={this.context.marktId} ref={this.branchesRef} lookupBranches={this.context.genericBranches} changed={this.updateAssignedBranches} />
                    </TabPane>
                </Tabs>}
        </>
    }
}

export default function(props: any) {
    return (
        <MarketDataWrapper {...props}>
            <MarketPage />
        </MarketDataWrapper>
    )
};

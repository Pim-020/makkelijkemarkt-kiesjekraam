import React, { createRef, MouseEvent, RefObject, KeyboardEvent, useEffect, useState } from "react"
import Day from "../components/Day"
// import MarketsService from "../services/service_markets"
import { Transformer } from "../services/transformer"
import { mmApiService, mmApiSaveService } from "../services/service_mm_api"
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
import { useQuery } from 'react-query'

const { TabPane } = Tabs

const USE_QUERY_CONFIG = {
    // refetchOnWindowFocus: false
    placeholderData: [],
    refetchOnWindowFocus: false, //refetch when window comes to focus
    // refetchOnReconnect: false, //refetch when browser reconnects to server
    // refetchOnMount: false, //refetch when component mounts
}

const useGenericBranches = () => {
    console.log('useGenericBranches hook')
    const { data } = useQuery('genericBranches', () => {
        return mmApiService(`/branches`)
    }, USE_QUERY_CONFIG)
    return data;
}

const useTransformer = async () => {
    console.log('useTransformer hook')
    // const genericBranches = useGenericBranches()
    // const genericBranches = await mmApiService(`/branches`)
    // console.log(genericBranches)
    return new Transformer().encode('AC-DI')
}

const DataWrapper: React.FC = (props) => {
    console.log('DataWrapper')
    const [clickData, setClickData] = useState(true)
    const [data, setData] = useState({})

    // const genericBranches = useGenericBranches()
    useEffect(() => {
        new Transformer().encode('AC-DI').then
    })
    
    const clickHandler = () => {
        console.log('clickHandler')
        setClickData(!clickData)
    }

    // if (isLoading) console.log('Loading...')
    // if (error) console.log('An error has occurred: ')
    // if (data) console.log(data)

    return (
        // <div>
        //     <h1>Wrapper</h1>
        //     <button onClick={clickHandler}>CHANGE</button>
        // </div>
        <MarketPage {...props} genericBranches={data} />
    )
}

class MarketPage extends DynamicBase {
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
        this.transformer.encode(this.id).then(result => {
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

    branchesToZip(data: AssignedBranche[]) {
        // Strip color, allocated and backGroundColor
        let _nBranches: AssignedBranche[] = []
        if (data) {
            data.forEach((_nB: AssignedBranche) => {
                const _tmp: any = {
                    brancheId: _nB.brancheId,
                    verplicht: _nB.verplicht || false
                }
                if (_nB.maximumPlaatsen && _nB.maximumPlaatsen > -1) {
                    _tmp.maximumPlaatsen = _nB.maximumPlaatsen
                }
                _nBranches.push(_tmp)
            })

        }
        return _nBranches
    }

    save() {
        const branches_json = require(`../tmp/markt/${this.id}/branches.json`)
        const locaties_json = require(`../tmp/markt/${this.id}/locaties.json`)
        const markt_json = require(`../tmp/markt/${this.id}/markt.json`)
        const geografie_json = require(`../tmp/markt/${this.id}/geografie.json`)
        const paginas_json = require(`../tmp/markt/${this.id}/paginas.json`)

        if (this.state.marketEventDetails) {
            const { pages } = this.state.marketEventDetails
            const locaties = this.transformer.layoutToStands(pages)
            const markt = this.transformer.layoutToRows(pages)
            const geografie = this.transformer.layoutToGeography(pages)
            const paginas = this.transformer.layoutToPages(pages)
            
            // const { branches } = this.state.marketEventDetails
            const branches = this.branchesToZip(this.state.marketEventDetails.branches)
            
            console.log('SAVE', { branches, geografie, locaties, markt, paginas })
            console.log('branches', JSON.stringify(branches_json) === JSON.stringify(branches))
            console.log('locaties', JSON.stringify(locaties_json) === JSON.stringify(locaties))
            console.log('markt', JSON.stringify(markt_json) === JSON.stringify(markt))
            console.log('geografie', JSON.stringify(geografie_json) === JSON.stringify(geografie))
            console.log('paginas', JSON.stringify(paginas_json) === JSON.stringify(paginas))

            mmApiSaveService(`/${this.id}/branches`, branches);
            mmApiSaveService(`/${this.id}/geografie`, geografie);
            mmApiSaveService(`/${this.id}/locaties`, locaties);
            mmApiSaveService(`/${this.id}/markt`, markt);
            mmApiSaveService(`/${this.id}/paginas`, paginas);
        }
    }

    refresh() {
        this.id = (this.props as any).match.params.id
        // mmApiService(`/branches`).then((lookupBranches: Branche[]) => {
        //     this.setState({
        //         lookupBranches
        //     })
        // })
        //this.getPlan()
        this.transformer.encode(this.id).then(result => {
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
        }).catch((e: Error) => {
            console.error(`Marktdag bestaat nog niet, ${this.id} wordt nieuw aangemaakt.`)
            const _newM: MarketEventDetails = {
                branches: [],
                pages: [
                    {
                        title: "",
                        layout: [
                            {
                                _key: "",
                                title: "",
                                class: "block-left",
                                landmarkBottom: "",
                                landmarkTop: "",
                                lots: []
                            }
                        ]
                    }
                ]
            }
            // No result
            this.setState({
                marketEventDetails: _newM,
                activeKey: "1"
            }, () => {
                this.dayRef.current?.setState({
                    marketEventDetails: _newM
                })
            })
            this.branchesRef.current?.updateStorage([])
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
                {this.id && <>
                    <Breadcrumb.Item><Link to={`/market/${this.id}`}>
                        <span>{this.id}</span></Link>
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
            {this.props.genericBranches &&
                <Tabs activeKey={this.state.activeKey} onTabClick={(key: string, e: MouseEvent | KeyboardEvent) => {
                    this.setState({ activeKey: key })
                }}>
                    <TabPane tab="Marktindeling" key="0">
                        <Day id={this.id} ref={this.dayRef} changed={this.dayChanged} />
                    </TabPane>
                    <TabPane tab="Branche toewijzing" key="1" forceRender={true}>
                        <Branches id={this.id} ref={this.branchesRef} lookupBranches={this.props.genericBranches} changed={this.updateAssignedBranches} />
                    </TabPane>
                </Tabs>}

        </>
    }
}

export default DataWrapper

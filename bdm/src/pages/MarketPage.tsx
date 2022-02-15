import React, { createRef, MouseEvent, RefObject, KeyboardEvent } from "react"
import { Tabs, Row, Col } from 'antd'

import Day from "../components/Day"
import { Transformer } from "../services/transformer"

import { AssignedBranche, Branche, IMarktConfiguratie, MarketEventDetails, Plan } from "../models"
import Branches from "../components/Branches"
import Configuration from "../services/configuration"
import { validateLots } from "../common/validator"

import MarketDataWrapper, { MarktContext } from '../components/MarktDataWrapper'
import { SaveButton } from '../components/buttons'

const { TabPane } = Tabs

class MarketPage extends React.Component {
    static contextType = MarktContext
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
    transformer: Transformer

    constructor(props: any) {
        super(props)
        this.config = new Configuration()

        this.transformer = new Transformer()
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
        if (this.state.marketEventDetails) {
            const { pages } = this.state.marketEventDetails
            const locaties = this.transformer.layoutToStands(pages)
            const marktOpstelling = this.transformer.layoutToRows(pages)
            const geografie = this.transformer.layoutToGeography(pages)
            const paginas = this.transformer.layoutToPages(pages)
            const branches = this.transformer.decodeBranches(this.state.marketEventDetails.branches)

            const marktConfiguratie: IMarktConfiguratie = { branches, locaties, marktOpstelling, geografie, paginas }
            this.context.saveMarktConfig(marktConfiguratie)
        }
    }

    componentDidMount() {
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
        return <>
            <h1>{this.context.markt.naam}</h1>
            <SaveButton clickHandler={this.save.bind(this)} inProgress={this.context.saveInProgress}>Marktconfiguratie opslaan</SaveButton>
            <Row align="top" gutter={[16, 16]}>
                <Col>
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

export default function WrappedMarketPage(props: any) {
    return (
        <MarketDataWrapper {...props}>
            <MarketPage />
        </MarketDataWrapper>
    )
};

import { Modal, Button, Input, Tabs } from "antd"
import React, { RefObject, Component, createRef, MouseEvent, KeyboardEvent, ChangeEvent } from "react"
import { AssignedBranche, Branche, Lot, MarketEventDetails, MarketLayout, MarketPage } from "../models"
import LayoutEdit from "./LayoutEdit"
import LotEdit from "./LotEdit"
import LotBlock from "./LotBlock"
import { Transformer } from "../services/transformer"
import { PlusOutlined, ExclamationCircleOutlined } from '@ant-design/icons'
import { validateLots } from "../common/validator"

const { TabPane } = Tabs
const { confirm } = Modal
interface DayPageState {
    marketEventDetails: MarketEventDetails,
    currentPosition?: [number, number, number],
    activeKey: string
}

interface DayPageProps {
    id: string,
    lookupBranches: Branche[]
    changed?: () => void
}
export default class Day extends Component<DayPageProps> {
    lotEdit: RefObject<LotEdit>
    transformer: Transformer
    readonly state: DayPageState = {
        marketEventDetails: {
            branches: [],
            pages: []
        },
        activeKey: "0"
    }

    constructor(props: DayPageProps) {
        super(props)
        this.lotEdit = createRef()
        this.transformer = new Transformer()
    }

    getPageTitle = (page: MarketPage) => {
        if (page.invalid) {
            return <span style={{color: "#f00"}}>{page.title}</span>
        }
        return <>{page.title}</>
    }
    getRowClass = (row: MarketLayout) => {
        if(row.invalid){
            return row.class + " invalid"
        }

        return row.class
    }


    getClassname = (lot: Lot) => {
        let baseClass = []
        if (lot.blockStart) {
            baseClass.push("block-start")
        }
        if (lot.blockEnd) {
            baseClass.push("block-end")
        }
        if (lot.selected) {
            baseClass.push("selected")
        }
        if (lot.invalid) {
            baseClass.push("invalid")
        }

        //check to see if plaatsId is valid!
        baseClass.push(lot.type)
        return baseClass.join(" ")
    }

    getBranche = (lot: Lot): AssignedBranche => {
        if (lot.branches) {
            const _lotbranches = lot.branches.filter((item: string) => item !== "bak")
            if (_lotbranches.length === 1) {
                const _activeBranche = this.state.marketEventDetails.branches.filter(b => b.brancheId === _lotbranches[0])
                if (_activeBranche) {
                    return _activeBranche[0] as AssignedBranche
                }
            }
        }

        return {
            brancheId: "",
            verplicht: false,
            color: "",
            backGroundColor: ""
        }
    }

    lotToggle = (pageindex: number, layoutindex: number, lotindex: number) => {
        const _marketEventDetails: MarketEventDetails = this.lotsUnselect()
        _marketEventDetails.pages[pageindex].layout[layoutindex].lots[lotindex].selected = true
        const _selectedLot = _marketEventDetails.pages[pageindex].layout[layoutindex].lots[lotindex]

        this.setState({
            marketEventDetails: _marketEventDetails,
            currentPosition: [pageindex, layoutindex, lotindex]
        }, () => {
            this.lotEdit.current?.setState({
                lot: _selectedLot,
                currentPosition: [pageindex, layoutindex, lotindex]
            })
        })
    }

    lotChanged = (lot: Lot | undefined) => {
        if (lot) {
            const _marketEventDetails: MarketEventDetails = this.state.marketEventDetails
            if (this.state.currentPosition) {
                _marketEventDetails
                    .pages[this.state.currentPosition[0]]
                    .layout[this.state.currentPosition[1]]
                    .lots[this.state.currentPosition[2]] = lot

                //Update local storage
                this.updateStorage(_marketEventDetails)
            }
        }
    }

    lotsUnselect = () => {
        const _cm: MarketEventDetails = this.state.marketEventDetails
        this.state.marketEventDetails.pages.forEach((page: MarketPage, i) => {
            const pageindex = i
            page.layout.forEach((layout: MarketLayout, j) => {
                const layoutindex = j
                _cm.pages[pageindex].layout[layoutindex].lots = layout.lots.map((_lot: Lot) => {
                    _lot.selected = false
                    return _lot
                })
            })
        })
        return _cm
    }

    lotAppend = (position: [number, number, number], copy?: boolean) => {
        const _cm: MarketEventDetails = this.state.marketEventDetails
        const _current = _cm.pages[position[0]].layout[position[1]].lots[position[2]]
        let _newLot: Lot = {
            plaatsId: "0",
            branches: [],
            verkoopinrichting: [],
            properties: [],
            type: "stand"
        }

        if (copy) {

            _newLot = {
                plaatsId: "0",
                branches: _current.branches,
                verkoopinrichting: _current.verkoopinrichting,
                properties: _current.properties,
                type: _current.type
            }
        }

        // Put one lot after...
        _cm.pages[position[0]].layout[position[1]].lots.splice(position[2] + 1, 0, _newLot)
        this.updateStorage(_cm)
        this.lotToggle(position[0], position[1], position[2] + 1)
    }

    lotPrepend = (position: [number, number, number], copy?: boolean) => {
        const _cm: MarketEventDetails = this.state.marketEventDetails
        const _current = _cm.pages[position[0]].layout[position[1]].lots[position[2]]
        let _newLot: Lot = {
            plaatsId: "0",
            branches: [],
            verkoopinrichting: [],
            properties: [],
            type: "stand"
        }
        if (_cm.pages[position[0]].layout[position[1]].lots[position[2]]) {
            if (copy) {

                _newLot = {
                    plaatsId: "0",
                    branches: _current.branches,
                    verkoopinrichting: _current.verkoopinrichting,
                    properties: _current.properties,
                    type: _current.type
                }
            }

            // Put one lot before...
            _cm.pages[position[0]].layout[position[1]].lots.splice(position[2], 0, _newLot)
            this.updateStorage(_cm)
            this.lotToggle(position[0], position[1], position[2])
        }
    }

    lotDelete = (position: [number, number, number]) => {
        const _cm: MarketEventDetails = this.state.marketEventDetails
        if (_cm.pages[position[0]].layout[position[1]].lots[position[2]]) {
            delete _cm.pages[position[0]].layout[position[1]].lots[position[2]]
            //Update local storage
            this.updateStorage(_cm)
        }
    }

    lotAdd = (position: [number, number]) => {
        const _cm: MarketEventDetails = this.lotsUnselect()
        const _newLot: Lot = {
            plaatsId: "0",
            branches: [],
            verkoopinrichting: [],
            properties: [],
            type: "stand"
        }
        const newLotPosition = _cm.pages[position[0]].layout[position[1]].lots.push(_newLot)
        this.updateStorage(_cm)
        this.lotToggle(position[0], position[1], newLotPosition - 1)
    }

    layoutChanged = (layout: MarketLayout | undefined, position: [number, number], add?: boolean) => {
        let _marketEventDetails: MarketEventDetails = this.state.marketEventDetails
        if (layout) {
            if (add) {
                _marketEventDetails.pages[position[0]].layout.splice(position[1], 0, layout)
            } else {
                _marketEventDetails.pages[position[0]].layout[position[1]] = layout
            }
        } else {
            _marketEventDetails.pages[position[0]].layout.splice(position[1], 1)
        }

        //Update local storage
        this.updateStorage(_marketEventDetails)
    }

    updateStorage(newMarketState: MarketEventDetails) {
        validateLots(newMarketState)
        this.setState({
            marketEventDetails: newMarketState
        }, () => {
            if (this.props.changed) {
                this.props.changed()
            }
        })
        const { pages } = newMarketState
        localStorage.setItem(`bwdm_cache_${this.props.id}_lots`, JSON.stringify(this.transformer.layoutToStands(pages)))
        localStorage.setItem(`bwdm_cache_${this.props.id}_rows`, JSON.stringify(this.transformer.layoutToRows(pages)))
        localStorage.setItem(`bwdm_cache_${this.props.id}_geography`, JSON.stringify(this.transformer.layoutToGeography(pages)))
        localStorage.setItem(`bwdm_cache_${this.props.id}_pages`, JSON.stringify(this.transformer.layoutToPages(pages)))

    }

    onTabChange = (activeKey: string) => {
        this.setState({ activeKey })
    }

    onTabEdit = (e: string | MouseEvent<Element, globalThis.MouseEvent> | KeyboardEvent<Element>) => {
        let _marketEventDetails: MarketEventDetails = this.state.marketEventDetails
        if (typeof e === "string") {
            this.showConfirm(e)

            //Update local storage
        } else {
            _marketEventDetails.pages.push({
                title: "",
                layout: [{
                    _key:"",
                    title: "",
                    lots: [],
                    class: "block-left",
                    landmarkBottom: "",
                    landmarkTop: ""
                }]
            })
            //Update local storage
            this.updateStorage(_marketEventDetails)
            this.onTabChange("" + (_marketEventDetails.pages.length - 1))
        }

    }

    showConfirm = (e: string) => {
        let _marketEventDetails: MarketEventDetails = this.state.marketEventDetails
        const title = _marketEventDetails.pages[parseInt(e)].title
        confirm({
            title: `Pagina "${title}" verwijderen?`,
            icon: <ExclamationCircleOutlined />,
            content: 'Let op, het verwijderen van een pagina kan niet ongedaan worden gemaakt.',
            okText: 'Verwijderen',
            okType: 'danger',
            cancelText: "Annuleren",
            onOk: () => {
                _marketEventDetails.pages.splice(parseInt(e), 1)
                //Update local storage
                this.updateStorage(_marketEventDetails)
                this.onTabChange("" + (_marketEventDetails.pages.length - 1))
            }
        })
    }

    render() {
        return <>
            <Tabs
                type="editable-card"
                activeKey={this.state.activeKey}
                onEdit={this.onTabEdit}
                tabPosition="top"
                onChange={this.onTabChange}
            >
                {this.state.marketEventDetails.pages.map((page: MarketPage, i: number) => {
                    const pageindex = i
                    // Need a way to group panel content by title for the upper and lower blocks.
                    return <TabPane tab={this.getPageTitle(page)} key={i}>
                        <><Input type="text" placeholder="Pagina titel" value={page.title || ""}
                            onChange={(e: ChangeEvent<HTMLInputElement>) => {
                                const _marketEventDetails: MarketEventDetails = this.state.marketEventDetails
                                _marketEventDetails.pages[i].title = e.target.value
                                this.updateStorage(_marketEventDetails)
                            }} /></>
                        <div className="block-wrapper">
                            {page.layout && page.layout.length > 0 && page.layout.map((layout: MarketLayout, i: number) => {
                                const layoutindex = i
                                return <div key={layout._key} className={this.getRowClass(layout)}>
                                    {layout.class === 'block-left' &&
                                        <LayoutEdit
                                            index={i}
                                            layout={layout}
                                            changed={this.layoutChanged}
                                            position={[pageindex, layoutindex]}
                                        />
                                    }
                                    <div className={`lot-row`}>
                                        {layout.lots.map((lot: Lot, i: number) => {
                                            const lotindex = i
                                            return <LotBlock
                                                key={i}
                                                index={i}
                                                invert={layout.class === 'block-right' ? true : false}
                                                lot={lot}
                                                classDef={this.getClassname(lot)}
                                                branche={this.getBranche(lot)}
                                                lotOnClick={(event: any) => {
                                                    this.lotToggle(pageindex, layoutindex, lotindex)
                                                }}
                                            />
                                        })}
                                        <Button
                                            title="Kraam of obstakel toevoegen"
                                            type="dashed"
                                            className="add-lot"
                                            icon={<PlusOutlined />}
                                            onClick={() => {
                                                this.lotAdd([pageindex, layoutindex])
                                            }}
                                        />

                                    </div>
                                    {layout.class === 'block-right' &&
                                        <LayoutEdit
                                            index={i}
                                            layout={layout}
                                            changed={this.layoutChanged}
                                            position={[pageindex, layoutindex]}
                                        />}
                                </div>
                            })}
                        </div>
                    </TabPane>
                })}
            </Tabs>
            <LotEdit
                ref={this.lotEdit}
                branches={this.state.marketEventDetails.branches}
                changed={this.lotChanged} delete={this.lotDelete} prepend={this.lotPrepend} append={this.lotAppend} />
        </>
    }
}
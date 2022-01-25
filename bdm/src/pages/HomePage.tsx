import { HomeOutlined, FileZipOutlined } from '@ant-design/icons'
import { Alert, Col, Row, message, Progress, Button, Descriptions } from "antd"
import React, { Component } from "react"
import { Breadcrumb } from 'antd'
import { Link } from 'react-router-dom'
import JSZip from 'jszip'
import { MarketEventDetails, Markets } from '../models'
import { getCacheName, getLocalStorageMarkets, zipAll } from '../common/generic'
import { MMarktService } from '../services/service_mmarkt'
import { MMarkt } from '../models/mmarkt'
import { validateLots } from '../common/validator'
import { Transformer } from '../services/transformer'

interface SystemState {
    zipName?: string,
    lastUpdate?: Date,
    marketCount?: number,
    cachedMarkets?: string[],
    errors: string[]
}
export default class HomePage extends Component {
    readonly state: { markets: Markets, progress: number, progressStatus: "active" | "success", systemState: SystemState } = {
        markets: {},
        progress: 0,
        progressStatus: "active",
        systemState: {
            errors: []
        }
    }

    mmarktService: MMarktService

    constructor(props: any) {
        super(props)
        this.mmarktService = new MMarktService()

    }

    validateMarkets = async () => {
        let systemState: SystemState = {
            errors: []
        }
        const _cachedState = localStorage.getItem('bwdm_state')
        const _markets = getLocalStorageMarkets()
        if (!_cachedState) {
            systemState = {
                cachedMarkets: _markets,
                errors: []
            }
        } else {
            systemState = JSON.parse(_cachedState)
            systemState.cachedMarkets = _markets
        }
        // Empty the error object and reconstruct it
        systemState.errors = []

        const _marketsCache = localStorage.getItem('bwdm_cache_markets')
        if (_marketsCache) {
            const _markets = JSON.parse(_marketsCache)
            this.setState({
                markets: _markets
            }, async () => {
                const transformer = new Transformer()
                const _ids = getLocalStorageMarkets()
                const _errs: Promise<string | undefined>[] = _ids.map(async (m: string) => {
                    const result: MarketEventDetails = await transformer.encode(m)
                    return validateLots(result) ? m : undefined
                })
                let errs: (string | undefined)[] = await Promise.all(_errs)
                systemState.errors = (errs as string[]).filter(e => e !== undefined)
                // Update systemState
                this.setState({
                    progress: 100,
                    progressStatus: "success",
                    systemState: systemState
                })
            })
        }
    }

    componentDidMount() {
        this.validateMarkets()
    }

    beforeUpload = (file: any) => {
        const isZip = file.type === 'application/zip'
        if (!isZip) {
            message.error('You can only upload ZIP file!');
        }
        const isLt2M = file.size / 1024 / 1024 < 2;
        if (!isLt2M) {
            message.error('Image must smaller than 2MB!');
        }
        return isZip && isLt2M;
    }

    handleFile = (event: any) => {
        const f = event.target.files[0]
        this.mmarktService.retrieve().then((mmarkets: MMarkt[]) => {
            JSZip.loadAsync(f)
                .then((zip) => {
                    const max = Object.keys(zip.files).length
                    let _markets: Markets = {}
                    let i = 0
                    zip.forEach((relativePath, zipEntry) => {
                        i = i + 1
                        this.setState({
                            progress: (i / max * 100)
                        })

                        if (zipEntry.dir) {
                            const marketDayDir = zipEntry.name.replace('config/', '').replace('markt/', '').replace('/', '')
                            //find market in mmarkt collection
                            // const isvalid = mmarkets.find((entry: MMarkt) => {
                            //     return entry.afkorting === marketDayDir
                            // })

                            if (marketDayDir && marketDayDir !== "") {
                                if (!_markets[marketDayDir]) {
                                    _markets[marketDayDir] = { id: i, name: "" }
                                } else {
                                    _markets[marketDayDir] = {
                                        id: 1,
                                        name: ""
                                    }
                                }
                            }
                        } else {
                            const filename = zipEntry.name.replace('config/', '').replace('markt/', '')

                            if (!filename.includes("/") && filename.endsWith(".json")) {
                                // GENERIC datafiles
                                // Read the file string and store it in the local storage
                                zipEntry.async("string").then((content: string) => {
                                    if (getCacheName(filename)) {
                                        localStorage.setItem(
                                            `bwdm_lookup_${getCacheName(filename)}`,
                                            JSON.stringify(
                                                JSON.parse(content)
                                            )
                                        )
                                    }
                                })
                            } else if (filename.includes("/") && filename.endsWith(".json")) {
                                // Market datafiles
                                zipEntry.async("string").then((content: string) => {
                                    if (getCacheName(filename.split("/")[1])) {
                                        const cacheName = `bwdm_cache_${filename.split("/")[0]}_${getCacheName(filename.split("/")[1])}`
                                        localStorage.setItem(
                                            `${cacheName}`,
                                            JSON.stringify(
                                                JSON.parse(content)
                                            )
                                        )
                                    }
                                })
                            }
                        }
                    })
                    const systemState = {
                        zipName: f.name,
                        lastUpdate: Date.now(),
                        marketCount: Object.keys(_markets).length,

                    }

                    localStorage.setItem(`bwdm_cache_markets`, JSON.stringify(_markets))
                    localStorage.setItem('bwdm_state', JSON.stringify(systemState))
                    this.setState({
                        markets: _markets,
                        progress: 100,
                        progressStatus: "success",
                        systemState: systemState
                    })
                }, (e) => {
                    console.error("Error reading " + f.name + ": " + e.message)
                })
        })

    }

    render() {
        let myDate
        if (this.state.systemState.lastUpdate) {
            myDate = new Date(this.state.systemState.lastUpdate).toString()
        }

        return <>
            <Breadcrumb>
                <Breadcrumb.Item>
                    <Link to="/">
                        <HomeOutlined />
                    </Link>
                </Breadcrumb.Item>
            </Breadcrumb>
            <Progress percent={this.state.progress} status={this.state.progressStatus} />
            <Row gutter={[16, 16]}>
                <Col>
                    {myDate &&
                        <p><b>Er is een bestand actief.</b> Importeer eventueel opnieuw een <i>markten zip</i> bestand om te bewerken.
                            Wanneer de bewerkingen zijn gedaan, dan kun je het zip bestand hier downloaden en aanbieden aan de kiesjekraam
                            applicatie voor actieve marktindelingen.
                        </p>
                    }
                    {!myDate &&
                        <p>Importeer een <i>markten zip</i> bestand om te bewerken. Wanneer de bewerkingen zijn gedaan, dan kun je het zip
                            bestand hier downloaden en aanbieden aan de kiesjekraam applicatie voor actieve marktindelingen.
                        </p>
                    }
                </Col>
            </Row>
            <Row gutter={[16, 16]}>
                <Col key="init-app">

                    <Descriptions title={myDate ? "Systeem status" : "Upload een markten zip bestand"} bordered>
                        {myDate && <>
                            <Descriptions.Item label="Bestand">{this.state.systemState.zipName}</Descriptions.Item>

                            <Descriptions.Item label="Geladen op">{myDate}</Descriptions.Item>
                            <Descriptions.Item label="Markten">{this.state.systemState.marketCount}</Descriptions.Item>

                        </>
                        }
                        {this.state.systemState.cachedMarkets && this.state.systemState.cachedMarkets.length > 0 &&

                            <Descriptions.Item label="Download">
                                {this.state.systemState.errors && this.state.systemState.errors.length > 0 &&
                                    <>
                                        <Alert message="Er zijn markten met fouten. Corrigeer de fouten om download te activeren" type="error" />
                                        {this.state.systemState.errors.map((marketId: string) => {
                                            return <Link key={marketId} to={{
                                                pathname: `/market/${marketId}`
                                            }}>
                                                <span style={{ padding: "10px" }}>{marketId}</span>
                                            </Link>
                                        })}
                                    </>
                                }
                                {this.state.systemState.errors && this.state.systemState.errors.length === 0 &&
                                    <Button
                                        title="Download het zip bestand met alle markten en configuratie"
                                        icon={<FileZipOutlined />}
                                        type="link"
                                        onClick={() => {
                                            zipAll()
                                        }}
                                    >Download zip bestand</Button>
                                }
                            </Descriptions.Item>

                        }
                        <Descriptions.Item label="Geheugen"><Button type="link" title="Leegmaken" onClick={() => {
                            localStorage.clear()
                            window.location.reload()
                        }}>Reset</Button></Descriptions.Item>
                        <Descriptions.Item label="Upload">
                            <input type="file" id="file" name="file" onChange={this.handleFile} />
                        </Descriptions.Item>
                    </Descriptions>
                </Col>
            </Row>
        </>
    }
}
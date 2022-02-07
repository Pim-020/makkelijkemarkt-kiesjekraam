import { Breadcrumb, Button, Input, Popover } from "antd"
import React, { ChangeEvent, Component } from "react"
import { Link } from "react-router-dom"
import { HomeOutlined } from '@ant-design/icons'
import { Branche } from "../models"
import { BrancheService } from "../services/service_lookup"
import { mmApiService } from "../services/service_mm_api"
import {
    DeleteOutlined, PlusOutlined, BgColorsOutlined,
    // UploadOutlined 
} from '@ant-design/icons'
import { getTextColor } from '../common/generic'
import CSS from 'csstype'
import { ChromePicker } from 'react-color'
import { message } from 'antd'

export default class BrancheListPage extends Component {

    readonly state: { dirtybits: boolean, branches: Branche[], displayColorPicker: boolean } = {
        dirtybits: false,
        displayColorPicker: false,
        branches: []
    }
    getStyle = (branche: Branche): CSS.Properties => {
        return {
            background: branche.color || "#fff",
            color: getTextColor(branche.color) || "#000"
        }
    }

    brancheService: BrancheService

    constructor(props: any) {
        super(props)
        this.brancheService = new BrancheService()
    }

    updateBranches = (branches: Branche[], dirty: boolean = false) => {
        // Do not updateBranches when the branches length is 0.
        if (branches.length > 0) {
            localStorage.setItem('bwdm_lookup_branches', JSON.stringify(branches))
            // We need to trigger the remote update with a dirty parameter. 
            // Do not update to often as this will send more requests
            // then necessary to the backend.
            if (dirty) {
                const _branches = this.state.branches.filter((b: Branche) => b !== null)
                this.brancheService.update(_branches).catch((e: any) => {
                    message.error('Er is iets fout gegaan')
                })
                this.setState({ dirtybits: false })
            } else {
                this.setState({ dirtybits: true })
            }
            this.setState({
                branches
            })
        }
    }

    componentDidMount = () => {
        mmApiService(`/branches`).then((branches: Branche[]) => {
            const _branches = branches.filter((b: Branche) => b !== null)
            // Make sure there are no empty elements in the branches.
            this.setState({
                branches: _branches
            })
        })
    }

    render() {
        return <><Breadcrumb>
            <Breadcrumb.Item>
                <Link to="/">
                    <HomeOutlined />
                </Link>
            </Breadcrumb.Item>
            <Breadcrumb.Item>
                <Link to="/branches">
                    <span>Branches</span>
                </Link>
            </Breadcrumb.Item>
        </Breadcrumb>
            <table>
                <thead>
                    <tr><th>Code</th><th>Titel</th><th>Omschrijving</th><th></th></tr>
                </thead>
                <tbody>
                    {this.state.branches.map((branche, i) => {
                        return <tr key={i}>
                            <td style={this.getStyle(branche)}>

                                <Popover content={<ChromePicker color={branche.color} disableAlpha={true} onChange={(color: any, event: any) => {
                                    if (this.state.branches) {
                                        const _branches = this.state.branches
                                        _branches[i].color = color.hex
                                        this.updateBranches(_branches)
                                    }


                                }} />} trigger="click">
                                    <Button
                                        title="Kleur veranderen"
                                        icon={<BgColorsOutlined />}
                                    />
                                </Popover>
                            </td>
                            <td>{branche.number ? branche.number : ""}</td>
                            <td>
                                <Input value={branche.brancheId} placeholder={"ID-Naam"}
                                    onChange={(e: ChangeEvent<HTMLInputElement>) => {
                                        if (e.target.value && this.state.branches) {
                                            const _branches = this.state.branches
                                            _branches[i].brancheId = e.target.value
                                            _branches[i].number = parseInt(e.target.value.split('-')[0])
                                            this.updateBranches(_branches)

                                        }
                                    }}
                                />
                            </td>
                            <td>
                                <Input value={branche.description} placeholder={"Omschrijving"}
                                    onChange={(e: ChangeEvent<HTMLInputElement>) => {
                                        if (e.target.value && this.state.branches) {
                                            const _branches = this.state.branches
                                            _branches[i].description = e.target.value
                                            this.updateBranches(_branches)
                                        }
                                    }}
                                />
                            </td>

                            <td><Button
                                danger
                                title="Branche verwijderen"
                                type="primary"
                                icon={<DeleteOutlined />}
                                onClick={() => {
                                    if (this.state.branches) {
                                        const _branches = this.state.branches
                                        delete _branches[i]
                                        this.updateBranches(_branches)
                                    }
                                }}
                            /></td>
                        </tr>

                    })}</tbody></table>
            <Button
                onClick={() => {
                    const _branches = this.state.branches || []
                    _branches.push({
                        number: 0,
                        brancheId: "",
                        description: "",
                        color: "#fff"
                    })
                    this.updateBranches(_branches)
                }}
                style={{ marginTop: '20px' }}
                icon={<PlusOutlined />}
            >Toevoegen</Button>
            {/* <Button
                disabled={!this.state.dirtybits}
                title={`Upload branches.json naar de centrale server`}
                style={{ marginLeft: "1em" }}
                icon={<UploadOutlined />}
                type="primary"
                onClick={() => {
                    this.updateBranches(this.state.branches, true)
                }}

            >Branches opslaan</Button> */}
        </>
    }
}
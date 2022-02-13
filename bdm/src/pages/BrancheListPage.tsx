import { Breadcrumb, Button, Input, Popover } from "antd"
import React, { ChangeEvent, Component } from "react"
import { Link } from "react-router-dom"
import { HomeOutlined } from '@ant-design/icons'
import { some, every} from 'lodash'
import { Branche } from "../models"
import { useGenericBranches } from '../hooks'
import {
    DeleteOutlined, PlusOutlined, BgColorsOutlined,
} from '@ant-design/icons'
import { getTextColor } from '../common/generic'
import CSS from 'csstype'
import { ChromePicker } from 'react-color'
import { message } from 'antd'

class BrancheListPage extends Component<{genericBranches: Branche[] | undefined}> {
    readonly state: { branches: Branche[], displayColorPicker: boolean } = {
        displayColorPicker: false,
        branches: []
    }
    getStyle = (branche: Branche): CSS.Properties => {
        return {
            background: branche.color || "#fff",
            color: getTextColor(branche.color) || "#000"
        }
    }

    constructor(props: any) {
        super(props)
    }

    updateBranches = (branches: Branche[]) => {
        // Do not updateBranches when the branches length is 0.
        if (branches.length > 0) {
            this.setState({
                branches
            })
        }
    }

    componentDidMount = () => {
        this.setState({
            branches: this.props.genericBranches
        })
    }

    render() {
        console.log(this.state)
        return <>
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
                                    const _branches = this.state.branches.filter(b => b.id !== branche.id)
                                    // if (this.state.branches) {
                                    //     const _branches = this.state.branches
                                    //     delete _branches[i]
                                    this.updateBranches(_branches)
                                    // }
                                }}
                            /></td>
                        </tr>

                    })}</tbody></table>
            <Button
                onClick={() => {
                    const _branches = this.state.branches || []
                    const id = Math.max(...this.state.branches.map(x => x.id)) + 1
                    _branches.push({
                        id,
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

const BranchesDataWrapper = () => {
    const genericBranches = useGenericBranches()
    const data = [genericBranches]

    if (some(data, item => item.isLoading)) { return null }
    if (some(data, item => item.isError)) { return null }

    return <BrancheListPage genericBranches={genericBranches.data}/>
}

export default BranchesDataWrapper

import { Breadcrumb } from "antd"
import React, { Component } from "react"
import { Link } from "react-router-dom"
import { HomeOutlined } from '@ant-design/icons'
import { Announcements } from "../models"
import { AnnouncementService } from "../services/service_lookup"

export default class AnnouncementListPage extends Component {
    readonly state: { announcements: Announcements } = {
        announcements: {
            marktDetail: {
                activatie: "",
                wenperiode: "",
                live: ""
            },
            marktDetailPlaatsvoorkeuren: {
                activatie: "",
                wenperiode: "",
                live: ""
            },
            aanwezigheid: {
                activatie: "",
                wenperiode: "",
                live: ""
            },
            plaatsVoorkeuren: {
                activatie: "",
                wenperiode: "",
                live: ""
            }
        }
    }

    announcementService: AnnouncementService

    constructor(props: any) {
        super(props)
        this.announcementService = new AnnouncementService()
    }

    componentDidMount = () => {
        this.announcementService.retrieve().then((announcements: Announcements) => {
            this.setState({
                announcements
            })
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
                    <Link to="/announcements">
                        <span>Mededelingen</span>
                    </Link>
                </Breadcrumb.Item>
            </Breadcrumb>{
                Object.keys(this.state.announcements).sort().map((entry: string, i: number) => {

                    const _acti: string = (this.state.announcements as any)[entry]["activatie"]
                    const _wenp: string = (this.state.announcements as any)[entry]["wenperiode"]
                    const _live: string = (this.state.announcements as any)[entry]["live"]

                    return <div key={i} style={{ border: "1px solid #ccc", margin: "1em", padding: "1em"}}>
                        <p><b>{entry}:</b></p>
                        <hr/>
                        <div dangerouslySetInnerHTML={{__html:_acti}} />
                        <div dangerouslySetInnerHTML={{__html:_wenp}} />
                        <div dangerouslySetInnerHTML={{__html:_live}} />
                    </div>
                })
            }
        </>
    }
}
import { GlobalStyle, Header, ThemeProvider } from '@amsterdam/asc-ui'
import React, { Component } from 'react'
import { BrowserRouter, NavLink, Route, Switch } from 'react-router-dom'
import { QueryClient, QueryClientProvider } from 'react-query'
import CalendarPage from './pages/CalendarPage'
import MarketPage from './pages/MarketPage'
import MarketListPage from './pages/MarketListPage'
import { Layout } from 'antd'
import BrancheListPage from './pages/BrancheListPage'
import AnnouncementListPage from './pages/AnnouncementListPage'
import ObstacleListPage from './pages/ObstacleListPage'
import PropertyListPage from './pages/PropertyListPage'
import HomePage from './pages/HomePage'

const {Footer } = Layout
const queryClient = new QueryClient()

export default class App extends Component {

  render() {
    return (
      <ThemeProvider>
        <QueryClientProvider client={queryClient}>
          <GlobalStyle />
          <div className="App">
            <BrowserRouter basename="/bdm">
              <Header tall={false} title="Bewerk de markten" fullWidth={false} homeLink="/"/>
              <ul className="menu-item-ul">
                <li className="menu-item-li"><NavLink exact className="menu-item" activeClassName="active" to="/">Home</NavLink></li>
                <li className="menu-item-li"><NavLink className="menu-item" activeClassName="active" to="/markets">Markten</NavLink></li>
                <li className="menu-item-li"><NavLink className="menu-item" activeClassName="active" to="/branches">Branches</NavLink></li>
                {/* <li className="menu-item-li"><NavLink className="menu-item" activeClassName="active" to="/calendar">Kalender</NavLink></li> */}
                {/* <li className="menu-item-li"><NavLink className="menu-item" activeClassName="active" to="/announcements">Mededelingen</NavLink></li> */}
                {/* <li className="menu-item-li"><NavLink className="menu-item" activeClassName="active" to="/obstacles">Obstakels</NavLink></li> */}
                {/* <li className="menu-item-li"><NavLink className="menu-item" activeClassName="active" to="/properties">Plaatseigenschappen</NavLink></li> */}
              </ul>
              <div className="site-layout-content">
                <Switch>
                  <Route path="/markets" component={MarketListPage} />
                  <Route path="/branches" component={BrancheListPage} />
                  <Route path="/calendar" component={CalendarPage} />
                  <Route path="/announcements" component={AnnouncementListPage} />
                  <Route path="/obstacles" component={ObstacleListPage} />
                  <Route path="/properties" component={PropertyListPage} />
                  <Route path="/market/:id" exact component={MarketPage} />
                  <Route path="/" exact component={HomePage} />
                </Switch>
              </div>
            </BrowserRouter>
          </div>
          <Footer/>
        </QueryClientProvider>
      </ThemeProvider>
    );
  }
}


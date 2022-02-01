import { GlobalStyle, Header, ThemeProvider } from '@amsterdam/asc-ui'
import React, { Component } from 'react'
import { BrowserRouter, Route, Switch } from 'react-router-dom'
import { QueryClient, QueryClientProvider } from 'react-query'
import { Layout } from 'antd'

import ErrorPage from './pages/ErrorPage'
import MarketPage from './pages/MarketPage'

const { Footer } = Layout
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
              <div className="site-layout-content">
                <Switch>
                  <Route path="/market/:id" exact component={MarketPage} />
                  <Route path="/" component={ErrorPage} />
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

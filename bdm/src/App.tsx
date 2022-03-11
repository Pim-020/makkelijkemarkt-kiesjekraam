import { GlobalStyle, Header, ThemeProvider } from '@amsterdam/asc-ui'
import React, { Component } from 'react'
import { BrowserRouter, Route, Switch } from 'react-router-dom'
import { QueryClient, QueryClientProvider } from 'react-query'
import { Layout } from 'antd'

import ErrorPage from './pages/ErrorPage'
import BrancheListPage from './pages/BrancheListPage'
import MarktDataProvider from './components/providers/MarktDataProvider'
import MarktGenericDataProvider from './components/providers/MarktGenericDataProvider'
import MarktPageWrapper from './components/MarktPageWrapper'

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
              <Header tall={false} title="Bewerk de markten" fullWidth={false} homeLink="/bdm/branches" />
              <div className="site-layout-content">
                <Switch>
                  <Route exact path="/markt/:marktId">
                    <MarktGenericDataProvider>
                      <MarktDataProvider>
                        <MarktPageWrapper />
                      </MarktDataProvider>
                    </MarktGenericDataProvider>
                  </Route>
                  <Route exact path="/branches">
                    <MarktGenericDataProvider>
                      <BrancheListPage />
                    </MarktGenericDataProvider>
                  </Route>
                  <Route component={ErrorPage} />
                </Switch>
              </div>
            </BrowserRouter>
          </div>
          <Footer />
        </QueryClientProvider>
      </ThemeProvider>
    )
  }
}

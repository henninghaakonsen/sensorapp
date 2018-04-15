// @flow

import React from 'react'
import MuiThemeProvider from 'material-ui/styles/MuiThemeProvider';
import { connectClass } from '../connect'

import Navigation from '../components/Navigation'
import NodeInfoComponent from '../components/NodeInfoComponent'
import Welcome from '../components/Welcome'
import ResultGraph from '../components/ResultGraph'
import theme from '../styles'

import { Router, Route } from 'react-router-dom';
import { Redirect } from 'react-router';
import history from '../utils/history';

let ContentLoader = (props) => (
  <Router history={history}>
      <div style={{
        width: '85vw',
        height: '100%'
      }}>
          <Route exact path="/" component={Welcome} />
          <Route path="/nodes/:nodeId" component={NodeInfoComponent} />
          <Route path="/results/:resultId" component={ResultGraph} />
      </div>
  </Router>
);

class App extends React.Component {
  props: {
    selectNode: (nodeId) => void,    
  }

  constructor(props) {
    super(props)
    this.props.selectNode(history.location.pathname.split('/').slice(-1)[0])
  }
  
  render() {
    return (
      <MuiThemeProvider muiTheme={theme}>
        <div style={{height: '100vh', width: '100vw', position: 'fixed'}}>
          <Vertical>
            <SideBar>
              <Navigation props={this.props}/>
            </SideBar>
            <Main>
              <ContentLoader props={this.props}/>
            </Main>
          </Vertical>
        </div>
      </MuiThemeProvider>
    )
  }
}

const Vertical = ({children}) => {
  return (
    <div style={{
      display: 'flex',
      flexDirection: 'row',
      height: '100%',
      width: '100vw',
    }}>
      { children }
    </div>
  )
}

const Main = ({children}) => {
  return (
    <div style={{
      height: '100%',
      width: '85vw',
    }}>
      { children }
    </div>
  )
}

const SideBar = ({children}) => {
  return (
    <div style={{
      backgroundColor: '#f4f4f4',
      boxShadow: '0px 4px 8px #444444',
      display: 'flex',
      flexDirection: 'column',
      height: '100%',
      width: '15%',
      zIndex: 1,
    }}>
      { children }
    </div>
  )
}

const doNothing = () => { }

const Connected = connectClass(
  (state: AppState) => ({
  }),
  (dispatch: (action: Action) => void) => ({
    selectNode: (nodeId) => dispatch({ type: 'NODE_SELECTED', nodeId }),    
  }), App
)

export default Connected;

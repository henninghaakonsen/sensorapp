// @flow

import React, { Component } from 'react'
import { connectClass } from '../connect'
import { colors } from '../styles'
import Button from './Button';

import type { Action } from '../actions'

class Header extends Component {
  props: {
    selectedNode: Node,
    selectHome: () => void,
  }

  constructor(props) {
    super(props)
  }

  onClick() {
    this.props.selectHome()
  }

  render() {
   return (
        <div style={{
        alignItems: 'center',
        backgroundColor: colors.accent,
        color: 'white',
        display: 'flex',
        flexDirection: 'column',
        fontSize: 20,
        fontWeight: 200,
        height: 50,
        justifyContent: 'center',
        minHeight: 50,
        textShadow: '1px 1px 5px #888888',
        userSelect: 'none',
        zIndex: 2,
      }}>
        <Button
          color="white"
          homeButton={true}
          onClick={() => this.onClick()}
          text={"HOME"}
          selected={!this.props.selectedNode} />
      </div>
   )
  }
}


const Connected = connectClass(
  (state: AppState) => ({
    selectedNode: state.navigation.selectedNode,
  }),
  (dispatch: (action: Action) => void) => ({
    selectHome: () => dispatch({ type: 'SELECT_HOME' }),
  }), Header
)
export default Connected;
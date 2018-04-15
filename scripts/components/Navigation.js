// @flow

import React, { Component } from 'react'
import { connectClass } from '../connect'
import { Router, Route } from 'react-router-dom';
import { Redirect } from 'react-router';
import CircularProgress from 'material-ui/CircularProgress';
import history from '../utils/history';

import Button from './Button';
import { colors, fonts } from '../styles'
import type { Action } from '../actions'
import type { AppState } from '../types'
import type { SensorNode, NodeInformation } from '../types'

class Navigation extends Component {
  props: {
    nodes: SensorNode[],
    fetchingNodes: boolean,
    interval: Number,
    selectedNode: Node,
    fetchNodes: () => void,
    selectNode: (nodeId) => void,    
  }

  constructor(props) {
    super(props)

    this.props.fetchNodes()
  }

  onClick(node: SensorNode) {
    if ( node == undefined ){
      history.push('/')
      this.props.selectNode('')
    } else {
      history.push('/nodes/' + node.id)
      this.props.selectNode(node.id)      
    }
  }

  render() {
    return (
      <div style={{
        textAlign: 'center',
        overflow: 'scroll',
        height: '100%',
      }}>
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
            selected={this.props.selectedNode} />
        </div>
        <div style={{ paddingTop: 20 }} />
        {this.props.nodes &&
          <NodeList
            busy={this.props.fetchingNodes}
            onClick={(node) => this.onClick(node)}
            selectedId={this.props.selectedNode}
            nodes={this.props.nodes}
          />
        }
      </div>
    )
  }
}

const NodeList = ({ busy, selectedId, onClick, nodes }: {
  busy: boolean,
  onClick: (node: NodeId) => void,
  selectedId?: string,
  nodes: SensorNode[],
}) => {
  return (
    <div>
      <h2 style={{ fontWeight: 400, fontSize: fonts.large }} />
      {busy && <CircularProgress color={colors.accent} />}
      <div style={{
        overflow: 'scroll',
      }}>
        {nodes.sort(function (a, b) {
          return a.id.localeCompare(b.id)
        }).map(node =>
          <NodeUnit
            key={node.id}
            onClick={() => onClick(node)}
            selected={selectedId ? (node.id == selectedId) : false}
            node={node}
          />
        )}
      </div>
    </div>
  )
}

const NodeUnit = ({ node, onClick, selected }: {
  node: SensorNode,
  onClick: () => void,
  selected?: boolean,
}) => {
  return (
    <div style={{ marginTop: 4 }}>
      <Button color="#841584"
        onClick={selected ? doNothing : () => onClick()}
        text={node.displayName}
        selected={selected} />
    </div>
  )
}

const doNothing = () => { }

const Connected = connectClass(
  (state: AppState) => ({
    nodes: state.navigation.nodes,
    selectedNode: state.navigation.selectedNode,
    fetchingNodes: state.navigation.fetchingNodes,
    interval: state.navigation.interval,
  }),
  (dispatch: (action: Action) => void) => ({
    fetchNodes: () => dispatch({ type: 'NODES_FETCH_REQUESTED' }),
    selectNode: (nodeId) => dispatch({ type: 'NODE_SELECTED', nodeId }),    
  }), Navigation
)

export default Connected;

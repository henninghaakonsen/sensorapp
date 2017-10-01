// @flow

import React, { Component } from 'react'
import { connectClass } from '../connect'
import CircularProgress from 'material-ui/CircularProgress';

import Button from './Button';
import { colors, fonts } from '../styles'
import type { Action } from '../actions'
import type { AppState } from '../types'
import type { Node, NodeInformation } from '../types'

class Navigation extends Component {
  props: {
    nodes: Node[],
    selectedNode: Node,
    fetchingNodes: boolean,
    fromDate: Date,
    toDate: Date,
    limit: Number,
    fetchNodes: (fromDate: Date, toDate: Date) => void,
    selectNode: (node: Node) => void,
    selectHome: () => void,
    setTimeSpan: (fromDate: Date, toDate: Date) => void,
  }

  constructor(props) {
    super(props)

    const fromDate = new Date();
    const toDate = new Date();
    fromDate.setDate(fromDate.getDate() - 1);

    this.props.setTimeSpan(fromDate, toDate)
    this.props.fetchNodes(fromDate, toDate, this.props.limit)
  }

  onClick(node: Node) {
    if (node == null) {
      this.props.selectHome()
    } else this.props.selectNode(node)
  }

  render() {
    return (
      <div style={{
        textAlign: 'center',
        overflow: 'scroll',
        height: '100%',
      }}>
        <div style={{ paddingTop: 20 }} />

        {this.props.nodes &&
          <NodeList
            busy={this.props.fetchingNodes}
            onClick={(node) => this.onClick(node)}
            selectedId={this.props.selectedNode && this.props.selectedNode.id}
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
  nodes: Node[],
}) => {
  return (
    <div>
      <h2 style={{ fontWeight: 400, fontSize: fonts.large }} />
      {busy && <CircularProgress color={colors.accent} />}
      <div style={{
        overflow: 'scroll',
      }}>
        <div style={{ marginTop: 4 }}>
          <Button color="#841584"
            onClick={() => onClick(null)}
            text={'HOME'}
            selected={selectedId == null} />
        </div>
        {nodes.map(node =>
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
  node: Node,
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
    fromDate: state.navigation.fromDate,
    toDate: state.navigation.toDate,
    limit: state.navigation.limit,
  }),
  (dispatch: (action: Action) => void) => ({
    fetchNodes: (fromDate: Date, toDate: Date, limit: Number) => dispatch({ type: 'NODES_FETCH_REQUESTED', fromDate, toDate, limit }),
    selectNode: (node: Node) => dispatch({ type: 'NODE_SELECTED', node }),
    selectHome: () => dispatch({ type: 'SELECT_HOME' }),
    setTimeSpan: (fromDate: date, toDate: Date) => dispatch({ type: 'SET_TIMESPAN', fromDate, toDate }),
  }), Navigation
)

export default Connected;

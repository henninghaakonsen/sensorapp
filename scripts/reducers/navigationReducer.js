// @flow

import type { Action } from '../actions'
import type { Node, NodeInformation } from '../types'

export type Navigation = {
  nodes: Node[],
  selectedNode: Node,
  fetchingChildren: boolean,
  fromDate: Date,
  toDate: Date,
  interval: Number,
}

const initialState: Navigation = {
  nodes: [],
  selectedNode: null,
  fetchingChildren: false,
  fromDate: null,
  toDate: null,
  interval: 10,
}

export default function navigationReducer(state: Navigation = initialState, action: Action): Navigation {
  switch (action.type) {
    case 'SET_TIMESPAN':
      return { ...state, fromDate: action.fromDate, toDate: action.toDate }

    case 'SET_INTERVAL':
      return { ...state, interval: action.interval }

    case 'NODES_FETCH_REQUESTED':
      return { ...state, fetchingNodes: true }

    case 'NODES_FETCH_SUCCEEDED':
      return {
        ...state,
        nodes: action.nodes,
        fetchingNodes: false,
      }

    case 'NODES_FETCH_FAILED':
      return { ...state, nodes: [], fetchingNodes: false }

    case 'NODE_SELECTED':
      return { ...state, selectedNode: action.node }

    case 'NODE_FETCH_REQUESTED':
      return { ...state, fetchingNodes: true }

    case 'NODE_FETCH_FAILED':
      return { ...state, selectedNode: null, selectedNodeInformation: [], fetchingNodes: false }

    case 'NODE_FETCH_SUCCEEDED':
      return {
        ...state,
        selectedNode: action.node,
        fetchingNodes: false
      }

    case 'SELECT_HOME':
      return {
        ...state,
        selectedNode: null,
        selectedNodeInformation: []
      }

    case 'GENERATE_AVERAGES_SUCCEEDED':
      return { ...state }

    case 'GENERATE_AVERAGES_FAILED':
      return { ...state }

    default:
      return state
  }
}

// @flow

import type { Action } from '../actions'
import type { SensorNode, NodeInformation } from '../types'

export type Navigation = {
  nodes: SensorNode[],
  fetchingChildren: boolean,
  selectedNode: string,
}

const initialState: Navigation = {
  nodes: [],
  fetchingChildren: false,
  selectedNode: undefined,
}

export default function navigationReducer(state: Navigation = initialState, action: Action): Navigation {
  switch (action.type) {
    case 'NODE_SELECTED':
      return { ...state, selectedNode: action.nodeId }

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

    case 'NODE_FETCH_REQUESTED':
      return { ...state, fetchingNodes: true }

    case 'NODE_FETCH_FAILED':
      return { ...state, selectedNodeId: null, selectedNodeInformation: [], fetchingNodes: false }

    case 'NODE_FETCH_SUCCEEDED':
      return {
        ...state,
        selectedNodeId: action.node.id,
        fetchingNodes: false
      }

    case 'SELECT_HOME':
      return {
        ...state,
        selectedNodeId: null,
      }

    case 'GENERATE_AVERAGES_SUCCEEDED':
      return { ...state }

    case 'GENERATE_AVERAGES_FAILED':
      return { ...state }

    default:
      return state
  }
}

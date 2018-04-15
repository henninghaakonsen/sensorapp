/*
 * We define a type Action so that flow can type check every action that is
 * dispatched through a smart component. Every logical action that redefines
 * another smart component should be fired with redux dispatches of actions.
 *
 * @flow
 */

import typeimport { NodeDetails } from "./types";
 { SensorNode, NodeInformation } from './types'

export type Action =
    // Navigation actions
    | { type: 'NODE_SELECTED', nodeId: string }
    | { type: 'NODES_FETCH_REQUESTED' }
    | { type: 'NODES_FETCH_SUCCEEDED', nodes: SensorNode[] }
    | { type: 'NODES_FETCH_FAILED', message: string }
    | { type: 'NODE_FETCH_REQUESTED', node: SensorNode }
    | { type: 'NODE_FETCH_SUCCEEDED', node: NodeInformation }
    | { type: 'NODE_FETCH_FAILED', message: string }
    | { type: 'NODE_FETCH_DETAILS_REQUESTED', node: SensorNode }
    | { type: 'NODE_FETCH_DETAILS_SUCEEDED', node: SensorNode }
    | { type: 'NODE_FETCH_DETAILS_FAILED', message: String }
    | { type: 'NODE_QUERY_CLICKED', node: SensorNode }
    | { type: 'SELECT_HOME' }
    | { type: 'GENERATE_AVERAGES', id: String }
/*
 * We define a type Action so that flow can type check every action that is
 * dispatched through a smart component. Every logical action that redefines
 * another smart component should be fired with redux dispatches of actions.
 *
 * @flow
 */

import typeimport { NodeDetails } from "./types";
 { Node, NodeInformation } from './types'

export type Action =
    // Navigation actions
    { type: 'SET_TIMESPAN', fromDate: Date, toDate: Date }
    | { type: 'SET_INTERVAL', interval: Number }
    | { type: 'SET_MODE', mode: String }
    | { type: 'NODES_FETCH_REQUESTED', fromDate: Date, toDate: Date, interval: Number }
    | { type: 'NODES_FETCH_SUCCEEDED', nodes: Node[] }
    | { type: 'NODES_FETCH_FAILED', message: string }
    | { type: 'NODE_FETCH_REQUESTED', node: Node, fromDate: Date, toDate: Date, interval: Number }
    | { type: 'NODE_FETCH_SUCCEEDED', node: NodeInformation }
    | { type: 'NODE_FETCH_FAILED', message: string }
    | { type: 'NODE_FETCH_DETAILS_REQUESTED', node: Node, fromDate: Date, toDate: Date, interval: Number }
    | { type: 'NODE_FETCH_DETAILS_SUCEEDED', node: Node }
    | { type: 'NODE_FETCH_DETAILS_FAILED', message: String }
    | { type: 'NODE_QUERY_CLICKED', node: Node }
    | { type: 'NODE_SELECTED', node: Node }
    | { type: 'SELECT_HOME' }
    | { type: 'GENERATE_AVERAGES', id: String }
/*
 * For this simple health registry application, we choose to use the online demo
 * api available online at play.dhis2.org.
 *
 * @flow
 */

import type { Node, NodeInformation } from './types'

//const apiServer = 'http://localhost:' + (process.env.PORT || 8020) + '/api'
const apiServer = 'http://158.39.77.97:' + (process.env.PORT || 9000) + '/api'

const fetchNodesOptions = {
    method: 'GET',
    nodes: {
        'Content-Type': 'application/json',
    },
}

const fetchNodeInformationOptions = {
    method: 'GET',
    information: {
        'Content-Type': 'application/json',
    },
}

const generateAveragesOptions = {
    method: 'POST',
    information: {
        'Content-Type': 'application/json',
    },
}

function rejectFetchFailures(response) {
    return response.status >= 200 && response.status < 300 ?
        Promise.resolve(response) :
        Promise.reject(response)
}

export function fetchNodeList(fromDate: String, toDate: String, interval: Number): Promise<Node[]> {
    return fetch(`${apiServer}/nodes`, fetchNodesOptions)
        .then(rejectFetchFailures)
        .then(response => response.json())
        .then(({ nodes }) =>
            Promise.all(nodes.map(node => {
                return fetchOneNodeAverage(node, fromDate, toDate, interval)
                    .then(nodeInfo => ({
                        id: node.id,
                        displayName: node.displayName,
                        nodeInfo: nodeInfo,
                    }))
            })))
        .then(nodes => nodes);
}

export function fetchOneNode(node: Node, fromDate: String, toDate: String, interval: Number): Promise<NodeInformation[]> {
    return fetch(`${apiServer}/nodes/${node.id}?interval=${interval}&fromDate=${fromDate}&toDate=${toDate}`, fetchNodeInformationOptions)
        .then(rejectFetchFailures)
        .then(response => response.json())
        .then(({ information }) => information.map(node => ({
            type: node.type,
            timestamp: node.timestamp,
            latency: node.latency,
            coverage: node.coverage,
        })));
}

export function fetchOneNodeAverage(node: Node, fromDate: String, toDate: String, interval: Number): Promise<NodeInformation[]> {
    return fetch(`${apiServer}/nodes/${node.id}?interval=${interval}`, fetchNodeInformationOptions)
        .then(rejectFetchFailures)
        .then(response => response.json())
        .then(({ information }) => information.map(node => ({
            timestamp: node.timestamp,
            latency: node.latency,
            coverage: node.coverage,
            latencyDataPoints: node.latencyDataPoints,
            coverageDataPoints: node.coverageDataPoints,
        })));
}

export function generateAverages(): Promise<String> {
    return fetch(`${apiServer}/generateAverage`, generateAveragesOptions)
        .then(rejectFetchFailures)
        .then(response => response.json())
}

export function generateAveragesOnIndex(id: String): Promise<String> {
    return fetch(`${apiServer}/nodes/generateAverage/${id}`, generateAveragesOptions)
        .then(rejectFetchFailures)
        .then(response => response.json())
}

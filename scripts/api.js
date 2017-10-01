/*
 * For this simple health registry application, we choose to use the online demo
 * api available online at play.dhis2.org.
 *
 * @flow
 */

import type { Node, NodeInformation } from './types'

const apiServer = 'http://localhost:' + (process.env.PORT || 8020) + '/api'
//const apiServer = 'https://nb-iot-sensorserver.herokuapp.com/api'

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

function rejectFetchFailures(response) {
    return response.status >= 200 && response.status < 300 ?
      Promise.resolve(response) :
      Promise.reject(response)
}

export function fetchNodeList(fromDate: String, toDate: String, limit: Number): Promise<Node[]> {
  return fetch(`${apiServer}/nodes`, fetchNodesOptions)
      .then(rejectFetchFailures)
      .then(response => response.json())
      .then(({ nodes }) =>
        Promise.all(nodes.map(node => {
          return fetchOneNode(node, fromDate, toDate, limit)
            .then(nodeInfo => ({
                id: node.id,
                displayName: node.displayName,
                nodeInfo: nodeInfo.reverse(),
            }))
          })))
      .then(nodes => nodes);
}

export function fetchOneNode( node: Node, fromDate: String, toDate: String, limit: Number ): Promise< NodeInformation[]> {
  return fetch(`${apiServer}/nodes/${node.id}?limit=${limit}&fromDate=${fromDate}&toDate=${toDate}`, fetchNodeInformationOptions)
    .then(rejectFetchFailures)
    .then(response => response.json())
    .then(({ information }) => information.map(node => ({
      type: node.type,
      timestamp: node.timestamp,
      latency: node.latency,
      coverage: node.coverage,
    })));
}

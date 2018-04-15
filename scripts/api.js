/*
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

export function fetchNodeList(): Promise<Node[]> {
    return fetch(`${apiServer}/nodes`, fetchNodesOptions)
        .then(rejectFetchFailures)
        .then(response => response.json())
        .then(({ nodes }) =>
            Promise.all( nodes.map(node => {
                return fetchOneNodeAverage(node)
                  .then(nodeInfo =>
                    fetchOneNode(node)
                      .then(nodeDetails => ({
                        id: node.id,
                        displayName: node.displayName,
                        nodeInfo: nodeInfo,
                        nodeDetails: nodeDetails,
                      }))
                  )
              }))
        )
        .then( nodes => nodes );
}

export function fetchOneNode(node: SensorNode): Promise<NodeDetails[]> {
    return fetch(`${apiServer}/nodes/${node.id}?interval=0`, fetchNodeInformationOptions)
        .then(rejectFetchFailures)
        .then(response => response.json())
        .then(({ information }) => information.map(node => ({
            timestamp: node.timestamp,
            signal_power: node.signal_power,
            total_power: node.total_power,
            tx_power: node.tx_power,
            tx_time: node.tx_time,
            rx_time: node.rx_time,
            cell_id: node.cell_id,
            ecl: node.ecl,
            snr: node.snr,
            earfcn: node.earfcn,
            pci: node.pci,
            rsrq: node.rsrq,
            msg_id: node.msg_id,
            ip: node.ip,
            latency: node.latency
        })));
}

export function fetchOneNodeAverage(node: SensorNode): Promise<NodeInformation[]> {
    return fetch(`${apiServer}/nodes/${node.id}?interval=all`, fetchNodeInformationOptions)
        .then(rejectFetchFailures)
        .then(response => response.json())
        .then(({ information }) => information.map(node => ({
            timestamp: node.timestamp,
            latency: node.latency,
            msg_id: node.msg_id,
            coverage: node.coverage,
            ecl: node.ecl,
            tx_pwr: node.tx_pwr,
            rx_time: node.rx_time,
            tx_time: node.tx_time,
            /*uptime: (node.last_msg_id == undefined && node.data_points == 1) ? 100 : ( ( (node.last_msg_id - node.first_msg_id) + 1) / node.data_points ) * 100,
            avg_latency: node.avg_latency,
            min_latency: node.min_latency,
            max_latency: node.max_latency,
            avg_coverage: node.avg_coverage,
            min_coverage: node.min_coverage,
            max_coverage: node.max_coverage,
            avg_power_usage: node.avg_power_usage,
            min_power_usage: node.min_power_usage,
            max_power_usage: node.max_power_usage,*/
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

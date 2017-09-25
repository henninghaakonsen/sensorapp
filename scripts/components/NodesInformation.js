// @flow

import React from 'react'
import { connectClass } from '../connect'
import type { Node, NodeInformation } from '../types'

import { colors } from '../styles'
import {Tabs, Tab} from 'material-ui/Tabs';
import {
  Table,
  TableBody,
  TableHeader,
  TableHeaderColumn,
  TableRow,
  TableRowColumn,
} from 'material-ui/Table';

import {Line} from 'react-chartjs-2';

class NodesInformation extends React.Component {
  props: {
    nodes: Node[],
  };

  state: {
  }

  constructor(props: any) {
    super(props)
    this.state = {
    }
  }

  calculateAverage(): [] {
    let newDict = []
    this.props.nodes.map(node => {
      node.nodeInfo.map(nodeInfo => {
        let elem = newDict[nodeInfo.timestamp]
        if(elem == null) {
          elem = [nodeInfo.timestamp, nodeInfo.latency, nodeInfo.coverage]
        } else {
          elem[1] = (elem[1] + nodeInfo.latency) / 2
          if(nodeInfo.type == "coverage") {
            if(elem[2] == 0) elem[2] = nodeInfo.coverage
            else elem[2] = (elem[2] + nodeInfo.coverage) / 2
          }
        }
        newDict[nodeInfo.timestamp] = elem
      })
    })
    return newDict
  }

  render() {
    let latencyPoints = []
    let latencyLabels = []

    let coveragePoints = []
    let coverageLabels = []
    let dict = this.calculateAverage()

    let latencyIndex = 0
    let coverageIndex = 0
    for (var key in dict) {
      latencyLabels[latencyIndex] = latencyIndex
      latencyPoints[latencyIndex++] = dict[key][1]

      if(dict[key][2] != 0) {
        coverageLabels[coverageIndex] = coverageIndex
        coveragePoints[coverageIndex++] = dict[key][2]
      }
    }
    const latencyData = {
      labels: latencyLabels,
      datasets: [
        {
          label: 'Latency',
          type: 'line',
          fill: false,
          lineTension: 0.1,
          backgroundColor: 'rgba(75,192,192,0.4)',
          borderColor: 'rgba(75,192,192,1)',
          borderCapStyle: 'butt',
          borderDash: [],
          borderDashOffset: 0.0,
          borderJoinStyle: 'miter',
          pointBorderColor: 'rgba(75,192,192,1)',
          pointBackgroundColor: '#fff',
          pointBorderWidth: 1,
          pointHoverRadius: 5,
          pointHoverBackgroundColor: 'rgba(75,192,192,1)',
          pointHoverBorderColor: 'rgba(220,220,220,1)',
          pointHoverBorderWidth: 2,
          pointRadius: 1,
          pointHitRadius: 10,
          data: latencyPoints,
        },
      ],
    };

    const coverageData = {
      labels: coverageLabels,
      datasets: [
        {
          label: 'Coverage',
          type: 'line',
          fill: false,
          lineTension: 0.1,
          backgroundColor: 'rgba(75,192,192,0.4)',
          borderColor: 'rgba(75,192,192,1)',
          borderCapStyle: 'butt',
          borderDash: [],
          borderDashOffset: 0.0,
          borderJoinStyle: 'miter',
          pointBorderColor: 'rgba(75,192,192,1)',
          pointBackgroundColor: '#fff',
          pointBorderWidth: 1,
          pointHoverRadius: 5,
          pointHoverBackgroundColor: 'rgba(75,192,192,1)',
          pointHoverBorderColor: 'rgba(220,220,220,1)',
          pointHoverBorderWidth: 2,
          pointRadius: 1,
          pointHitRadius: 10,
          data: coveragePoints,
        },
      ],
    };

    return (
      !this.props.selectedNode &&
      <Tabs style={{height: '100vh', width: '80vw', overflowY: 'scroll'}}>
        <Tab label="GRAPH OVERVIEW" style={{height: 50, backgroundColor: colors.accentLight}}>
          <Line data={latencyData} width={35} height={10}
              options={{maintainAspectRatio: true}}/>
          <Line data={coverageData} width={35} height={10}
              options={{maintainAspectRatio: true}}/>
        </Tab>
      </Tabs>
    )
  }
}

const Connected = connectClass(
  (state: AppState) => ({
    nodes: state.navigation.nodes,
    selectedNode: state.navigation.selectedNode,
  }), (dispatch: (action: Action) => void) => ({
  }), NodesInformation
)

export default Connected

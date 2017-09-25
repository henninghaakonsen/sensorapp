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
      let latencyIndex = 0
      let coverageIndex = 0
      let dateIndex = new Date()
      var coeff = 1000 * 60 * 10
      
      let latencyAvg = 0
      let latencyAvgCount = 0
  
      let coverageAvg = 0
      let coverageAvgCount = 0
      node.nodeInfo.map(nodeInformation => {
        if(latencyIndex == 0) {
          dateIndex = new Date((Math.round(new Date(nodeInformation.timestamp).getTime() / coeff) * coeff) - coeff)
        }
        let currentDate = new Date(nodeInformation.timestamp)
        
        if (Math.round(currentDate) - Math.round(dateIndex) > coeff) {
          let elem = newDict[dateIndex]

          let latency = 0
          let coverage = 0
          if(elem == null) {
            latency = latencyAvg / latencyAvgCount
            coverage = coverageAvg / coverageAvgCount
          } else {
            latency = (elem[1] + (latencyAvg / latencyAvgCount)) / 2
            coverage = (elem[2] + (coverageAvg / coverageAvgCount)) / 2
          }
          if(coverageAvg == 0) coverage = 0
          elem = [dateIndex, latency, coverage]

          newDict[dateIndex] = elem
        }
  
        latencyAvg += nodeInformation.latency
        latencyAvgCount++
  
        if(nodeInformation.type == 'coverage') {
          coverageAvg += nodeInformation.coverage
          coverageAvgCount++
        }
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

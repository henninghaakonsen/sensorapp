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
import Dialog from 'material-ui/Dialog';
import FlatButton from 'material-ui/FlatButton';
import RaisedButton from 'material-ui/RaisedButton';
import DatePicker from 'material-ui/DatePicker';
import SelectField from 'material-ui/SelectField';
import MenuItem from 'material-ui/MenuItem';
import TextField from 'material-ui/TextField';

var dateFormat = require('dateformat');

import {Line} from 'react-chartjs-2';

class NodeInfoComponent extends React.Component {
  props: {
    fetchingNodes: Boolean,
    nodes: Node[],
    selectedNode: Node,
    selectedNodeInfo: NodeInformation,
    fromDate: Date,
    toDate: Date,
    limit: Number,
    fetchNodes: (fromDate: Date, toDate: Date, limit: Number) => void,
    fetchNode: (node: Node, fromDate: Date, toDate: Date, limit: Number) => void,
    setTimeSpan: (fromDate: Date, toDate: Date) => void,
    setLimit: (limit: Number) => void,
  };

  constructor(props: any) {
    super(props)

    this.state = {
        open: false,
        coeff: 5,
        autoOk: false,
        disableYearSelection: true,
        shouldGraphChange: false,
    };
  }

  componentWillReceiveProps(nextProps) {
      console.log(nextProps, this.props)
      if (nextProps.fromDate != this.props.fromDate || nextProps.toDate != this.props.toDate || nextProps.limit != this.props.limit) {
          this.props.setTimeSpan(nextProps.fromDate, nextProps.toDate)
          this.setState({shouldGraphChange: true});
      } 
  }

  handleOpen = () => {
        this.setState({open: true});
  };

  handleClose = () => {
        if (this.state.shouldGraphChange) {
            !this.props.selectedNode && this.props.fetchNodes(this.props.fromDate, this.props.toDate, this.props.limit)
            this.props.selectedNode && this.props.fetchNode(this.props.selectedNode, this.props.fromDate, this.props.toDate, this.props.limit)
        }

        this.setState({open: false, shouldGraphChange: false});
  };

  handleChange = (event, index, coeff) => this.setState({coeff});

  handleLimitChange = (event) => {
      this.props.setLimit(event.target.value)
  };

  handleChangefromDate = (event, date) => {
    this.props.setTimeSpan(date, this.props.toDate);
  };

  handleChangetoDate = (event, date) => {
    this.props.setTimeSpan(this.props.fromDate, date);
  };

  refreshGraph = () => {
    this.props.setTimeSpan(this.props.fromDate, new Date())

    !this.props.selectedNode && this.props.fetchNodes(this.props.fromDate, this.props.toDate, this.props.limit)
    this.props.selectedNode && this.props.fetchNode(this.props.selectedNode, this.props.fromDate, this.props.toDate, this.props.limit)
  }

  handleNodeInfo(nodeInfo: NodeInformation, average: Boolean, newDict: []): [] {
    let dateIndex = new Date()
    var coeff = 1000 * 60 * this.state.coeff
      
    let latencyIndex = 0
    let coverageIndex = 0

    let latencyAvg = 0
    let latencyAvgCount = 0
  
    let coverageAvg = 0
    let coverageAvgCount = 0
    let nodeInfoLength = nodeInfo.length;
    let setDateIndex = true
    
    nodeInfo.map((nodeInformation, i) => {
      if(setDateIndex) {
        dateIndex = new Date((Math.round(new Date(nodeInformation.timestamp).getTime() / coeff ) * coeff))
        setDateIndex = false
      }
      let currentDate = new Date(nodeInformation.timestamp)

      latencyAvg += nodeInformation.latency
      latencyAvgCount++

      if(nodeInformation.type == 'coverage') {
        coverageAvg += nodeInformation.coverage
        coverageAvgCount++
      }
      
      if (Math.round(currentDate) - Math.round(dateIndex) > coeff || i == nodeInfoLength - 1 || this.state.coeff == -1) {
        let latency = 0
        let coverage = 0
        let elem = newDict[dateIndex]
        
        if(!average || elem == null) {
            latency = latencyAvg / latencyAvgCount
            coverage = coverageAvg / coverageAvgCount
        } else {
            latency = (elem[1] + (latencyAvg / latencyAvgCount)) / 2
            coverage = (elem[2] + (coverageAvg / coverageAvgCount)) / 2
        }

        if( !average && this.state.coeff == -1 ) {
            dateIndex = new Date(nodeInformation.timestamp);
            latency = nodeInformation.latency
            coverage = nodeInformation.coverage
        } 
        
        let displayDate = dateFormat(dateIndex, "dd/mm/yy HH:MM");
        newDict[dateIndex] = [displayDate, latency, coverage]

        latencyAvg = 0
        coverageAvg = 0
        latencyAvgCount = 0
        coverageAvgCount = 0
        setDateIndex = true
      }
    })

    return newDict
  }

  makeDict(nodeInfo: NodeInformation): [] {
      return this.handleNodeInfo(nodeInfo, false, [])
  }

  makeAverageDict(): [] {
    let newDict = []
    
    this.props.nodes.map(node => {
        this.handleNodeInfo(node.nodeInfo, true, newDict);
    })

    return newDict
  }

  render() {
    let latencyPoints = []
    let latencyLabels = []

    let coveragePoints = []
    let coverageLabels = []

    let dict = null
    if( this.props.selectedNodeInfo ) {
        dict = this.makeDict(this.props.selectedNodeInfo)
    } else {
        dict = this.makeAverageDict()
    }

    let latencyIndex = 0
    let coverageIndex = 0
    for (var key in dict) {
      latencyLabels[latencyIndex] = dict[key][0]
      latencyPoints[latencyIndex++] = dict[key][1]

      if (dict[key][2] != 0) {
        coverageLabels[coverageIndex] = dict[key][0]
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
          backgroundColor: colors.accentLighter, 
          borderColor: colors.accentLight, 
          borderCapStyle: 'butt',
          borderDash: [],
          borderDashOffset: 0.5,
          borderJoinStyle: 'miter',
          pointBorderColor: colors.accentLighter,
          pointBackgroundColor: '#fff',
          pointBorderWidth: 1,
          pointHoverRadius: 4,
          pointHoverBackgroundColor: colors.accentLighter,
          pointHoverBorderColor: colors.accentLight,
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
          backgroundColor: colors.accentLighter, 
          borderColor: colors.accentLight, 
          borderCapStyle: 'butt',
          borderDash: [],
          borderDashOffset: 0.5,
          borderJoinStyle: 'miter',
          pointBorderColor: colors.accentLighter,
          pointBackgroundColor: '#fff',
          pointBorderWidth: 1,
          pointHoverRadius: 4,
          pointHoverBackgroundColor: colors.accentLighter,
          pointHoverBorderColor: colors.accentLight,
          pointHoverBorderWidth: 2,
          pointRadius: 1,
          pointHitRadius: 10,
          data: coveragePoints,
        },
      ],
    };

    const actions = [
        <FlatButton
          label="SAVE"
          primary={true}
          keyboardFocused={true}
          onClick={this.handleClose}
        />,
      ];
    return (
        <Tabs style={{height: '100vh', width: '80vw', overflowY: 'scroll'}}>
            <Tab label="GRAPH OVERVIEW" style={{height: 50, backgroundColor: colors.accentLight}}>
                <div style={{
                        display: 'flex',
                        flexDirection: 'row',
                        flexWrap: 'wrap',
                        justifyContent: 'flex-start',
                        width: '100%',
                    }}>
                    <RaisedButton label="Edit" onClick={this.handleOpen} />
                    <RaisedButton label="Refresh" onClick={this.refreshGraph} />
                </div>

                <div style={{
                    display: 'flex',
                    flexDirection: 'column',
                    justifyContent: 'space-around',
                    height: '100%',
                    width: '96%',
                    paddingLeft: '2%',
                }}>
                    <Line data={latencyData} width={35} height={10}
                        options={{maintainAspectRatio: true}}/>
                    <Line data={coverageData} width={35} height={10}
                        options={{maintainAspectRatio: true}}/>
                </div>
                
                
                <Dialog
                    title="Configure graphs"
                    actions={actions}
                    modal={false}
                    open={this.state.open}
                    onRequestClose={this.handleClose}
                >
                <div style={{
                    display: 'flex',
                    flexDirection: 'row',
                    flexWrap: 'wrap',
                    justifyContent: 'space-evenly',
                    height: '100%',
                }}>
                    <DatePicker 
                        onChange={this.handleChangefromDate}
                        floatingLabelText="From"
                        autoOk={this.state.autoOk}
                        defaultDate={this.props.fromDate}
                        disableYearSelection={this.state.disableYearSelection} 
                        />
                    <DatePicker 
                        onChange={this.handleChangetoDate}
                        floatingLabelText="To"
                        autoOk={this.state.autoOk}
                        defaultDate={this.props.toDate}
                        disableYearSelection={this.state.disableYearSelection} 
                        />
                    <SelectField
                    floatingLabelText="Frequency"
                    value={this.state.coeff}
                    onChange={this.handleChange}
                    >
                    {this.props.selectedNode && <MenuItem value={-1} primaryText="Everything" />}
                    <MenuItem value={5} primaryText="5 min" />
                    <MenuItem value={10} primaryText="10 min" />
                    <MenuItem value={30} primaryText="30 min" />
                    <MenuItem value={60} primaryText="Hourly" />
                    </SelectField>
                    <TextField
                        id="Limit"
                        floatingLabelText="Limit"
                        value={this.props.limit}
                        onChange={this.handleLimitChange}
                    />
                </div>
                </Dialog>
            </Tab>
        </Tabs> 
    )
  }
}

const Connected = connectClass(
  (state: AppState) => ({
    fetchingNodes: state.navigation.fetchingNodes,
    nodes: state.navigation.nodes,
    selectedNode: state.navigation.selectedNode,
    selectedNodeInfo: state.navigation.selectedNode && state.navigation.selectedNode.nodeInfo,
    fromDate: state.navigation.fromDate,
    toDate: state.navigation.toDate,
    limit: state.navigation.limit,
  }), (dispatch: (action: Action) => void) => ({
    setTimeSpan: ( fromDate: date, toDate: Date) => dispatch({ type: 'SET_TIMESPAN', fromDate, toDate }),
    setLimit: ( limit: Number ) => dispatch({ type: 'SET_LIMIT', limit }),
    fetchNodes: ( fromDate: date, toDate: Date, limit:Number ) => dispatch({ type: 'NODES_FETCH_REQUESTED', fromDate, toDate, limit }),
    fetchNode: ( node: Node, fromDate: date, toDate: Date, limit: Number ) => dispatch({ type: 'NODE_FETCH_REQUESTED', node, fromDate, toDate, limit }),
  }), NodeInfoComponent
)

export default Connected

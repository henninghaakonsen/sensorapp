// @flow

import React from 'react'
import { connectClass } from '../connect'
import type { SensorNode, NodeInformation } from '../types'
import Welcome from './Welcome'

import { colors } from '../styles'
import { Tabs, Tab } from 'material-ui/Tabs';

import Dialog from 'material-ui/Dialog';
import FlatButton from 'material-ui/FlatButton';
import RaisedButton from 'material-ui/RaisedButton';
import DatePicker from 'material-ui/DatePicker';
import SelectField from 'material-ui/SelectField';
import TextField from 'material-ui/TextField';
import MenuItem from 'material-ui/MenuItem';

import TimePicker from 'material-ui/TimePicker';

import ReactTable from "react-table";
import "react-table/react-table.css";

import createPlotlyComponent from 'react-plotlyjs';
import Plotly from 'plotly.js/dist/plotly-basic.js';
const PlotlyComponent = createPlotlyComponent(Plotly);

const moment = require('moment');
var _ = require('lodash');

class NodeInfoComponent extends React.Component {
    props: {
        fetchingNodes: Boolean,
        nodes: SensorNode[],
        selectedNode: SensorNode,
        interval: Number,
        generateAverages: (id: String) => void,
    };

    constructor(props: any) {
        super(props)

        this.state = {
            open: false,
            autoOk: false,
            fetchGraphData: false,
            fromDate: undefined,
            toDate: undefined,
        };
    };

    componentWillReceiveProps(nextProps) {
        if (nextProps.interval != this.props.interval) {
            this.setState({ fetchGraphData: true });
        }
    }

    generateAverages = ( selectedNode ) => {
        this.props.generateAverages( selectedNode.id )
    }

    handleSelectedNodeInfo = (nodeInfo: NodeInformation[]) => {
        let dict = {}
        for (let i = 0; i < nodeInfo.length; i++) {
            let key = nodeInfo[i].timestamp
            dict[key] = []

            dict[key].latency = nodeInfo[i].latency
            dict[key].msg_id = nodeInfo[i].msg_id
            dict[key].coverage = nodeInfo[i].coverage
            dict[key].ecl = nodeInfo[i].ecl
            dict[key].tx_pwr = nodeInfo[i].tx_pwr
            dict[key].rx_time = nodeInfo[i].rx_time
            dict[key].tx_time = nodeInfo[i].tx_time

            /*dict[key].avg_latency = nodeInfo[i].avg_latency
            dict[key].min_latency = nodeInfo[i].min_latency
            dict[key].max_latency = nodeInfo[i].max_latency
            dict[key].avg_coverage = nodeInfo[i].avg_coverage 
            dict[key].min_coverage = nodeInfo[i].min_coverage
            dict[key].max_coverage = nodeInfo[i].max_coverage
            dict[key].avg_power_usage = nodeInfo[i].avg_power_usage
            dict[key].min_power_usage = nodeInfo[i].min_power_usage 
            dict[key].max_power_usage = nodeInfo[i].max_power_usage */
        }

        return dict
    }

    plotlyRelayout = (event) => {
        let id = ""
        if ( event['xaxis2.range[0]'] != undefined ) {
            id = "2"
        } else if ( event['xaxis3.range[0]'] != undefined ) {
            id = "3"
        } if ( event['xaxis4.range[0]'] != undefined ) {
            id = "4"
        }
        this.setState({
            fromDate: new Date(event['xaxis' + id + '.range[0]']),
            toDate: new Date(event['xaxis' + id + '.range[1]'])
        })
    }

    getLayout = (title, yaxisFrom, yaxisTo) => {
        return {
            title: title,
            height: 600,
            xaxis: {
                range: this.state.fromDate != undefined ? [this.state.fromDate.getTime(), this.state.toDate.getTime()] : [],
                type: 'date'
            },
            yaxis: {
                range: yaxisFrom != 0 ? [yaxisFrom, yaxisTo] : null,
                type: 'linear',
            }
        }
    }

    getData = (name, labels, points, id, shape) => {
        return {
            type: "scatter",
            mode: "lines",
            name: name,
            x: labels,
            y: points,
            connectNullData: false,
            line: {
                shape: shape,
                //color: colors.accentLighter,
                width: 2
            },
            xaxis: id != 0 ? 'x' + id : null,
            yaxis: id != 0 ? 'y' + id : null,
        }
    }

    setRange(props) {
        const selectedNode = _.find(props.nodes, {id: props.selectedNode})
        if (selectedNode) {
            const nodeDetails = selectedNode.nodeDetails
            const fromDate = new Date(nodeDetails[nodeDetails.length -1 ].timestamp)
            fromDate.setDate(fromDate.getDate() - 1)
            const toDate = new Date(nodeDetails[nodeDetails.length -1 ].timestamp)
            
            this.setState({
                fromDate: fromDate,
                toDate: toDate,
            })
        }
    }

    componentWillReceiveProps(nextProps) {
        this.setRange(nextProps)
    }

    componentDidMount() {
        this.setRange(this.props)
    }

    render() {
        let dict = {}
        let displayData = []

        const selectedNode = _.find(this.props.nodes, {id: this.props.selectedNode})
        if (selectedNode && this.state.fromDate != undefined) {
            dict = this.handleSelectedNodeInfo(selectedNode.nodeInfo)

            if (selectedNode.nodeDetails) {
                selectedNode.nodeDetails.forEach(element => {
                    displayData.push({ 
                        "timestamp": moment(element.timestamp).format(),
                        "latency": element.latency,                        
                        "signal_power": element.signal_power,
                        "total_power": element.total_power,
                        "tx_power": element.tx_power,
                        "tx_time": element.tx_time,
                        "rx_time": element.rx_time,
                        "cell_id": element.cell_id,
                        "ecl": element.ecl,
                        "snr": element.snr,
                        "earfcn": element.earfcn,
                        "pci": element.pci,
                        "msg_id": element.msg_id,
                        "ip": element.ip,
                    })
                });
            }
        } else{
            return <div/>
        } 

        let latencyPoints = []
        let latencyLabels = []

        let coveragePoints = []
        let coverageLabels = []

        let eclLabels = []
        let eclPoints = []
        let rxLabels = []
        let rxPoints = []
        let txLabels = []
        let txPoints = []
        let txPwrPoints = []
        let txPwrLabels = []

        let index = 0
        for (var key in dict) {
            let time = moment(key).format()

            let latency = dict[key].latency
            let coverage = dict[key].coverage
            let ecl = dict[key].ecl
            let rx = dict[key].rx_time
            let tx = dict[key].tx_time
            let tx_pwr = dict[key].tx_pwr

            latencyLabels[index] = time
            latencyPoints[index] = latency > -1 ? latency : null

            coverageLabels[index] = time
            coveragePoints[index] = coverage < -1 ? coverage : null

            eclLabels[index] = time
            eclPoints[index] = ecl >= 0 ? ecl : null

            rxLabels[index] = time
            rxPoints[index] = rx >= 0 ? rx / 1000 : null

            txLabels[index] = time
            txPoints[index] = tx >= 0 ? tx / 1000 : null

            txPwrLabels[index] = time
            txPwrPoints[index] = tx_pwr > -400 ? tx_pwr : null

            index += 1
        };

        const tx_power = this.getData('Transmit power', txPwrLabels, txPwrPoints, 1, 'hv')
        const ecl = this.getData('ECL level', eclLabels, eclPoints, 2, 'hv')
        const tx_time = this.getData('Transmit time', txLabels, txPoints, 3, 'spline')
        const rx_time = this.getData('Receive time', rxLabels, rxPoints, 4, 'spline')
        
        let latency = {
            type: "scatter",
            mode: "lines",
            name: "Latency",
            x: latencyLabels,
            y: latencyPoints,
            mode: "date",
            connectNullData: false,
            line: {
                shape: 'spline',
                //color: colors.accentLighter,
                width: 2
            }
        };
        let coverage = {
            type: "scatter",
            mode: "lines",
            name: "Signal power",
            x: coverageLabels,
            y: coveragePoints,
            mode: "date",
            connectNullData: false,
            yaxis: "y2",
            line: {
                shape: 'spline',
                //color: colors.accentLighter,
                width: 2
            }
        };

        const powerLayout = this.getLayout('POWER USAGE', 0, 0)
        const latencyAndCoverageLayout = {
            title: "LATENCY & SIGNAL POWER",
            height: 600,
            xaxis: {
                range: [this.state.fromDate.getTime(), this.state.toDate.getTime()],
            },
            yaxis: {
                title: "Latency (s)",
                range: [-2, 20]
            },
            yaxis2: {
                title: 'Signal power (dBm)',
                range: [-30, -131],
                anchor: 'free',
                side: 'right',
                overlaying: "y",
                position: 1
            },
        };

        const config = {
            showLink: false,
            displayModeBar: true,
            displaylogo: false
        };

        const actions = [
            <FlatButton
                label="SAVE"
                primary={true}
                keyboardFocused={true}
                onClick={this.handleClose}
            />,
        ];

        const selectorFieldStyles = {
            customWidth: {
                width: 150,
            },
        };
       
        var layout = {
            height: 1200,
            xaxis: {
                type: 'date',
                domain: [0, 0.45],
                range: [this.state.fromDate.getTime(), this.state.toDate.getTime()],               
            },
            yaxis: {
                title: 'dBm',                
                type: 'linear',
                domain: [0, 0.45], 
            },
            xaxis2: {
                type: 'date',
                domain: [0.55, 1],
                range: [this.state.fromDate.getTime(), this.state.toDate.getTime()],               
            },
            yaxis2: {
                title: 'ECL level',                
                anchor: 'x2',
                type: 'linear',
                domain: [0, 0.45],
                range: [0, 3],
            },
            xaxis3: {
                type: 'date',
                domain: [0, 0.45],
                range: [this.state.fromDate.getTime(), this.state.toDate.getTime()],   
                anchor: 'y3'            
            },
            yaxis3: {
                title: 'Seconds',                
                type: 'linear',
                domain: [0.55, 1],
                range: [0, 10],
            },
            xaxis4: {
                type: 'date',
                domain: [0.55, 1],
                range: [this.state.fromDate.getTime(), this.state.toDate.getTime()], 
                anchor: 'y4'   
            },
            yaxis4: {
                title: 'Seconds',                
                anchor: 'x4',
                type: 'linear',
                domain: [0.55, 1],
                range: [0, 30],
            },
        };

        return (
            <div>
                <Tabs style={{ height: '100vh', width: '85vw', overflowY: 'scroll' }}>
                    <Tab label="GRAPH OVERVIEW" style={{ height: 50, backgroundColor: colors.accentLight }}>
                    <div style={{
                        display: 'flex',
                        flexDirection: 'row',
                        flexWrap: 'wrap',
                        justifyContent: 'flex-start',
                        width: '100%',
                    }}>
                        <RaisedButton label={ "Generate average [" + selectedNode.displayName + "]" } onClick={ () => this.generateAverages(selectedNode)} />
                    </div>

                    <div style={{
                        display: 'flex',
                        flexDirection: 'column',
                        justifyContent: 'space-around',
                        height: '100%',
                        width: '98%',
                        paddingLeft: '1%',
                        paddingTop: '1%',
                    }}>
                        <PlotlyComponent className="latencyAndCoverage" data={[latency, coverage]} layout={latencyAndCoverageLayout} config={config} onRelayout={this.plotlyRelayout} />
                        <PlotlyComponent className="test" data={[tx_power, ecl, tx_time, rx_time]} layout={layout} config={config} onRelayout={this.plotlyRelayout}/>
                    </div>
                </Tab> }
                <Tab label="RAW DATA" style={{ height: 50, backgroundColor: colors.accentLight }}>
                    <div>
                    <ReactTable
                        data={displayData}
                        columns={[
                            {
                                Header: "Timestamp",
                                accessor: "timestamp"
                            },
                            {
                                Header: "Latency",
                                accessor: "latency"
                            },
                            {
                                Header: 'IP',
                                accessor: "ip"
                            },
                            {
                                Header: 'MSG ID',
                                accessor: "msg_id"
                            },
                            {
                                Header: "Signal power",
                                accessor: "signal_power"
                            },
                            {
                                Header: 'Total power',
                                accessor: "total_power"
                            },
                            {
                                Header: 'TX power',
                                accessor: "tx_power"
                            },
                            {
                                Header: 'TX time',
                                accessor: "tx_time"
                            },
                            {
                                Header: 'RX time',
                                accessor: "rx_time"
                            },
                            {
                                Header: 'Cell ID',
                                accessor: "cell_id"
                            },
                            {
                                Header: 'ECL',
                                accessor: "ecl"
                            },
                            {
                                Header: 'SNR',
                                accessor: "snr"
                            },
                            {
                                Header: 'EARFCN',
                                accessor: "earfcn"
                            },
                            {
                                Header: 'PCI',
                                accessor: "pci"
                            },
                        ]}
                        defaultPageSize={25}
                        showPaginationTop
                        not showPaginationBottom
                        className="-striped -highlight"/>
                    </div>
                    </Tab> }
                </Tabs>
            </div>
        )
    }
}

const Connected = connectClass(
    (state: AppState) => ({
        fetchingNodes: state.navigation.fetchingNodes,
        nodes: state.navigation.nodes,
        selectedNode: state.navigation.selectedNode,
    }), (dispatch: (action: Action) => void) => ({
        generateAverages: (id: String) => dispatch({ type: 'GENERATE_AVERAGES', id }),
    }), NodeInfoComponent
)

export default Connected

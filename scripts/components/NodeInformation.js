// @flow

import React from 'react'
import { connectClass } from '../connect'
import type { Node, NodeInformation } from '../types'
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

class NodeInfoComponent extends React.Component {
    props: {
        fetchingNodes: Boolean,
        nodes: Node[],
        selectedNode: Node,
        selectedNodeInfo: NodeInformation,
        fromDate: Date,
        toDate: Date,
        interval: Number,
        fetchNodes: (fromDate: Date, toDate: Date, interval: Number) => void,
        fetchNode: (node: Node, fromDate: Date, toDate: Date, interval: Number) => void,
        fetchNodeDetails: (node: Node, fromDate: Date, toDate: Date, interval: Number) => void,
        setTimeSpan: (fromDate: Date, toDate: Date) => void,
        setInterval: (interval: Number) => void,
        setMode: (mode: String) => void,
        generateAverages: (id: String) => void,
    };

    constructor(props: any) {
        super(props)

        this.state = {
            open: false,
            autoOk: false,
            disableYearSelection: true,
            fetchGraphData: false,
        };
    };

    componentWillReceiveProps(nextProps) {
        if (nextProps.interval != this.props.interval) {
            this.setState({ fetchGraphData: true });
        }

        if (nextProps.fetchingNodes == false && this.props.fetchingNodes == true) {
            var coeff = 1000 * 60 * this.props.interval
            let lengths = nextProps.nodes.map(node => {
                return node.nodeInfo.length
            })

            let latestDate = 0
            lengths.map((length, i) => {
                if ( length != 0 ) {
                    let timestamp = new Date(nextProps.nodes[i].nodeInfo[length - 1]['timestamp'])
                    if (latestDate == 0) {
                        latestDate = timestamp
                    } else if (timestamp.getTime() > latestDate.getTime()) {
                        latestDate = timestamp
                    }
                }
            })

            const toDate = new Date(new Date(latestDate).getTime())
            const fromDate = new Date(new Date(latestDate).getTime())
            fromDate.setDate(fromDate.getDate() - 1)

            this.props.setTimeSpan(fromDate, toDate)
        }
    }

    handleOpen = () => this.setState({ open: true })

    handleClose = () => {
        if (this.state.fetchGraphData) {
            !this.props.selectedNode && this.props.fetchNodes(this.props.fromDate, this.props.toDate, this.props.interval)
            this.props.selectedNode && this.props.fetchNode(this.props.selectedNode, this.props.fromDate, this.props.toDate, this.props.interval)
        }

        this.setState({ open: false, fetchGraphData: false });
    }

    handleChange = (event, index, interval) => {
        var coeff = 1000 * 60 * interval
        const fromDate = new Date((Math.round(this.props.fromDate.getTime() / coeff) * coeff))
        const toDate = new Date((Math.round(this.props.toDate.getTime() / coeff) * coeff))
        this.props.setTimeSpan(fromDate, toDate)

        this.props.setInterval(interval);
    }

    handleModeChange = (event, index, mode) => {
        this.props.setMode(mode);
    }

    handleChangefromDate = (event, date) => {
        this.props.setTimeSpan(date, this.props.toDate);
    };

    handleChangetoDate = (event, date) => {
        this.props.setTimeSpan(this.props.fromDate, date);
    };

    refreshGraph = () => {
        var coeff = 1000 * 60 * this.props.interval
        const toDate = new Date((Math.round(new Date().getTime() / coeff) * coeff) - coeff)
        this.props.setTimeSpan(this.props.fromDate, toDate);

        this.props.fetchNodes(this.props.fromDate, this.props.toDate, this.props.interval)
    }

    generateAverages = () => {
        this.props.generateAverages(this.props.selectedNode ? this.props.selectedNode.id : null)
    }

    handleFromHourMinuteChange = (event, date) => {
        this.props.setTimeSpan(date, this.props.toDate)
    };

    handleToHourMinuteChange = (event, date) => {
        this.props.setTimeSpan(this.props.fromDate, date)
    };

    makeAverageDict(): {} {
        let newDict = {}

        for (let i = 0; i < this.props.nodes.length; i++) {
            for (let j = 0; j < Object.keys(this.props.nodes[i].nodeInfo).length; j++) {
                let key = this.props.nodes[i].nodeInfo[j].timestamp
                let elem = newDict[key]

                if (elem == undefined) {
                    elem = []
                    elem.latencyCount = 1
                    elem.coverageCount = this.props.nodes[i].nodeInfo[j].coverage != 0 ? 1 : 0

                    elem.timestamp = this.props.nodes[i].nodeInfo[j].timestamp
                    elem.latency = this.props.nodes[i].nodeInfo[j].latency
                    elem.coverage = this.props.nodes[i].nodeInfo[j].coverage
                    elem.dataPoints = this.props.nodes[i].nodeInfo[j].latencyDataPoints
                } else {
                    elem.latencyCount = this.props.nodes[i].nodeInfo[j].latency != 0 ? elem.latencyCount + 1 : elem.latencyCount
                    elem.coverageCount = this.props.nodes[i].nodeInfo[j].coverage != 0 ? elem.coverageCount + 1 : elem.coverageCount

                    elem.latency = this.props.nodes[i].nodeInfo[j].latency != 0 ? this.props.nodes[i].nodeInfo[j].latency + elem.latency : elem.latency
                    elem.coverage = this.props.nodes[i].nodeInfo[j].coverage != 0 ? this.props.nodes[i].nodeInfo[j].coverage + elem.coverage : elem.coverage
                    elem.dataPoints = this.props.nodes[i].nodeInfo[j].latencyDataPoints + elem.dataPoints
                }
                newDict[key] = elem
            }
        }

        for (var key in newDict) {
            let elem = newDict[key]
            elem.latency = elem.latency / elem.latencyCount
            elem.coverage = elem.coverage / elem.coverageCount
            elem.dataPoints = elem.dataPoints / this.props.nodes.length
            newDict[key] = elem
        }

        return newDict
    }

    handleSelectedNodeInfo(nodeInfo: NodeInformation[]): {} {
        let dict = {}
        for (let i = 0; i < nodeInfo.length; i++) {
            let key = nodeInfo[i].timestamp
            dict[key] = []
            dict[key].uptime = nodeInfo[i].uptime

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
        this.props.setTimeSpan(new Date(event['xaxis' + id + '.range[0]']), new Date(event['xaxis' + id + '.range[1]']))
    }

    getLayout = (title, yaxisFrom, yaxisTo) => {
        return {
            title: title,
            height: 600,
            xaxis: {
                range: [this.props.fromDate.getTime(), this.props.toDate.getTime()],
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

    render() {
        let dict = {}
        let displayData = [] 
        if (this.props.selectedNode) {
            dict = this.handleSelectedNodeInfo(this.props.selectedNodeInfo)

            if (this.props.selectedNode.nodeDetails) {
                this.props.selectedNode.nodeDetails.forEach(element => {
                    displayData.push( { 
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
        } else if (this.props.nodes.length != 0) {
            //dict = this.makeAverageDict()
        }

        let latencyPoints = []
        let latencyLabels = []

        let coveragePoints = []
        let coverageLabels = []

        let uptimePoints = []
        let uptimeLabels = []

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
            latencyPoints[index] = latency > 0 ? latency : null

            coverageLabels[index] = time
            coveragePoints[index] = coverage < -1 ? coverage : null

            eclLabels[index] = time
            eclPoints[index] = ecl >= 0 ? ecl : null

            rxLabels[index] = time
            rxPoints[index] = rx >= 0 ? rx : null

            txLabels[index] = time
            txPoints[index] = tx >= 0 ? tx : null

            txPwrLabels[index] = time
            txPwrPoints[index] = tx_pwr > 0 ? tx_pwr : null

            index += 1
        }

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
        }
        let coverage = {
            type: "scatter",
            mode: "lines",
            name: "Coverage",
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
        }
        const uptimeLayout = this.getLayout('UPTIME', -5, 105)
        const powerLayout = this.getLayout('POWER USAGE', 0, 0)
        const latencyAndCoverageLayout = {
            title: "LATENCY & COVERAGE",
            height: 600,
            xaxis: {
                range: [this.props.fromDate.getTime(), this.props.toDate.getTime()],
            },
            yaxis: {
                title: "Latency",
                range: [-0.5, 20]
            },
            yaxis2: {
                title: 'Coverage',
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
                range: [this.props.fromDate.getTime(), this.props.toDate.getTime()],               
            },
            yaxis: {
                title: 'dBm',                
                type: 'linear',
                domain: [0, 0.45], 
            },
            xaxis2: {
                type: 'date',
                domain: [0.55, 1],
                range: [this.props.fromDate.getTime(), this.props.toDate.getTime()],               
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
                range: [this.props.fromDate.getTime(), this.props.toDate.getTime()],   
                anchor: 'y3'            
            },
            yaxis3: {
                title: 'Percentage',                
                type: 'linear',
                domain: [0.55, 1],
            },
            xaxis4: {
                type: 'date',
                domain: [0.55, 1],
                range: [this.props.fromDate.getTime(), this.props.toDate.getTime()], 
                anchor: 'y4'   
            },
            yaxis4: {
                title: 'Percentage',                
                anchor: 'x4',
                type: 'linear',
                domain: [0.55, 1],
            },
        };

        return (
            <div>
                { !this.props.selectedNode && 
                    <Welcome/>
                }
                <Tabs style={{ height: '100vh', width: '80vw', overflowY: 'scroll' }}>
                    { this.props.selectedNode && <Tab label="GRAPH OVERVIEW" style={{ height: 50, backgroundColor: colors.accentLight }}>
                    <div style={{
                        display: 'flex',
                        flexDirection: 'row',
                        flexWrap: 'wrap',
                        justifyContent: 'flex-start',
                        width: '100%',
                    }}>
                        <RaisedButton label="Edit" onClick={this.handleOpen} />
                        <RaisedButton label="Refresh" onClick={this.refreshGraph} />
                        <RaisedButton label={ !this.props.selectedNode ? "Generate average [all]" : "Generate average [" + this.props.selectedNode.displayName + "]" } onClick={this.generateAverages} />
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
                                value={this.props.fromDate}
                                disableYearSelection={this.state.disableYearSelection}
                            />

                            <DatePicker
                                onChange={this.handleChangetoDate}
                                floatingLabelText="To"
                                autoOk={this.state.autoOk}
                                value={this.props.toDate}
                                disableYearSelection={this.state.disableYearSelection}
                            />

                            <SelectField
                                floatingLabelText="Mode"
                                value={this.props.mode}
                                onChange={this.handleModeChange}
                            >
                                <MenuItem value={"AVG"} primaryText="AVERAGE" />
                                <MenuItem value={"MIN"} primaryText="BEST" />
                                <MenuItem value={"MAX"} primaryText="WORST" />
                            </SelectField>

                            <SelectField
                                floatingLabelText="Frequency"
                                value={this.props.interval}
                                onChange={this.handleChange}
                            >
                                <MenuItem value={-1} primaryText="Detailed" />
                                <MenuItem value={5} primaryText="5 min" />
                                <MenuItem value={10} primaryText="10 min" />
                                <MenuItem value={30} primaryText="30 min" />
                                <MenuItem value={60} primaryText="Hourly" />
                            </SelectField>
                        </div>
                    </Dialog>
                </Tab> }
                { this.props.selectedNode && <Tab label="RAW DATA" style={{ height: 50, backgroundColor: colors.accentLight }}>
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
        selectedNodeInfo: state.navigation.selectedNode && state.navigation.selectedNode.nodeInfo,
        fromDate: state.navigation.fromDate,
        toDate: state.navigation.toDate,
        interval: state.navigation.interval,
        mode: state.navigation.mode,
    }), (dispatch: (action: Action) => void) => ({
        setTimeSpan: (fromDate: date, toDate: Date) => dispatch({ type: 'SET_TIMESPAN', fromDate, toDate }),
        setInterval: (interval: Number) => dispatch({ type: 'SET_INTERVAL', interval }),
        setMode: (mode: String) => dispatch({ type: 'SET_MODE', mode }),
        fetchNodes: (fromDate: date, toDate: Date, interval: Number) => dispatch({ type: 'NODES_FETCH_REQUESTED', fromDate, toDate, interval }),
        fetchNode: (node: Node, fromDate: date, toDate: Date, interval: Number) => dispatch({ type: 'NODE_FETCH_REQUESTED', node, fromDate, toDate, interval }),
        fetchNodeDetails: (node: Node, fromDate: date, toDate: Date, interval: Number) => dispatch({ type: 'NODE_DETAILS_FETCH_REQUESTED', node, fromDate, toDate, interval }),
        generateAverages: (id: String) => dispatch({ type: 'GENERATE_AVERAGES', id }),
    }), NodeInfoComponent
)

export default Connected

// @flow

import React from 'react'
import { connectClass } from '../connect'
import type { Node, NodeInformation } from '../types'

import { colors } from '../styles'
import { Tabs, Tab } from 'material-ui/Tabs';
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
import TextField from 'material-ui/TextField';
import MenuItem from 'material-ui/MenuItem';

import TimePicker from 'material-ui/TimePicker';

import createPlotlyComponent from 'react-plotlyjs';
import Plotly from 'plotly.js/dist/plotly-basic.js';
const PlotlyComponent = createPlotlyComponent(Plotly);

const moment = require('moment')

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
        setTimeSpan: (fromDate: Date, toDate: Date) => void,
        setInterval: (interval: Number) => void,
        generateAverages: (id: String) => void,
    };

    constructor(props: any) {
        super(props)

        this.state = {
            open: false,
            autoOk: false,
            disableYearSelection: true,
            fetchGraphData: false,
            messagingInterval: 5, // Every Xth second the nodes send a message to the server
        };
    }

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
                let timestamp = new Date(nextProps.nodes[i].nodeInfo[length - 1]['timestamp'])
                if (latestDate == 0) {
                    latestDate = timestamp
                } else if (timestamp.getTime() > latestDate.getTime()) {
                    latestDate = timestamp
                }
            })

            const toDate = new Date(new Date(latestDate).getTime() + coeff)
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

        !this.props.selectedNode && this.props.fetchNodes(this.props.fromDate, this.props.toDate, this.props.interval)
        this.props.selectedNode && this.props.fetchNode(this.props.selectedNode, this.props.fromDate, this.props.toDate, this.props.interval)
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
                    elem.coverageCount = this.props.nodes[i].nodeInfo[j].coverage != -120 ? 1 : 0

                    elem.timestamp = this.props.nodes[i].nodeInfo[j].timestamp
                    elem.latency = this.props.nodes[i].nodeInfo[j].latency
                    elem.coverage = this.props.nodes[i].nodeInfo[j].coverage
                    elem.dataPoints = this.props.nodes[i].nodeInfo[j].latencyDataPoints
                } else {
                    elem.latencyCount = this.props.nodes[i].nodeInfo[j].latency != 0 ? elem.latencyCount + 1 : elem.latencyCount
                    elem.coverageCount = this.props.nodes[i].nodeInfo[j].coverage != -120 ? elem.coverageCount + 1 : elem.coverageCount

                    elem.latency = this.props.nodes[i].nodeInfo[j].latency != 0 ? this.props.nodes[i].nodeInfo[j].latency + elem.latency : elem.latency
                    elem.coverage = this.props.nodes[i].nodeInfo[j].coverage != -120 ? this.props.nodes[i].nodeInfo[j].coverage + elem.coverage : elem.coverage
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
            dict[key].latency = nodeInfo[i].latency
            dict[key].coverage = nodeInfo[i].coverage
            dict[key].dataPoints = nodeInfo[i].latencyDataPoints
        }

        return dict
    }

    plotlyRelayout = (event) => {
        console.log(event)
        this.props.setTimeSpan(new Date(event['xaxis.range[0]']), new Date(event['xaxis.range[1]']))
    }

    getLayout = (title, yaxisFrom, yaxisTo) => {
        return {
            title: title,
            height: 600,
            dragmode: 'pan',
            xaxis: {
                range: [this.props.fromDate.getTime(), this.props.toDate.getTime()],
            },
        }
    }

    getData = (name, labels, points) => {
        return {
            type: "scatter",
            mode: "lines",
            name: name,
            x: labels,
            y: points,
            connectNullData: false,
            line: {
                shape: 'spline',
                color: colors.accentLighter,
                width: 3
            }
        }
    }

    render() {
        let latencyPoints = []
        let latencyLabels = []

        let coveragePoints = []
        let coverageLabels = []

        let uptimePoints = []
        let uptimeLabels = []

        let dict = {}
        if (this.props.selectedNodeInfo) {
            dict = this.handleSelectedNodeInfo(this.props.selectedNodeInfo)
        } else if (this.props.nodes.length != 0) {
            dict = this.makeAverageDict()
        }

        let latencyIndex = 0
        let coverageIndex = 0
        let uptimeIndex = 0
        function round2(x) {
            return Math.ceil(x / 2) * 2;
        }

        let timeoffset = new Date().getTimezoneOffset()
        for (var key in dict) {
            let time = new Date(new Date(key))

            latencyLabels[latencyIndex] = time
            latencyPoints[latencyIndex++] = dict[key].latency != 0 ? dict[key].latency : null

            coverageLabels[coverageIndex] = time
            coveragePoints[coverageIndex++] = dict[key].coverage != -120 ? dict[key].coverage : null

            uptimeLabels[uptimeIndex] = time
            uptimePoints[uptimeIndex++] = dict[key].dataPoints != 0 ? round2(dict[key].dataPoints / ((this.props.interval * 60) / this.state.messagingInterval) * 100) : null
        }

        console.log(latencyPoints)

        const uptime = this.getData('Uptime', uptimeLabels, uptimePoints)
        let latency = {
            type: "scatter",
            mode: "lines",
            name: "Latency",
            x: latencyLabels,
            y: latencyPoints,
            connectNullData: false,
            line: {
                shape: 'spline',
                color: colors.accentLighter,
                width: 3
            }
        }
        let coverage = {
            type: "scatter",
            mode: "lines",
            name: "Coverage",
            x: coverageLabels,
            y: coveragePoints,
            connectNullData: false,
            yaxis: "y2",
            line: {
                shape: 'spline',
                color: colors.accentLighter,
                width: 3
            }
        }

        const uptimeLayout = this.getLayout('UPTIME', -5, 105)
        const latencyAndCoverageLayout = {
            title: "Latency & Coverage",
            height: 600,
            dragmode: 'pan',
            xaxis: {
                range: [this.props.fromDate.getTime(), this.props.toDate.getTime()],
            },
            yaxis: {
                title: "Latency",
                range: [-0.5, 20]
            },
            yaxis2: {
                title: 'Coverage',
                range: [-40, -121],
                anchor: 'free',
                side: 'right',
                overlaying: "y",
                position: 1
            }
        }

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

        return (
            <Tabs style={{ height: '100vh', width: '80vw', overflowY: 'scroll' }}>
                <Tab label="GRAPH OVERVIEW" style={{ height: 50, backgroundColor: colors.accentLight }}>
                    <div style={{
                        display: 'flex',
                        flexDirection: 'row',
                        flexWrap: 'wrap',
                        justifyContent: 'flex-start',
                        width: '100%',
                    }}>
                        <RaisedButton label="Edit" onClick={this.handleOpen} />
                        <RaisedButton label="Refresh" onClick={this.refreshGraph} />
                        <RaisedButton label={!this.props.selectedNode ? "Generate average [all]" : "Generate average [" + this.props.selectedNode.displayName + "]"} onClick={this.generateAverages} />
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
                        <PlotlyComponent className="uptime" data={[uptime]} layout={uptimeLayout} config={config} onRelayout={this.plotlyRelayout} />
                        <PlotlyComponent className="latencyAndCoverage" data={[latency, coverage]} layout={latencyAndCoverageLayout} config={config} onRelayout={this.plotlyRelayout} />
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
                                floatingLabelText="Frequency"
                                value={this.props.interval}
                                onChange={this.handleChange}
                            >
                                {0 && (this.props.toDate.getTime() - this.props.fromDate.getTime()) < 3600000 && this.props.selectedNode && <MenuItem value={0} primaryText="Everything" />}
                                <MenuItem value={5} primaryText="5 min" />
                                <MenuItem value={10} primaryText="10 min" />
                                <MenuItem value={30} primaryText="30 min" />
                                <MenuItem value={60} primaryText="Hourly" />
                            </SelectField>
                        </div>

                    </Dialog>
                </Tab>
                {0 && <Tab label="RAW DATA" style={{ height: 50, backgroundColor: colors.accentLight }}>
                    <Table
                        multiSelectable={true}
                    >
                        <TableHeader adjustForCheckbox={true}>
                            <TableRow>
                                <TableHeaderColumn>TIMESTAMP</TableHeaderColumn>
                                <TableHeaderColumn>LATENCY</TableHeaderColumn>
                                <TableHeaderColumn>COVERAGE</TableHeaderColumn>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {Object.keys(dict).map((key, i) =>
                                dict[key].latency != 0 &&
                                <TableRow key={i} value={dict[key]}>
                                    <TableRowColumn> {dict[key].timestamp} </TableRowColumn>
                                    <TableRowColumn> {dict[key].latency} </TableRowColumn>
                                    <TableRowColumn> {dict[key].coverage} </TableRowColumn>
                                </TableRow>
                            )}
                        </TableBody>
                    </Table>
                </Tab>}
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
        interval: state.navigation.interval,
    }), (dispatch: (action: Action) => void) => ({
        setTimeSpan: (fromDate: date, toDate: Date) => dispatch({ type: 'SET_TIMESPAN', fromDate, toDate }),
        setInterval: (interval: Number) => dispatch({ type: 'SET_INTERVAL', interval }),
        fetchNodes: (fromDate: date, toDate: Date, interval: Number) => dispatch({ type: 'NODES_FETCH_REQUESTED', fromDate, toDate, interval }),
        fetchNode: (node: Node, fromDate: date, toDate: Date, interval: Number) => dispatch({ type: 'NODE_FETCH_REQUESTED', node, fromDate, toDate, interval }),
        generateAverages: (id: String) => dispatch({ type: 'GENERATE_AVERAGES', id }),
    }), NodeInfoComponent
)

export default Connected

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
import MenuItem from 'material-ui/MenuItem';

import TimePicker from 'material-ui/TimePicker';
import { Line } from 'react-chartjs-2';

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
            messagingInterval: 5 // Every Xth second the nodes send a message to the server
        };
    }

    componentWillReceiveProps(nextProps) {
        if (nextProps.fromDate != this.props.fromDate || nextProps.toDate != this.props.toDate || nextProps.interval != this.props.interval) {
            this.props.setTimeSpan(nextProps.fromDate, nextProps.toDate)
            this.setState({ fetchGraphData: true });
        }
    }

    handleOpen = () => {
        this.setState({ open: true });
    };

    handleClose = () => {
        if (this.state.fetchGraphData) {
            !this.props.selectedNode && this.props.fetchNodes(this.props.fromDate, this.props.toDate, this.props.interval)
            this.props.selectedNode && this.props.fetchNode(this.props.selectedNode, this.props.fromDate, this.props.toDate, this.props.interval)
        }

        this.setState({ open: false, fetchGraphData: false });
    };

    handleChange = (event, index, interval) =>{
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
            elem.latency = elem.latencyCount != 0 ? elem.latency / elem.latencyCount : 0
            elem.coverage = elem.coverageCount != 0 ? elem.coverage / elem.coverageCount : -120
            elem.dataPoints = elem.latencyCount != 0 ? elem.dataPoints / elem.latencyCount : 0
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

    render() {
        let latencyPoints = []
        let latencyLabels = []

        let coveragePoints = []
        let coverageLabels = []

        let uptimePoints = []
        let uptimeLabels = []

        var coeff = 1000 * 60 * this.props.interval
        let timeoffset = new Date().getTimezoneOffset()
        let dateIndexFrom = new Date(this.props.fromDate.getTime() - (timeoffset * 1000 * 60))

        let i = 0
        let preDict = {}
        let tempToTime = this.props.toDate.getTime()
        tempToTime = tempToTime - (1000 * 60 * this.props.toDate.getTimezoneOffset())
        while (dateIndexFrom.getTime() <= tempToTime) {
            const dateIndexString = dateIndexFrom.toISOString()
            preDict[dateIndexString] = []
            preDict[dateIndexString].latency = 0
            preDict[dateIndexString].coverage = -120
            preDict[dateIndexString].uptime = 0

            dateIndexFrom = new Date(dateIndexFrom.getTime() + coeff)
        }

        let dict = {}
        if (this.props.selectedNodeInfo) {
            dict = this.handleSelectedNodeInfo(this.props.selectedNodeInfo)
        } else if (this.props.nodes.length != 0) {
            dict = this.makeAverageDict()
        }

        let latencyIndex = 0
        let coverageIndex = 0
        let uptimeIndex = 0
        for (var key in preDict) {
            let time = new Date(new Date(key).getTime() + (timeoffset * 1000 * 60))

            let exists = dict[time.toISOString()]

            latencyLabels[latencyIndex] = time
            latencyPoints[latencyIndex++] = exists != undefined ? dict[time.toISOString()].latency : preDict[key].latency

            coverageLabels[coverageIndex] = time
            coveragePoints[coverageIndex++] = exists != undefined ? dict[time.toISOString()].coverage : preDict[key].coverage

            uptimeLabels[uptimeIndex] = time
            uptimePoints[uptimeIndex++] = exists != undefined ? dict[time.toISOString()].dataPoints / ((this.props.interval * 60) / this.state.messagingInterval) * 100 : preDict[key].uptime
        }

        let length = latencyPoints.length
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
                    pointHitRadius: length > 500 ? 5 : 10,
                    data: latencyPoints,
                    spanGaps: true,
                },
            ],
        }

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
                    pointHitRadius: length > 500 ? 5 : 10,
                    data: coveragePoints,
                    spanGaps: true,
                },
            ],
        };

        const uptimeData = {
            labels: uptimeLabels,
            datasets: [
                {
                    label: 'Uptime',
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
                    pointHitRadius: length > 500 ? 5 : 10,
                    data: uptimePoints,
                    spanGaps: true,
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

        const options = {
            animation: {
                duration: length > 500 ? 0 : 500, // general animation time - switch to non animation when passing 500 points. With 5 min interval this is ~2 days.
            },
            hover: {
                animationDuration: 0, // duration of animations when hovering an item
            },
            responsiveAnimationDuration: 0, // animation duration after a resize
            scales: {
                xAxes: [{
                    type: 'time',
                    unit: 'day',
                    time: {
                        displayFormats: {
                            second: 'HH:mm',
                            minute: 'HH:mm',
                            hour: 'HH:mm',
                            day: 'MMM D HH:mm',
                        }
                    },
                    distribution: 'series' //linear
                }]
            }
        }

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
                        <RaisedButton label="Generate averages" onClick={this.generateAverages} />
                    </div>

                    <div style={{
                        display: 'flex',
                        flexDirection: 'column',
                        justifyContent: 'space-around',
                        height: '100%',
                        width: '96%',
                        paddingLeft: '2%',
                    }}>
                        <Line data={uptimeData} options={options} width={35} height={10} />
                        <Line data={latencyData} options={options} width={35} height={10} />
                        <Line data={coverageData} options={options} width={35} height={10} />
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
                            <TimePicker
                                floatingLabelText="From"
                                minutesStep={this.props.interval}
                                value={this.props.fromDate}
                                format="24hr"
                                autoOk={true}
                                onChange={this.handleFromHourMinuteChange}
                            />

                            <DatePicker
                                onChange={this.handleChangetoDate}
                                floatingLabelText="To"
                                autoOk={this.state.autoOk}
                                value={this.props.toDate}
                                disableYearSelection={this.state.disableYearSelection}
                            />
                            <TimePicker
                                floatingLabelText="To"
                                minutesStep={this.props.interval}
                                value={this.props.toDate}
                                format="24hr"
                                autoOk={true}
                                onChange={this.handleToHourMinuteChange}
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

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
import TextField from 'material-ui/TextField';

var dateFormat = require('dateformat');

import { Line } from 'react-chartjs-2';

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
            coeff: 10,
            autoOk: false,
            disableYearSelection: true,
            fetchGraphData: false,
        };
    }

    componentWillReceiveProps(nextProps) {
        if (nextProps.fromDate != this.props.fromDate || nextProps.toDate != this.props.toDate || nextProps.limit != this.props.limit) {
            this.props.setTimeSpan(nextProps.fromDate, nextProps.toDate)
            this.setState({ fetchGraphData: true });
        }
    }

    handleOpen = () => {
        this.setState({ open: true });
    };

    handleClose = () => {
        if (this.state.fetchGraphData) {
            !this.props.selectedNode && this.props.fetchNodes(this.props.fromDate, this.props.toDate, this.props.limit)
            this.props.selectedNode && this.props.fetchNode(this.props.selectedNode, this.props.fromDate, this.props.toDate, this.props.limit)
        }

        this.setState({ open: false, fetchGraphData: false });
    };

    handleChange = (event, index, coeff) => this.setState({ coeff });

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

    handleNodeInfo(nodeInfo: NodeInformation): {} {
        let newDict = {}

        var coeff = 1000 * 60 * this.state.coeff

        let dateIndexFrom = new Date((Math.round(this.props.fromDate.getTime() / coeff) * coeff) - coeff)
        let dateIndexTo = new Date(dateIndexFrom.getTime() + coeff)

        let latencyIndex = 0
        let coverageIndex = 0

        let latencyAvg = 0
        let latencyAvgCount = 0

        let coverageAvg = 0
        let coverageAvgCount = 0
        let nodeInfoLength = nodeInfo.length;
        let setDateIndex = true

        let currentDate = new Date(nodeInfo[0].timestamp)
        let i = 1

        while (currentDate.getTime() < this.props.toDate.getTime()) {
            let displayDate = dateFormat(dateIndexFrom, "dd/mm/yy HH:MM");

            if ((currentDate.getTime() >= dateIndexFrom.getTime() && currentDate.getTime() <= dateIndexTo.getTime()) && i < nodeInfoLength) {
                let elem = newDict[displayDate]

                if (elem == undefined) {
                    elem = []
                    elem[0] = nodeInfo[i].latency
                    elem[1] = nodeInfo[i].coverage
                } else {
                    elem[0] = (nodeInfo[i].latency + elem[0]) / 2
                    elem[1] = nodeInfo[i].coverage != 0 ? (nodeInfo[i].coverage + elem[1]) / 2 : elem[1]
                }

                newDict[displayDate] = elem
                currentDate = new Date(nodeInfo[i].timestamp)
                i++

                if (currentDate.getTime() >= dateIndexTo.getTime()) {
                    dateIndexFrom = new Date(dateIndexFrom.getTime() + coeff)
                    dateIndexTo = new Date(dateIndexFrom.getTime() + coeff)
                }
            } else {
                newDict[displayDate] = [0, -120]

                dateIndexFrom = new Date(dateIndexFrom.getTime() + coeff)
                dateIndexTo = new Date(dateIndexTo.getTime() + coeff)
                
                if(i == nodeInfoLength) currentDate = dateIndexTo
            }
        }
        
        return newDict
    }

    makeAverageDict(): {} {
        let dicts = {}

        for (let i = 0; i < this.props.nodes.length; i++) {
            dicts[i] = this.handleNodeInfo(this.props.nodes[i].nodeInfo);
        }

        let index = 0
        let newDict = {}
        for(var key in dicts[0]) {
            let latency = 0
            let latencyCount = 0
            let coverage = 0
            let coverageCount = 0
            for(let i = 0; i < Object.keys(dicts).length; i++) {
                latency = latency + dicts[i][key][0]
                latencyCount++

                coverage = coverage + dicts[i][key][1]
                if(dicts[i][key].coverage != 0) coverageCount++

            }
            newDict[key] = []
            newDict[key][0] = latencyCount != 0 ? latency / latencyCount : 0
            newDict[key][1] = coverageCount != 0 ? coverage / coverageCount : -120
        }

        return newDict
    }

    makeDict(nodeInfo: NodeInformation): {} {
        return this.handleNodeInfo(nodeInfo)
    }

    render() {
        let latencyPoints = []
        let latencyLabels = []

        let coveragePoints = []
        let coverageLabels = []

        let dict = {}
        if (this.props.selectedNodeInfo) {
            dict = this.makeDict(this.props.selectedNodeInfo)
        } else if(this.props.nodes.length != 0) {
            dict = this.makeAverageDict()
        }

        let latencyIndex = 0
        let coverageIndex = 0
        for (var key in dict) {
            latencyLabels[latencyIndex] = key
            latencyPoints[latencyIndex++] = dict[key][0]

            coverageLabels[coverageIndex] = key
            coveragePoints[coverageIndex++] = dict[key][1]
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
                            options={{ maintainAspectRatio: true }} />
                        <Line data={coverageData} width={35} height={10}
                            options={{ maintainAspectRatio: true }} />
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
                                value={this.props.limit != 0 ? this.props.limit : ""}
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
        setTimeSpan: (fromDate: date, toDate: Date) => dispatch({ type: 'SET_TIMESPAN', fromDate, toDate }),
        setLimit: (limit: Number) => dispatch({ type: 'SET_LIMIT', limit }),
        fetchNodes: (fromDate: date, toDate: Date, limit: Number) => dispatch({ type: 'NODES_FETCH_REQUESTED', fromDate, toDate, limit }),
        fetchNode: (node: Node, fromDate: date, toDate: Date, limit: Number) => dispatch({ type: 'NODE_FETCH_REQUESTED', node, fromDate, toDate, limit }),
    }), NodeInfoComponent
)

export default Connected

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

const styles = {
    circle: {
        paddingTop: '2rem',
        display: 'table-cell',
        height: '3rem', /*change this and the width
        for the size of your initial circle*/
        width: '5rem',
        textAlign: 'center',
        verticalAlign: 'middle',
        borderRadius: '50%',
        /*make it pretty*/
        background: '#000',
        color: '#fff',
        font: '18px josefin sans, arial', /*change this
        for font-size and font-family*/
    }
}

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
            this.props.fetchNodeTemperatureNow({id: 'ute'})
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

    handleSelectedNodeInfo(nodeInfo) {
        let dict = {}
        for (let i = 0; i < nodeInfo.length; i++) {
            let key = nodeInfo[i].timestamp
            dict[key] = []
            dict[key].timestamp = nodeInfo[i].timestamp
            dict[key].temperature = nodeInfo[i].temperature
        }

        return dict
    }

    handleAllNodes() {
        let newDict = {}

        for (let i = 0; i < this.props.nodes.length; i++) {
            newDict[this.props.nodes[i].displayName] = this.handleSelectedNodeInfo(this.props.nodes[i].nodeInfo)
        }

        return newDict
    }

    getLayout = (title, yaxisFrom, yaxisTo) => {
        return {
            title: title,
            height: 600,
            dragmode: 'pan',
            xaxis: {
                range: [this.props.fromDate.getTime(), this.props.toDate.getTime()],
            },
            yaxis: {
                range: [yaxisFrom, yaxisTo]
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

    handleNodeData = (nodeData) => {
        let points = []
        let labels = []

        let temperatureIndex = 0
        for (var key in nodeData) {
            let time = new Date(key)

            labels[temperatureIndex] = time
            points[temperatureIndex++] = nodeData[key].temperature != 0 ? nodeData[key].temperature : null
        }

        return [points, labels];
    }

    render() {
        let data = []
        let temperaturePoints = []
        let temperatureLabels = []

        let dict = {}
        if (this.props.selectedNodeInfo) {
            dict = this.handleSelectedNodeInfo(this.props.selectedNodeInfo)
            data = this.handleNodeData(dict)
        }

        temperaturePoints = data[0]
        temperatureLabels = data[1]

        const temperature = this.getData('Temperature', temperatureLabels, temperaturePoints);

        const temperatureLayout = this.getLayout('TEMPERATURE', -20, 30);
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
                    {this.props.selectedNode ? <div>
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
                            width: '98%',
                            paddingLeft: '1%',
                            paddingTop: '1%',
                        }}>
                            <PlotlyComponent className="temperature" data={[temperature]} layout={temperatureLayout} config={config} />
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
                    </div>
                    :
                    <div style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'space-evenly'}}>
                        {this.props.nodes.map(node => {
                            return (
                                <div style={styles.circle}>
                                    {parseFloat(node.temperatureNow).toFixed(2)}
                                </div>
                            )
                        })}
                    </div>}
                </Tab>
                {0 && <Tab label="RAW DATA" style={{ height: 50, backgroundColor: colors.accentLight }}>
                    <Table
                        multiSelectable={true}
                    >
                        <TableHeader adjustForCheckbox={true}>
                            <TableRow>
                                <TableHeaderColumn>TIMESTAMP</TableHeaderColumn>
                                <TableHeaderColumn>TEMPERATURE</TableHeaderColumn>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {Object.keys(dict).map((key, i) =>
                                dict[key].latency != 0 &&
                                <TableRow key={i} value={dict[key]}>
                                    <TableRowColumn> {moment(dict[key].timestamp).format('DD.MM.YYYY HH:mm')} </TableRowColumn>
                                    <TableRowColumn> {dict[key].temperature} </TableRowColumn>
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

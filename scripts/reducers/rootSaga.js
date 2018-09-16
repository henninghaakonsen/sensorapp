// @flow

import { call, put, take, fork } from 'redux-saga/effects'
import type { Action } from '../actions'
import type { Node } from '../types'

let moment = require('moment')

import {
    fetchNodeList,
    fetchOneNodeAverage,
    fetchTemperatureNowForNode,
    generateAverages,
    generateAveragesOnIndex,
} from '../api'

export function typedAction(action: any): Action {
    return action
}

function getISOStrings(fromDate: Date, toDate: Date) {
    if (fromDate == undefined) return [0, 0]
    
    const fromDateISO = moment.utc(fromDate.getTime()).format()
    const toDateISO = moment.utc(toDate.getTime()).format()

    return [fromDateISO, toDateISO]
}

function* fetchNodes(fromDate: Date, toDate: Date, interval: Number) {
    const dateISO = getISOStrings(fromDate, toDate)

    try {
        let nodes = yield call(fetchNodeList, dateISO[0], dateISO[1], interval)
        console.log(nodes)

        yield put({ type: 'NODES_FETCH_SUCCEEDED', nodes })
    } catch (e) {
        yield put({ type: 'NODES_FETCH_FAILED', message: e.message })
    }
}

function fetchNodeWithId(id: String): NodeInformation[] {
    try {
        const nodeInformation = fetchOneNode(id)
        return nodeInformation
    } catch (e) {
    }
}

function* fetchNode(node: Node, fromDate: Date, toDate: Date, interval: Number) {
    const dateISO = getISOStrings(fromDate, toDate)

    try {
        const nodeInformation = yield call(fetchOneNodeAverage, node, dateISO[0], dateISO[1], interval)
        node.nodeInfo = nodeInformation
        yield put({ type: 'NODE_FETCH_SUCCEEDED', node })
    } catch (e) {
        yield put({ type: 'NODE_FETCH_FAILED', message: e.message })
    }
}

function* nodeQueryClicked(node: Node) {
    try {
        yield put({ type: 'NODE_SELECTED', node })
        const nodeInformation = yield call(fetchOneNode, node)
        yield put({ type: 'NODE_FETCH_SUCCEEDED', nodeInformation })
    } catch (e) {
        yield put({ type: 'NODE_FETCH_FAILED', message: e.message })
    }
}

function* generateAveragesSaga(id: String) {
    try {
        if (id == null) yield call(generateAverages)
        else yield call(generateAveragesOnIndex, id)

        yield put({ type: 'GENERATE_AVERAGES_SUCCEEDED' })
    } catch (e) {
        yield put({ type: 'GENERATE_AVERAGES_FAILED', message: e.message })
    }
}

function* handleRequests(): Generator<*, *, *> {
    while (true) {
        const action = typedAction(yield take())
        switch (action.type) {
            case 'NODES_FETCH_REQUESTED': yield fork(fetchNodes, action.fromDate, action.toDate, action.interval); break
            case 'NODE_FETCH_REQUESTED': yield fork(fetchNode, action.node, action.fromDate, action.toDate, action.interval); break
            case 'NODE_QUERY_CLICKED': yield fork(nodeQueryClicked, action.node); break
            case 'GENERATE_AVERAGES': yield fork(generateAveragesSaga, action.id); break
        }
    }
}

export default function* app(): Generator<*, *, *> {
    yield call(handleRequests)
}

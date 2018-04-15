// @flow

import { call, put, take, fork } from 'redux-saga/effects'
import type { Action } from '../actions'
import type { SensorNode } from '../types'

let moment = require('moment')

import {
    fetchNodeList,
    fetchOneNodeAverage,
    generateAverages,
    generateAveragesOnIndex,
} from '../api'

export function typedAction(action: any): Action {
    return action
}

function* fetchNodes() {
    try {
        const nodes = yield call(fetchNodeList)
        yield put({ type: 'NODES_FETCH_SUCCEEDED', nodes })
    } catch (e) {
        yield put({ type: 'NODES_FETCH_FAILED', message: e.message })
    }
}

function* fetchNode(node: SensorNode, interval: Number) {
    try {
        const nodeInformation = yield call(fetchOneNodeAverage, node)
        node.nodeInfo = nodeInformation
        yield put({ type: 'NODE_FETCH_SUCCEEDED', node })
    } catch (e) {
        yield put({ type: 'NODE_FETCH_FAILED', message: e.message })
    }
}

function* fetchNodeDetails(node: NSensorNodeode, interval: Number) {
    try {
        const nodeDetails = yield call(fetchOneNode, node)
        node.nodeDetails = nodeDetails
        yield put({ type: 'NODE_DETAILS_FETCH_SUCCEEDED', node })
    } catch (e) {
        yield put({ type: 'NODE_DETAILS_FETCH_FAILED', message: e.message })
    }
}

function* nodeQueryClicked(node: SensorNode) {
    try {
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
            case 'NODES_FETCH_REQUESTED': yield fork(fetchNodes); break
            case 'NODE_FETCH_REQUESTED': yield fork(fetchNode, action.node); break
            case 'NODE_DETAILS_FETCH_REQUESTED': yield fork(fetchNodeDetails, action.node); break
            case 'NODE_QUERY_CLICKED': yield fork(nodeQueryClicked, action.node); break
            case 'GENERATE_AVERAGES': yield fork(generateAveragesSaga, action.id); break
        }
    }
}

export default function* app(): Generator<*, *, *> {
    yield call(handleRequests)
}

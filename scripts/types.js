// @flow

import type { Editor } from './reducers/editorReducer'
import type { Messages } from './reducers/messageReducer'
import type { Navigation } from './reducers/navigationReducer'

export type AppState = {
  navigation: Navigation,
  messages: Messages,
  editor: Editor,
}

export type Node = {
  id: string,
  displayName: string,
  nodeInfo: NodeInformation[],
}

export type NodeInformation = {
  temperature: number,
  temperatureDataPoints: number,
}

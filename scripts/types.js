// @flow

import type { Editor } from './reducers/editorReducer'
import type { Messages } from './reducers/messageReducer'
import type { Navigation } from './reducers/navigationReducer'

export type AppState = {
  navigation: Navigation,
  messages: Messages,
  editor: Editor,
}

export type SensorNode = {
  id: string,
  displayName: string,
  nodeInfo: NodeInformation[],
  nodeDetails: NodeDetails[],
}

export type NodeInformation = {
  timestamp: string,
  latency: number,
  msg_id: number,
  coverage: number,
  ecl: number,
  tx_pwr: number,
  rx_time: number,
  tx_time: number,
}

/*export type NodeInformation = {
  timestamp: string,
  avg_latency: number,
  min_latency: number,
  max_latency: number,
  avg_coverage: number,
  min_coverage: number,
  max_coverage: number,
  avg_power_usage: number,
  min_power_usage: number,
  max_power_usage: number,
}*/

export type NodeDetails = {
  timestamp: string,
  signal_power: number,
  total_power: number,
  tx_power: number,
  tx_time: number,
  rx_time: number,
  cell_id: number,
  ecl: number,
  snr: number,
  earfcn: number,
  pci: number,
  msg_id: number,
  ip: string, 
  latency: number,
}

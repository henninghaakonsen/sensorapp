/*
 * This is the entry point for our React application. The provider acts as a
 * wrapper around our App component, providing the goods of Redux.
 */

import React from 'react'
import ReactDOM from 'react-dom'
import { Provider } from 'react-redux'
import configureStore from './store'
import injectTapEventPlugin from 'react-tap-event-plugin';

const store = configureStore({})
injectTapEventPlugin();

import App from './containers/App';

ReactDOM.render(
  <Provider store={store}>
    <App />
  </Provider>,
  document.getElementById('main')
)

// @flow

import React from 'react'
import '../css/welcome.css'

class Welcome extends React.Component {
    render() {
        return ( 
            <div style={{
                display: 'flex', 
                justifyContent: 'center', 
                height: '100vh', 
                width: '80vw', 
                overflowY: 'scroll',
                paddingTop: '1%'}}>
                <div className="ui container">
                    <h1 className="ui center aligned header">
                        Narrowband IoT
                        <div className="sub header">
                        INTRODUCTION AND INVESTIGATION
                        </div>
                    </h1>
                    <div className="ui basic padded segment">
                        <p>
                            Today there are approximately 30 billion smart devices in the world. The growth forwards will be exponential and analysis predict that there will be 50 billion smart devices by 2020. 
                            There is a demand for a new technology which enables communication with sensors and other low powered devices. This page resembles the work and research on a set of technologies suited for this communication, with an emphasis on NB IoT. 
                        </p>
                        <p>
                            Begin selecting a node to the left to view sampled data.
                        </p>
                        <h3 className="ui left aligned header" id="jquery-free">Please visit github for the latest copy of the thesis or source code related to the thesis</h3>
                        <div role="list" className="ui list">
                            <div role="listitem" className="item">
                                <i aria-hidden="true" className="check icon"></i>
                                <div className="content"><a target="_blank" href="https://github.com/henninghaakonsen/thesis">Thesis</a></div>
                            </div>
                            <div role="listitem" className="item">
                                <i aria-hidden="true" className="check icon"></i>
                                <div className="content"><a target="_blank" href="https://github.com/henninghaakonsen/thesis-code">Test code</a></div>
                            </div>
                            <div role="listitem" className="item">
                                <i aria-hidden="true" className="check icon"></i>
                                <div className="content"><a target="_blank" href="https://github.com/henninghaakonsen/sensorapp">App</a></div>
                            </div>
                            <div role="listitem" className="item">
                                <i aria-hidden="true" className="check icon"></i>
                                <div className="content"><a target="_blank" href="https://github.com/henninghaakonsen/sensorserver">Server</a></div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
      )
    }
  }
  
  export default Welcome
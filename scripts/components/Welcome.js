// @flow

import React, {Component} from 'react'
import '../css/welcome.css'
import { colors } from '../styles'
import { NavLink } from 'react-router-dom'

import resultGraphs from '../constants/result_graphs'

class Welcome extends Component {
    constructor(props) {
        super(props)
    }

    render() {
        return ( 
            <div style={{
                display: 'flex', 
                justifyContent: 'center', 
                height: '100%', 
                width: '85vw', 
                overflowY: 'scroll',
                }}>
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
                        <h3 className="ui left aligned header">Please visit github for the latest copy of the thesis or source code related to the thesis</h3>
                        <div role="list" className="ui list">
                            <div role="listitem" className="item">
                                <i aria-hidden="true" className="check icon"></i>
                                <div className="content"><a style={{textDecoration: 'none', color: colors.accent}} target="_blank" href="https://github.com/henninghaakonsen/thesis/tree/master/pdf">Thesis PDF</a></div>
                            </div>
                            <div role="listitem" className="item">
                                <i aria-hidden="true" className="check icon"></i>
                                <div className="content"><a style={{textDecoration: 'none', color: colors.accent}} target="_blank" href="https://github.com/henninghaakonsen/thesis/tree/master/latex">Thesis latex</a></div>
                            </div>
                            <div role="listitem" className="item">
                                <i aria-hidden="true" className="check icon"></i>
                                <div className="content"><a style={{textDecoration: 'none', color: colors.accent}} target="_blank" href="https://github.com/henninghaakonsen/thesis/tree/master/results">Thesis results</a></div>
                            </div>
                            <div role="listitem" className="item">
                                <i aria-hidden="true" className="check icon"></i>
                                <div className="content"><a style={{textDecoration: 'none', color: colors.accent}} target="_blank" href="https://github.com/henninghaakonsen/thesis/tree/master/code">Test code</a></div>
                            </div>
                            <div role="listitem" className="item">
                                <i aria-hidden="true" className="check icon"></i>
                                <div className="content"><a style={{textDecoration: 'none', color: colors.accent}} target="_blank" href="https://github.com/henninghaakonsen/sensorapp">App</a></div>
                            </div>
                            <div role="listitem" className="item">
                                <i aria-hidden="true" className="check icon"></i>
                                <div className="content"><a style={{textDecoration: 'none', color: colors.accent}} target="_blank" href="https://github.com/henninghaakonsen/sensorserver">Server</a></div>
                            </div>
                        </div>
                        <h3 className="ui left aligned header">Visit one of the following links to view test result graphs</h3>
                        {
                            resultGraphs.map( resultGraph => {
                                return <div key={resultGraph.category}>
                                    {resultGraph.results.length == 0 ?
                                    <h2 className="ui left aligned header">{resultGraph.category}</h2>
                                    : <h4 className="ui left aligned header">{resultGraph.category}</h4>}
                                    { resultGraph.results.map( result => {
                                        return <div key={result.path}>
                                            <NavLink style={{ textDecoration: 'none', color: colors.accent }} to={"/results/" + result.path}>{result.displayName}</NavLink>
                                            </div>
                                    }) }
                                </div>
                            })
                        }
                    </div>
                </div>
            </div>
      )
    }
  }

  export default Welcome
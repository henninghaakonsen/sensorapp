import React, {Component} from 'react'
import history from '../utils/history';

class ResultGraph extends Component {
  render() {
    const src = history.location.pathname.split('/').slice(-1)[0]
    return (
      <iframe title="Results" src={"/graphs/" + src + ".html"} width="100%" height="100%" />
    )
  }
  
}

export default ResultGraph;
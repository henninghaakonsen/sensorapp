// @flow

import React from 'react'
import { colors, fonts } from '../styles'
import Subheader from 'material-ui/Subheader';

class Button extends React.Component {
  props: {
    text: string,
    onClick: () => void,
  }

  state: {
    pressed: boolean,
    hover: boolean,
  }

  constructor(props: any) {
    super(props)
    this.state = {
      pressed: false,
      hover: false,
    }
  }

  getBackgroundColor() {
    if (this.props.homeButton) {
      return colors.wetasphalt
    } else {
      if ( this.props.selected ) {
        return colors.gray
      } else {
        return this.state.hover ? colors.gray : '#f4f4f4'
      }
    }
  }

  render() {
    return (
      <div
        onClick={() => this.props.onClick()}
        onMouseDown={() => this.setState({pressed: true})}
        onMouseEnter={() => this.setState({hover: true})}
        onMouseLeave={() => this.setState({hover: false, pressed: false})}
        onMouseUp={() => this.setState({pressed: false})}
        style={{
          alignItems: 'left',
          backgroundColor: this.getBackgroundColor(),
          cursor: 'pointer',
          display: 'flex',
          height: '40px',
          paddingLeft: !this.props.homeButton ? '10px' : '0px',
          textAlign: 'left',
        }}>
        <Subheader style={{
          color: 'black',
          fontSize: 18,
        }} >
          { this.props.text.toUpperCase() }
        </Subheader>
      </div>
    )
  }
}

export default Button

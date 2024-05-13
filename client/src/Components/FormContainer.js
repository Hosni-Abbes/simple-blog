import React, { Component } from 'react'

export default class FormContainer extends Component {
    constructor(props){
        super(props)
    }

  render() {
    return (
      <form className='auth-form'>
        { this.props.children }
      </form>
    )
  }
}

import React, { Component } from 'react'
import { Link } from 'react-router-dom'

export default class NotFound extends Component {
  render() {
    return (
      <div className='not-found'>
        <strong>404</strong> Page Not Found!
        <br />
        <Link to='/'>Back to Home</Link>
      </div>
    )
  }
}

import React, { Component } from 'react'
import { connect } from 'react-redux'
import { loginUser } from '../slices/authSlice'
import FormContainer from './FormContainer'

class Login extends Component {
    constructor(props){
        super(props)
        this.state = {
            userData: { email:'', password:'' }
        }
        this.handleInputChange = this.handleInputChange.bind(this)
        this.handleFormSubmit = this.handleFormSubmit.bind(this)
    }

    handleInputChange = e => {
        this.setState({userData: {...this.state.userData, [e.target.name]: e.target.value }})
    }
    handleFormSubmit = async e => {
        e.preventDefault()
        try {
            const result = await this.props.loginUser(this.state.userData).unwrap()
            const date = new Date()
            date.setTime(date.getTime() + 60*60*1000);
            document.cookie = `user_id=${result.token}; domain=${window.location.hostname}; expires=${date.toUTCString()}; path=/; SameSite=Strict; Secure`
        } catch (err) {
            console.error(err)
        }
    }

  render() {
    return (
        <FormContainer>
            <small><strong>Login</strong></small>
            <br/>
            {
                this.props.error && <small className='color-red mb-1'>{this.props.error}</small>
            }
            <input type='email' name='email' placeholder='Email' value={this.state.userData.email} onChange={e=>this.handleInputChange(e)} />
            <input type='password' name='password' placeholder='Password' value={this.state.userData.password} onChange={e=>this.handleInputChange(e)} />
            <div className='mb-1'>
                <input type='submit' className='pointer' disabled={this.props.loading} value={this.props.loading ? '. . .' : 'Login'} onClick={e => this.props.loading ? null : this.handleFormSubmit(e)} />
            </div>
            <small className='mt-1'>Don't have an account? <span className='color-red pointer' onClick={()=>this.props.setOption(0)}>Register</span></small>
        </FormContainer>
    )
  }
}


const mapStateToProps = state => ({
    user: state.auth.user,
    loading: state.auth.loading,
    error: state.auth.error
})
const mapDispatchToProps = { loginUser }

export default connect(mapStateToProps, mapDispatchToProps)(Login)


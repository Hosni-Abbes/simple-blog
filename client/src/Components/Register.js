import React, { Component } from 'react'
import FormContainer from './FormContainer'
import { connect } from 'react-redux'
import axios from '../config/api/axios'
import endpoints from '../config/api/endpoints'

class Register extends Component {
    constructor(props){
        super(props)
        this.state = {
            userData: { name:'', email:'', password:'' },
            error: null,
            loading: false
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
            this.setState({...this.state, loading: true})
            await axios.post(endpoints.registrationEndpoint, this.state.userData)
            this.setState({...this.state, loading: false})
            this.props.setRedirected(true)
            this.props.setOption(1)
        } catch (err) {
            this.setState({...this.state, loading: false, error: err.response?.data?.message || err.message})
        }
    }


  render() {
    return (
        <FormContainer>
            <small><strong>Register</strong></small>
            <br/>
            {
                this.state.error && <small className='color-red mb-1'>{this.state.error}</small>
            }
            <input type='text' name='name' placeholder='Your Name' value={this.state.userData.name} onChange={e=>this.handleInputChange(e)} />
            <input type='email' name='email' placeholder='Email' value={this.state.userData.email} onChange={e=>this.handleInputChange(e)} />
            <input type='password' name='password' placeholder='Password' value={this.state.userData.password} onChange={e=>this.handleInputChange(e)} />
            <div className='mb-1'>
                <input type='submit' className='pointer' disabled={this.state.loading} value={ this.state.loading ? '. . .' : 'Register' } onClick={e => this.state.loading ? null : this.handleFormSubmit(e)} />
            </div>
            <small className='mt-1'>Already have an account? <span className='color-red pointer' onClick={()=>this.props.setOption(1)}>Login</span></small>
        </FormContainer>
    )
  }
}

const mapStateToProps = (state) => ({
    user: state.auth.user,
});

export default connect(mapStateToProps)(Register);

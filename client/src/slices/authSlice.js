import { createSlice, createAsyncThunk } from '@reduxjs/toolkit'
import axios from '../config/api/axios'
import endpoints from '../config/api/endpoints'


export const loginUser = createAsyncThunk(
    'user/loginUser',
    async(userCredentials) => {
        const request = await axios.post(endpoints.loginEndpoint, userCredentials, {
            headers: {
              "Content-Type": "application/json"
              },
              withCredentials: true
        })
        return await request.data
    }
)
export const logoutUser = createAsyncThunk(
    'user/logoutUser',
    () => document.cookie = 'user_id=; Max-Age=-99999999;'
)

const getTokenCookie = name => {
    const cookieSearch = `${name}=`
    const cookies = document.cookie.split(';')
    for(let i=0; i<cookies.length;i++){
        if(cookies[i].startsWith(cookieSearch)){
            const index = cookies[i].indexOf(cookieSearch)
            return cookies[i].substring(index + cookieSearch.length)
        }
    }
    return ''
}
const parseJwt = (token) => {
    try {
      return JSON.parse(atob(token.split('.')[1]))?.email;
    } catch (e) {
      return null;
    }
};


const initialState = {
    user: {
        token: getTokenCookie('user_id'),
        user: parseJwt(getTokenCookie('user_id')),
    },
    loading: false,
    error: null
}

const authSlice = createSlice({
    name: 'auth',
    initialState,
    reducers: {},
    extraReducers: build => {
        build.addCase(loginUser.pending, state => {
            state.loading = true
            state.user = { token: '', user: null}
            state.error = null
        })
        .addCase(loginUser.fulfilled, (state, action) => {
            state.loading = false
            state.user = action.payload
            state.error = false
        })
        .addCase(loginUser.rejected, (state, action) => {
            state.loading= false
            state.user = { token: '', user: null}
            if(action.error.message === 'Request failed with status code 401'){
                state.error = 'Wrong credentials!'
            }else if(action.error.message === 'Request failed with status code 400'){
                state.error = 'Please add a valid email and password.'
            }else{
                state.error = action.error.message
            }
            document.cookie = 'user_id=; Max-Age=-99999999;';
        })
        .addCase(logoutUser.fulfilled, state => {
            state.loading = false
            state.user = { token: '', user: null}
            state.error = false
        } )
    }
})


const { reducer } = authSlice

export default reducer
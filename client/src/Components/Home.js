import React, { Component } from 'react'
import { connect } from 'react-redux'
import { Link } from 'react-router-dom'
import axios from '../config/api/axios'
import { logoutUser } from '../slices/authSlice'
import Login from './Login'
import Register from './Register'
import ArticlesSkeleton from './ArticlesSkeleton'
import endpoints from '../config/api/endpoints'

class Home extends Component {
    constructor(props){
        super(props)
        this.state = {
            articles: [],
            articleData: {title:'', body:''},
            authOption: 1,
            redirectedFromRegister: false,
            errMsg: '',
            isLoadingArticles: false,
            isCreateArticle: false,
            isLikeArticle: false
        }
        this.fetchArticles = this.fetchArticles.bind(this)
        this.likeArticle = this.likeArticle.bind(this)
        this.createArticle = this.createArticle.bind(this)
        this.handleInput = this.handleInput.bind(this)
        this.setOption = this.setOption.bind(this)
        this.setRedirectedFromRegister = this.setRedirectedFromRegister.bind(this)
    }

    componentDidMount() {
        this.fetchArticles()
    }
    componentWillUnmount(){
        this.setState({articles: []})
    }

    fetchArticles = async () => {
        try {
            this.setState({...this.state, isLoadingArticles: true})
            const res = await axios.get(`${endpoints.articleEndpoint}/list`)
            this.setState({...this.state, articles: res.data, isLoadingArticles: false})
        } catch (error) {
            this.setState({...this.state, isLoadingArticles: false})
            console.log(error)            
        }
    }

    likeArticle = async id => {
        try {
            this.setState({...this.state, isLikeArticle:true})
            await axios.put(`${endpoints.articleEndpoint}/article/${id}/like`, {}, {headers: {'Authorization': `Bearer ${this.props.user?.token}`}})
            const index = this.state.articles.findIndex(article => article.id === id)
            const articles = this.state.articles
            articles[index].likes++
            this.setState({...this.state, articles, isLikeArticle:false})
        } catch (error) {
            this.setState({...this.state, isLikeArticle:false})
            console.log(error)
        }
    }
    createArticle = async e => {
        e.preventDefault()
        try {
            this.setState({...this.state, isCreateArticle:true})

            const res = await axios.post(`${endpoints.articleEndpoint}/create`, {...this.state.articleData, user: this.props.user?.user}, {
                headers: {'Authorization': `Bearer ${this.props.user?.token}`}
            })
            const articles = this.state.articles
            articles.push(res.data)
            articles.sort((a,b) => b.id - a.id)
            this.setState({...this.state, articles, articleData: {title:'', body:''}, errMsg: '', isCreateArticle:false})
        } catch (error) {
            if(error.response?.data?.message){
                this.setState({...this.state, errMsg: error.response.data.message, isCreateArticle:false})
            }else{
                this.setState({...this.state, isCreateArticle:false})
            }
            console.log(error)
        }
    }
    handleInput = e => {
        this.setState({articleData: {...this.state.articleData, [e.target.name]: e.target.value }})
    }


    // Set Login/Register Option
    setOption = val => this.setState({authOption: val})
    setRedirectedFromRegister = val => this.setState({redirectedFromRegister: val})


    render() {
        return (
            <div className='container'>
                <div className='row'>
                    {
                        this.props.user?.user
                        ?  <>
                            <div className='welcome'>
                                <small>Welcome {this.props.user.user}</small><br/>
                                <small className='btn' onClick={this.props.logoutUser}>Logout</small>
                            </div>
                            <div className='form-container'>
                            {this.state.errMsg && <small className="mb-1 mt-1 color-red">{this.state.errMsg}</small>}
                                <small className='mb-1'>Post something..</small>
                                <form className="form" onSubmit={e=>this.createArticle(e)}>
                                        <input className='w-100' type='text' name='title' placeholder='Title' onChange={e=>this.handleInput(e)} value={this.state.articleData.title} />
                                        <textarea className="w-100 noresize" cols={10} rows={5} placeholder="Your Post.."
                                            onChange={e=>this.handleInput(e)} name="body" value={this.state.articleData.body}></textarea>
                                        <div>
                                            <input type="submit" value='Post' disabled={this.state.isCreateArticle} />
                                        </div>
                                </form>
                            </div>
                        </>
                        : <>
                            <div className='welcome'>
                                {
                                    this.state.redirectedFromRegister 
                                    ? <p>Your account have been created successfully. Login now!</p>
                                    :
                                    <small>You are browsing this Blog anonymously, you can read and like posts but you can't add comments or create posts. <br/>
                                        <span className='color-red pointer' onClick={()=>this.setOption(1)}>Login </span>
                                        Or <span className='color-red pointer' onClick={()=>this.setOption(0)}>Register </span>
                                        and get started now.
                                    </small>
                                }
                            </div>
                            <div className='form-container'>
                                {
                                    this.state.authOption === 1 ? <Login setOption={this.setOption} /> : <Register setRedirected={this.setRedirectedFromRegister} setOption={this.setOption} />
                                }
                            </div>
                        </>
                    }
                    {
                        this.state.isLoadingArticles 
                        ? <ArticlesSkeleton arrayItems={4} />
                        :
                            this.state.articles?.length
                            ? this.state.articles.map(article => (
                                <div key={article.id} className='article'>
                                    <Link to={`/article?id=${article.id}`} className='article-top'>
                                        <span className="fas fa-user mr-1"></span>
                                        <small>{article.user?.name?.toUpperCase() || article.user?.email}</small>
                                        <br />
                                        <h3>{article.title}</h3>
                                        <p>{article.body?.length > 255 ? article.body.substring(0, 255) + '...' : article.body }</p>
                                    </Link>

                                    
                                    <div className='article-bottom'>
                                        <div className='d-flex between center'>
                                            <small className='likes' onClick={() => this.state.isLikeArticle ? null : this.likeArticle(article.id)}>
                                                <span className='fas fa-heart mr-1'></span>
                                                {article.likes}
                                            </small><br/>
                                            {
                                                article.comments?.length
                                                ? <small>
                                                    <Link to={`/article?id=${article.id}`}>
                                                        {article.comments?.length > 1 ? article.comments?.length+' Comments' : article.comments?.length+' Comment'} 
                                                    </Link>
                                                </small>
                                                : ''
                                            }
                                        </div>
                                        <small>{article.createdAt?.date.split('.')[0]}</small>
                                    </div>
                                </div>
                            ))
                            : <div className='article no-data'>
                                <p>No articles.</p>
                              </div>

                    }
                </div>
            </div>
        )
    }
}



const mapStateToProps = (state) => ({
    user: state.auth.user,
});
const mapDispatchToProps = { logoutUser }

export default connect(mapStateToProps, mapDispatchToProps)(Home)
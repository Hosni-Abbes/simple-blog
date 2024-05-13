import React, { Component } from "react"
import { connect } from "react-redux"
import { Link } from "react-router-dom"
import axios from "../config/api/axios"
import NotFound from "./NotFound"
import ArticlesSkeleton from "./ArticlesSkeleton"
import endpoints from "../config/api/endpoints"

class Article extends Component {
    constructor(props){
        super(props)
        this.state = {
            article: {},
            commentText: '',
            showComments: false,
            addComment: false,
            notAuth: false,
            notFound: false,
            errMsg:'',
            isLoading: false,
            isLikeArticle: false,
            isLikeComment: false
        }
        this.getArticle = this.getArticle.bind(this)
        this.likeArticle = this.likeArticle.bind(this)
        this.handleInput = this.handleInput.bind(this)
        this.createComment = this.createComment.bind(this)
        this.likeComment = this.likeComment.bind(this)
    }

    componentDidMount(){
        const id = window.location.search?.split('?id=')[1]
        this.getArticle(id)
    }
    componentWillUnmount(){ 
        this.setState({
            article: {},
            commentText: '',
            showComments: false,
            addComment: false,
        })
    }

    getArticle = async id => {
        try {
            const res = await axios.get(`${endpoints.articleEndpoint}/article/${id}`, {headers: {'Authorization': `Bearer ${this.props.user?.token}`}})
            this.setState({...this.state, article: res.data, notAuth: false})
        } catch (error) {
            if(error.response?.status === 404) {
                this.setState({...this.state, notFound: true})
            }else if (error.response?.status === 401) {
                this.setState({...this.state, notAuth: true})
            }else {
                console.log(error)
            }
        }
    }
    likeArticle = async id => {
        try {
            this.setState({isLikeArticle: true})
            await axios.put(`${endpoints.articleEndpoint}/article/${id}/like`, {}, {headers: {Authorization: `Bearer ${this.props.user?.token}`}})
            const article = this.state.article
            article.likes++
            this.setState({...this.state, article, isLikeArticle:false})
        } catch (error) {
            this.setState({isLikeArticle: false})
            console.log(error)
        }
    }
    createComment = async (e, id) => {
        e.preventDefault()
        const body = {
            text:this.state.commentText,
            article: id,
            user: this.props.user?.user
        }
        try {
            this.setState({isLoading: true})
            const res = await axios.post(`${endpoints.commentEndpoint}/create`, body, {headers:
                {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${this.props.user?.token}`
                }
            })
            let article = this.state.article
            article.comments.push(res.data)
            this.setState({...this.state, article, commentText:'', isLoading: false, errMsg: ''})
        } catch (error) {
            if(error.response?.data?.message){
                this.setState({...this.state, errMsg: error.response.data.message})
            }
            this.setState({isLoading: false})
            console.log(error)
        }
    }
    likeComment = async id => {
        try {
            this.setState({...this.state, isLikeComment: true})
            const res = await axios.put(`${endpoints.commentEndpoint}/comment/like`, {comment: id}, {headers: {'Authorization': `Bearer ${this.props.user?.token}`}})
            const article = this.state.article
            const index = article.comments?.findIndex(c => c.id === res.data.id)
            article.comments[index].likes++
            this.setState({...this.state, article, isLikeComment:false})
        } catch (error) {
            console.log(error)
            this.setState({...this.state, isLikeComment:false})
        }
    } 
    handleInput = e => {
        this.setState({commentText: e.target.value})
    }
    
    
    render(){
        return (
            this.state.notAuth
            ? <div className="container">
                  <div className="message-container text-center">
                        You are not authorized. <Link className="color-red" to='/'>Login</Link>
                  </div>
              </div>
            : this.state.notFound 
                ? <NotFound />
                : Object.keys(this.state.article).length
                    ? (
                        <div className="container">
                            <div className='article' style={{maxHeight:'none', height:'auto'}}>
                                <div className='article-top'>
                                    <Link to='/' className="go-back fas fa-arrow-left">BACK</Link>
                                    <span className="fas fa-user mr-1"></span>
                                    <small>{this.state.article.user?.name?.toUpperCase() || this.state.article.user?.email}</small>
                                    <br />
                                    <h3 className="mb-1 mt-1">{this.state.article.title}</h3>
                                    <small className="">{this.state.article.createdAt?.date.split('.')[0].substring(0,16)}</small>
                                    <p>{ this.state.article.body }</p>
                                </div>
                                <div className='article-bottom'>
                                    <small className='likes' onClick={() => this.state.isLikeArticle ? null : this.likeArticle(this.state.article.id)}>
                                        <span className='fas fa-heart mr-1'></span>
                                        {this.state.article.likes}
                                    </small><br/>
                                </div>
                                {
                                    this.state.article?.comments?.length
                                    ? <>
                                        <small className="mt-1 pointer" onClick={()=>this.setState({showComments: !this.state.showComments})}>
                                            {
                                                this.state.showComments 
                                                ? 'Hide Comments'
                                                : `Show ${this.state.article.comments.length} Comment..`
                                            }
                                            
                                        </small>
                                        <div className={this.state.showComments ? "comments d-block" : "comments d-none"}>
                                            {
                                                this.state.article.comments.map(comment => (
                                                    <div key={comment.id} className="comment">
                                                        <span className="fas fa-user mr-1"></span>
                                                        <small>{comment.user.name?.toUpperCase() || comment.user.email}</small>
                                                        <br />
                                                        <small className="">{comment.createdAt?.date.split('.')[0].substring(0,16)}</small>
                                                        <p>{comment.text}</p>
                                                        <small className='likes' onClick={() => this.state.isLikeComment ? null : this.likeComment(comment.id)}>
                                                            <span className='fas fa-heart mr-1'></span>
                                                            {comment.likes}
                                                        </small><br/>
                                                    </div>
                                                ))
                                            }
                                            {this.state.errMsg && <small className="mb-1 mt-1 color-red">{this.state.errMsg}</small>}
                                            <form className="form" onSubmit={e=>this.createComment(e, this.state.article.id)}>
                                                <textarea className="noresize" cols={10} rows={5} placeholder="Your comment.."
                                                    onChange={e=>this.handleInput(e)} name="text" value={this.state.commentText}></textarea>
                                                <div>
                                                    <input type="submit" value='Comment' disabled={this.state.isLoading} />
                                                </div>
                                            </form>
                                        </div>
                                    </>
                                    : <>
                                        <small className="mt-1 pointer" onClick={()=>this.setState({addComment: !this.state.addComment})}>
                                            { !this.state.addComment && "Add comment.." }
                                        </small>
                                        <div className={this.state.addComment ? 'd-block' : 'd-none'}>
                                            {this.state.errMsg && <small className="mb-1 mt-1 color-red">{this.state.errMsg}</small>}
                                            <form className="form" onSubmit={e=>this.createComment(e, this.state.article.id)}>
                                                <textarea className="noresize" cols={10} rows={5}placeholder="Your comment.."
                                                    onChange={e=>this.handleInput(e)} name="text" value={this.state.commentText}></textarea>
                                                <div>
                                                    <input type="submit" value='Comment' disabled={this.state.isLoading} />
                                                </div>
                                            </form>
                                        </div>
                                    </>
                                }
                            </div>
                        </div>
                    )
                    : <div className="container">
                        <ArticlesSkeleton arrayItems={1} />
                    </div>


        )
    }
}


const mapStateToProps = (state) => ({
    user: state.auth.user,
});

export default connect(mapStateToProps)(Article)
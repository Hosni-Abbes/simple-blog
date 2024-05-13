import { Component } from "react";

export default class ArticlesSkeleton extends Component {
    constructor(props){
        super(props)
    }

    render(){
        return (
            <div className="row">
                {
                    Array.from(Array(this.props.arrayItems)).map((item, i) => (
                        <div key={i} className='article article-skeleton'>
                            <span className="title"></span>
                            <span className="body"></span>
                            <span className="body"></span>
                            <span className="body"></span>
                            <span className="body"></span>
                            <div className='article-skeleton-bottom d-flex between'>
                                <span></span>
                                <span></span>
                            </div>
                        </div>
                    ))
                }
            </div>
        )
    }
}


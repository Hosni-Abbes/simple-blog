import { Routes, Route} from 'react-router-dom'
import Home from "./Components/Home";
import Article from './Components/Article';
import NotFound from './Components/NotFound';
import { Component } from 'react';
import { connect } from 'react-redux';

class App extends Component {

    render(){
        return (
            <Routes>
                <Route path='/' element={ <Home /> } />
                <Route path='/article' element={ <Article /> } />
                <Route path='/*' element={ <NotFound /> } />
                
            </Routes>
        )
    };
}

const mapStateToProps = (state) => ({
    user: state.auth.user,
});
export default connect(mapStateToProps)(App);

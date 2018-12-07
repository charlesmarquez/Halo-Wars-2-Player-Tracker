import React from 'react';
import ReactDOM from 'react-dom';
import './index.css';
import * as serviceWorker from './serviceWorker';
import App from './components/Tracker/App';
import {BrowserRouter, Route} from "react-router-dom";

ReactDOM.render(
    <BrowserRouter>
        <Route exact path='/' component={App}/>
        {/* <Route path='/charleslol' component={ReactTable}/> */}
</BrowserRouter>, document.getElementById('root'));

// If you want your app to work offline and load faster, you can chadbnge
// unregister() to register() below. Note this comes with some pitfalls. Learn
// more about service workers: http://bit.ly/CRA-PWA
serviceWorker.unregister();

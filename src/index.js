import React from 'react';
import ReactDOM from 'react-dom';
import App from './App';
import BeleafsRoot from './BeleafsRoot'
import Home from './Home'
import './index.css';
import { Router, Route, IndexRoute, browserHistory } from 'react-router'


ReactDOM.render((
  <Router history={browserHistory}>
    <Route path="/" component={App}>
      <Route path="spans/:spanKey(/:editMode)" component={BeleafsRoot}/>
      <IndexRoute component={Home} />
    </Route>
  </Router>
), document.getElementById('root'))
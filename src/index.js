import React from 'react';
import ReactDOM from 'react-dom';
import App from './App';
import BeleafsRoot from './BeleafsRoot'
import './index.css';
import { Router, Route, IndexRoute, browserHistory } from 'react-router'


ReactDOM.render((
  <Router history={browserHistory}>
    <Route path="/" component={App}>
      <Route path=":spanKey(/:editMode)" component={BeleafsRoot}/>
      <IndexRoute component={BeleafsRoot} />
    </Route>
  </Router>
), document.getElementById('root'))
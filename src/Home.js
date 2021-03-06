//@flow
import firebase from 'firebase'
import ReactFireMixin from 'reactfire'
import React, { Component } from 'react'
import PropTypes from 'prop-types';
import reactMixin from 'react-mixin'
import { Link } from 'react-router'
import {FBSpan} from './types'
import _ from 'lodash';
import './Home.css';

export default class Home extends Component<$FlowFixMeProps, {
  spans: {[key: string]: FBSpan},
  spansRef: Object,
}> {
  bindAsArray: Function;
  bindAsObject: Function;
  firebaseRefs: Object;

  static contextTypes = {
    userData: PropTypes.object,
  };

  componentWillMount() {
    const spansRef = firebase.database().ref('beleafs/spans')
    this.bindAsObject(spansRef, 'spans')
    this.setState({spansRef})
  }

  onAddClicked(e: Object) {
    const newSpanRef = this.state.spansRef.push({title: ''});
    this.props.router.push(`/spans/${newSpanRef.key}/edit`);
  }

  render() {
    const {userData} = this.context;
    return (
      <div>
        <h1>Welcome {userData && userData.email} to a very early prototype. </h1>
        <ul>
          {_.map(this.state.spans, ((span, key) => 
            key !== '.key' && <div key={key}>
              <li><b>{span.title || 'Untitled'}</b> <Link to={`/spans/${key}`}>view</Link> or <Link to={`/spans/${key}/edit`}>edit</Link></li>
            </div>
          ))}
          <button onClick={this.onAddClicked.bind(this)}>{`Create New Span`}</button>       
        </ul>
      </div>
    );
  }
}
reactMixin(Home.prototype, ReactFireMixin)

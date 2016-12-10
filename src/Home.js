//@flow
import firebase from 'firebase'
import ReactFireMixin from 'reactfire'
import React, { Component } from 'react'
import reactMixin from 'react-mixin'
import { Link } from 'react-router'
import {FBSpan} from './types'
import _ from 'lodash';

export default class Home extends Component {
  bindAsArray: Function;
  bindAsObject: Function;
  firebaseRefs: Object;

  state : {
    spans: {[key: string]: FBSpan},
    spansRef: Object,
  };
  
  static contextTypes = {
    userData: React.PropTypes.object,
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
        Welcome {userData && userData.email} to a very early prototype of Belief Trees. 
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

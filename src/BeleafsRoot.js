//@flow
import firebase from 'firebase';
import ReactFireMixin from 'reactfire';
import React, { Component } from 'react';
import reactMixin from 'react-mixin'

class Beleafs extends Component {

  render() {
    var _this = this;
    var createItem = function(vertice, index) {
      return (
        <li key={ index }>
          { vertice.text }
          <span onClick={ _this.props.removeItem.bind(null, vertice['.key']) }
                style={{ color: 'red', marginLeft: '10px', cursor: 'pointer' }}>
            X
          </span>
        </li>
      );
    };
    return <ul>{ this.props.vertices.map(createItem) }</ul>;
  }
}

class ReactFireMixinComponent extends Component {
  bindAsArray: Function;
  firebaseRefs: Object;
  state: Object;
}

class BeleafsRoot extends ReactFireMixinComponent{

  state = {
    vertices: [], 
    text: ''
  }

  componentWillMount() {
    var firebaseRef = firebase.database().ref('beleafs/vertices');
    this.bindAsArray(firebaseRef.limitToLast(25), 'vertices');
  }

  onChange(e: Object) {
    this.setState({text: e.target.value});
  }

  removeItem(key: string) {
    var firebaseRef = firebase.database().ref('beleafs/vertices');
    firebaseRef.child(key).remove();
  }

  handleSubmit(e: Object) {
    e.preventDefault();
    if (this.state.text && this.state.text.trim().length !== 0) {
      this.firebaseRefs['vertices'].push({
        text: this.state.text
      });
      this.setState({
        text: ''
      });
    }
  }

  render() {
    return (
      <div>
        <Beleafs vertices={ this.state.vertices } removeItem={ this.removeItem } />
        <form onSubmit={ this.handleSubmit.bind(this) }>
          <input onChange={ this.onChange.bind(this) } value={ this.state.text } />
          <button>{ `I Beleaf it! (#${this.state.vertices.length + 1})`}</button>
        </form>
      </div>
    );
  }
}
reactMixin(BeleafsRoot.prototype, ReactFireMixin)

export default BeleafsRoot
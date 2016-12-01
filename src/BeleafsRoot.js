//@flow
import firebase from 'firebase';
import ReactFireMixin from 'reactfire';
import React, { Component } from 'react';
import reactMixin from 'react-mixin'
import './BeleafsRoot.css';


type Vertice = {
  '.key': string,
  text: string,
};

class Beleafs extends Component {

  props: {
    removeItem: Function,
    vertices: Array<Vertice>,
  };

  render() {
    var createItem = (vertice, index) => {
      return (
        <li key={ index }>
          { vertice.text }
          <span className="delete" onClick={ this.props.removeItem.bind(null, vertice['.key']) }>
            X
          </span>
        </li>
      );
    };
    return <ul>{ this.props.vertices.map(createItem) }</ul>;
  }
}


class BeleafsRoot extends Component {
  bindAsArray: Function;
  firebaseRefs: Object;
  state: {
    vertices: Array<Vertice>,
    text: string,
  };

  constructor() {
    super();
    this.state = {
      vertices: [], 
      text: ''
    }
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
      <div className="beleafsRoot">
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
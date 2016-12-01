//@flow
import firebase from 'firebase';
import ReactFireMixin from 'reactfire';
import React, { Component } from 'react';
import reactMixin from 'react-mixin'
import './BeleafsRoot.css';

type Vertice = {
  '.key': string,
  text: string,
  children: ?Array<Vertice>,
};

class Beleafs extends Component {

  props: {
    addItem: Function,
    removeItem: Function,
    vertices: Array<Vertice>,
  };

  state: {
    text: string,
  };
  constructor(props) {
    super();
    this.state = {
      text: ''
    }
  }

  onAddItemClicked(e) {
    e.preventDefault(); 
    this.props.addItem(this.state.text); 
    this.setState({text: ''});
  }

  render() {
    return (
      <ul>
        {this.props.vertices.map((vertice, index) => 
        <li key={ index }>
            { vertice.text }
            <span className="delete" onClick={ this.props.removeItem.bind(null, vertice['.key']) }>
              X
            </span>
            {vertice.children && <Beleafs vertices={vertice.children} addItem={this.props.addItem} removeItem={this.props.removeItem} />}
            
        </li>
        )
      }
      <form onSubmit={this.onAddItemClicked.bind(this)}>
        <input onChange={(e)=>this.setState({text: e.target.value})} value={ this.state.text } />
        <button>{ `I Beleaf it! (#${this.props.vertices.length + 1})`}</button>
      </form>
      </ul>
    );
  }
}


class BeleafsRoot extends Component {
  bindAsArray: Function;
  firebaseRefs: Object;
  state: {
    vertices: Array<Vertice>,
  };

  constructor() {
    super();
    this.state = {
      vertices: [], 
    }
  }

  componentWillMount() {
    var firebaseRef = firebase.database().ref('beleafs/vertices');
    this.bindAsArray(firebaseRef.limitToLast(25), 'vertices');
  }

  addItem(text: string) {
    if(text && text.length > 0)
      this.firebaseRefs['vertices'].push({
        text: text
      });
  }

  removeItem(key: string) {
    var firebaseRef = firebase.database().ref('beleafs/vertices');
    firebaseRef.child(key).remove();
  }

  render() {
    return (
      <div className="beleafsRoot">
        <Beleafs vertices={ this.state.vertices } addItem={this.addItem.bind(this)} removeItem={ this.removeItem.bind(this) } />
      </div>
    );
  }
}
reactMixin(BeleafsRoot.prototype, ReactFireMixin)

export default BeleafsRoot
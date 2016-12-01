//@flow
import firebase from 'firebase';
import ReactFireMixin from 'reactfire';
import React, { Component } from 'react';
import reactMixin from 'react-mixin'
import './BeleafsRoot.css';
import _ from 'lodash';

type TreeVertice = {
  '.key': string,
  text: string,
  children: ?Array<TreeVertice>,
};

class Beleafs extends Component {

  props: {
    addItem: Function,
    removeItem: Function,
    treeVertices: Array<TreeVertice>,
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
        {this.props.treeVertices.map((treeVertice, index) => 
        <li key={ index }>
            { treeVertice.text }
            <span className="delete" onClick={ this.props.removeItem.bind(null, treeVertice['.key']) }>
              X
            </span>
            {treeVertice.children && treeVertice.children.length > 0 && 
              <Beleafs treeVertices={treeVertice.children} addItem={this.props.addItem} removeItem={this.props.removeItem} />
            }
            
        </li>
        )
      }
      <form onSubmit={this.onAddItemClicked.bind(this)}>
        <input onChange={(e)=>this.setState({text: e.target.value})} value={ this.state.text } />
        <button>{ `I Beleaf it! (#${this.props.treeVertices.length + 1})`}</button>
      </form>
      </ul>
    );
  }
}


class BeleafsRoot extends Component {
  bindAsArray: Function;
  bindAsObject: Function;
  firebaseRefs: Object;

  state: {
    vertices: {},
    edges: {},
  };

  constructor() {
    super();
    this.state = {
      vertices: {}, 
      edges: {}, 
    }
  }

  componentWillMount() {
    this.bindAsObject(firebase.database().ref('beleafs/vertices'), 'vertices');
    this.bindAsObject(firebase.database().ref('beleafs/edges'), 'edges');
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

  //just flatten into a single array, for now. In the near future we should turn a list of edges and vertices into a graph structure
  treeFromData(vertices, edges) : Array<TreeVertice> {
    const allVertices = _.filter(_.map(this.state.vertices, (v, k) => {
      if(k !== '.key')
        return {
          '.key': k, 
          text: v.text,
          children: []
        }
    }), (v) => v);
    return allVertices;
  }

  render() {
    console.dir(this.state)
    const treeData = this.treeFromData(this.state.vertices, this.state.edges);
    console.dir(treeData)
    return (
      <div className="beleafsRoot">
        <Beleafs treeVertices={treeData} addItem={this.addItem.bind(this)} removeItem={ this.removeItem.bind(this) } />
      </div>
    );
  }
}
reactMixin(BeleafsRoot.prototype, ReactFireMixin)

export default BeleafsRoot
import React, { Component } from 'react';
import beleaf_header from './assets/beleaf_in_yourself.jpg';
import './App.css';
import firebase from 'firebase';
import ReactFireMixin from 'reactfire';

var Beleafs = React.createClass({
  render: function() {
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
});

var BeleafsRoot = React.createClass({
  mixins: [ReactFireMixin],

  getInitialState: function() {
    return {
      vertices: [],
      text: ''
    };
  },

  componentWillMount: function() {
    var firebaseRef = firebase.database().ref('beleafs/vertices');
    this.bindAsArray(firebaseRef.limitToLast(25), 'vertices');
  },

  onChange: function(e) {
    this.setState({text: e.target.value});
  },

  removeItem: function(key) {
    var firebaseRef = firebase.database().ref('beleafs/vertices');
    firebaseRef.child(key).remove();
  },

  handleSubmit: function(e) {
    e.preventDefault();
    if (this.state.text && this.state.text.trim().length !== 0) {
      this.firebaseRefs['vertices'].push({
        text: this.state.text
      });
      this.setState({
        text: ''
      });
    }
  },

  render: function() {
    return (
      <div>
        <Beleafs vertices={ this.state.vertices } removeItem={ this.removeItem } />
        <form onSubmit={ this.handleSubmit }>
          <input onChange={ this.onChange } value={ this.state.text } />
          <button>{ `I Beleaf it! (#${this.state.vertices.length + 1})`}</button>
        </form>
      </div>
    );
  }
});

class App extends Component {
  
  componentWillMount() {
    var config = {
        apiKey: "AIzaSyCj-OgHro-jA6r5CxfITVHJh52gCM9crP8",
        authDomain: "beleafs-6f378.firebaseapp.com",
        databaseURL: "https://beleafs-6f378.firebaseio.com"
      };
    firebase.initializeApp(config);
  }

  render() {
    return (
      <div className="App">
        <div className="App-header">
          <img src={beleaf_header} alt="beleaf in yourself!"/>
        </div>
        <h2>What do you Beleaf?</h2>
        <BeleafsRoot/>
      </div>
    );
  }
}

export default App;

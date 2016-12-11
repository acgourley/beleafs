//@flow
import React, { Component } from 'react'
import './App.css';
import firebase from 'firebase'
import { Link } from 'react-router'
import Nav from './Nav'

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
      <div id="container">
        <Nav>
        {this.props.children}
        </Nav>
      </div>
    );
  }

}

export default App;

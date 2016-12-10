//@flow
import React, { Component } from 'react';
import beleaf_header from './assets/beleaf_in_yourself.jpg';
import './App.css';
import firebase from 'firebase';
import { Link } from 'react-router'

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
          <Link to="/"><img src={beleaf_header} alt="beleaf in yourself!"/></Link>
        </div>
        {this.props.children}
      </div>
    );
  }

}

export default App;

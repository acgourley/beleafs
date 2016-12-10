//@flow
import firebase from 'firebase'
import ReactFireMixin from 'reactfire'
import React, { Component } from 'react'
import reactMixin from 'react-mixin'
import _ from 'lodash';

export default class Nav extends Component {
  bindAsArray: Function;
  bindAsObject: Function;
  firebaseRefs: Object;

  state : {
    userData: ?Object,
  };
  
  static childContextTypes = {
    userData: React.PropTypes.object,
  };

  constructor(){
    super();
    this.state = {
      userData: null,
    }
  }

  getChildContext() {
    return {userData: this.state.userData};
  }

  componentWillMount() {
    firebase.auth().onAuthStateChanged((user) => {
      if (user) {
        this.setState({userData: user})
      } else {
        // No user is signed in.
      }
    });
  }

  logout(e) {
    firebase.auth().signOut().then(result => {
      this.setState({userData: null})
    });
  }
  login(e){
    console.log('login')
    var provider = new firebase.auth.GoogleAuthProvider();
    firebase.auth().signInWithPopup(provider).then((result) => {
      //var token = result.credential.accessToken;
      var user = result.user;
      console.log('Logged in with user', user)
      this.setState({userData: user});
    }).catch((error) => {
      console.log('Logged in with ERROR', error)
      //var errorCode = error.code;
      //var errorMessage = error.message;
      //var email = error.email;
      //var credential = error.credential;
    });
  }
  render() {
    const {userData} = this.state;
    return (
      <div className="App">
        {userData && <button onClick={this.logout.bind(this)}>Log out {userData.email}</button>}
        {!userData && <button onClick={this.login.bind(this)}>Login</button>}
        {this.props.children}
      </div>
    );
  }
}
reactMixin(Nav.prototype, ReactFireMixin)

//@flow
import firebase from 'firebase'
import ReactFireMixin from 'reactfire'
import React, { Component } from 'react'
import reactMixin from 'react-mixin'
import _ from 'lodash';
import './Nav.css';
import telescopeIcon from './assets/telescope1.svg'
import helmetIcon from './assets/helmet1.svg'
import { Link } from 'react-router'

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
      <div>
        <div id="nav">
          <Link to="/" ><div className="logo"><span className="word1">Belief</span> <span className="word2">Space</span></div></Link>
          <Link to="" onClick={this.login.bind(this)}><div className="navButton">
            <img src={helmetIcon}/>
            <span>login</span>
          </div></Link>

          <Link to="/"><div className="navButton">
            <img src={telescopeIcon}/>
            <span>explore</span>
          </div></Link>
        </div>

        {/*<br/>
        {userData && <button onClick={this.logout.bind(this)}>Log out {userData.email}</button>}
        {!userData && <button onClick={this.login.bind(this)}>Login</button>}*/}
        {this.props.children}
      </div>
    );
  }
}
reactMixin(Nav.prototype, ReactFireMixin)

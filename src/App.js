//@flow
import firebase from 'firebase'
import ReactFireMixin from 'reactfire'
import React, { Component } from 'react'
import reactMixin from 'react-mixin'
import _ from 'lodash';
import './App.css';
import telescopeIcon from './assets/telescope1.svg'
import helmetIcon from './assets/helmet1.svg'
import githubIcon from './assets/github.svg'
import { Link } from 'react-router'
import mode5Logo from './assets/logo_mode5.svg'

class App extends Component {
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

  componentWillMount() {
    var config = {
        apiKey: "AIzaSyCj-OgHro-jA6r5CxfITVHJh52gCM9crP8",
        authDomain: "beleafs-6f378.firebaseapp.com",
        databaseURL: "https://beleafs-6f378.firebaseio.com"
      };
    firebase.initializeApp(config);
    firebase.auth().onAuthStateChanged((user) => {
      if (user) {
        this.setState({userData: user})
      } else {
        // No user is signed in.
      }
    });
  }

  getChildContext() {
    return {userData: this.state.userData};
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
      <div id="NavContentFooter">
        <div id="nav">
          {/*<Link to="/" ><div className="logo"><span className="word1">Belief</span> <span className="word2">Space</span></div></Link>*/}
          <Link to="/" ><img className="mode5logo" src={mode5Logo}></img></Link>
          {!userData && <Link to="" onClick={this.login.bind(this)}><div className="navButton">
            <img src={helmetIcon}/>
            <span>login</span>
          </div></Link>}
          {userData && <Link to="" onClick={this.logout.bind(this)}><div className="navButton">
            <img src={helmetIcon}/>
            <span>logout</span>
          </div></Link>}
          <Link to="/"><div className="navButton">
            <img src={telescopeIcon}/>
            <span>explore</span>
          </div></Link>
        </div>
        <div id="content">
          {this.props.children}
        </div>
        <div id="footer">
          <a href="https://github.com/acgourley/beleafs" className="github"><img src={githubIcon}/></a>
        </div>
      </div>
    );
  }
}

reactMixin(App.prototype, ReactFireMixin)
export default App;

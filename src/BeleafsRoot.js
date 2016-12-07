//@flow
import firebase from 'firebase';
import ReactFireMixin from 'reactfire';
import React, { Component } from 'react';
import reactMixin from 'react-mixin'
import './BeleafsRoot.css';
import _ from 'lodash';

/* 

Firebase Schema 

  spans: {
    {0: {
      title: "...",
      rootVerticeKey: 0,
      vertices: {
        0: {
          statement: "...",
          description: "...",
          children: [1, 2, ...]
        },
        ...
      },
    },
    ...
  }

*/

/* Flow Types */

type FBVertice = {
  '.key': ?string,
  statement: string,
  description: string,
  childrenKeys: ?{[key: string] : string}
};

type FBSpan = {
  '.key': string,
  title: string,
  rootVerticeKey: string,
  vertices: {[key: string] : FBVertice}
};

class VerticeComponent extends Component {
  /* Flow Types */
  props: {
    addVertice: Function,
    removeVertice: Function,
    vertice: FBVertice,
    parent: ?FBVertice,
    span: FBSpan,
    verticeKey: string,
    parentKey: ?string,
  };

  state: {
    newChildText: string;
  };

  onAddClicked(e) {
    e.preventDefault(); 
    this.props.addVertice({
      statement: this.state.newChildText,
      description: '',
      children: {},
    }, this.props.verticeKey); 
    this.setState({newChildText: ''});
  }

  constructor(props) {
    super();
    this.state = {
      newChildText: '',
    }
  }

  render() {
    const {addVertice, removeVertice, vertice, span, verticeKey, parentKey} = this.props;
    const {newChildText} = this.state;
    console.log('DEBUG: inside VerticeComponent with props: ', this.props)
    return (
      <div>
        <span>{vertice.statement + ' ' + vertice.description}</span>
        {parentKey && !_.keys(vertice.childrenKeys).length && 
          <span className="delete" onClick={ removeVertice.bind(null, verticeKey, parentKey) }>
            DELETE
          </span>
        }

        <ul>
          {<li>
            <form onSubmit={this.onAddClicked.bind(this)}>
              <input onChange={(e)=>this.setState({newChildText: e.target.value})} value={ newChildText } />
              <button>{ `I Beleaf it!`}</button>
            </form>
          </li>
          }
          {_.map(vertice.childrenKeys, (childVerticeKey: string) => 
            <li key={childVerticeKey}>
              {span.vertices[childVerticeKey] && <VerticeComponent parentKey={verticeKey} verticeKey={childVerticeKey} span={span} vertice={span.vertices[childVerticeKey]} addVertice={addVertice} removeVertice={removeVertice}/>        }
            </li>
          )}
        </ul>
      </div>
    );
  }
}

class SpanComponent extends Component {

  /* Flow Types */
  props: {
    addVertice: Function,
    removeVertice: Function,
    span: FBSpan,
  };

  state: {
  };

  constructor(props) {
    super();
    this.state = {
    }
  }

  render() {
    const {addVertice, removeVertice, span} = this.props;
    console.log('SpanComponent is in render() with props:', this.props)

    return (
      <div>
        <h3>{span.title}</h3>
        <VerticeComponent parentKey={null} verticeKey={span.rootVerticeKey} span={span} vertice={span.vertices[span.rootVerticeKey]} addVertice={addVertice} removeVertice={removeVertice}/>
      </div>
    );
  }
}


class BeleafsRoot extends Component {

  /* Flow Types (top ones for ReactFireMixin) */
  bindAsArray: Function;
  bindAsObject: Function;
  firebaseRefs: Object;
  state: {
    spans: {[key: string]: FBSpan},
  };

  constructor() {
    super();
    this.state = {
      spans: {}
    }
  }

  componentWillMount() {
    this.bindAsObject(firebase.database().ref('beleafs/spans'), 'spans');
  }

  addVertice(spanKey: string, vertice: FBVertice, parentVerticeKey: string) {
      const verticeToSave: FBVertice = {
        statement: vertice.statement,
        description: vertice.description,
        childrenKeys: {},
      }
      const savedVertice = firebase.database().ref(`beleafs/spans/${spanKey}/vertices`).push(verticeToSave);
      console.log('DEBUG: savedVertice.key is:', savedVertice.key);
      const parentVertice = firebase.database().ref(`beleafs/spans/${spanKey}/vertices/${parentVerticeKey}/childrenKeys`);
      const savedChildKey = parentVertice.push(savedVertice.key);
      console.log('DEBUG: savedChildKey is:', savedChildKey);

  }

  removeVertice(spanKey: string, verticeKey: string, parentVerticeKey: string) {
    //var firebaseRef = firebase.database().ref('beleafs/spans');
    //firebaseRef.child(key).remove();
    this.firebaseRefs.spans.child(spanKey).child('vertices').child(verticeKey).remove();
    const childrenKeys = this.firebaseRefs.spans.child(spanKey).child('vertices').child(parentVerticeKey).child('childrenKeys')
    childrenKeys.orderByValue().equalTo(verticeKey).on("value", function(snapshot) {
      console.log('snapshot:', snapshot)
      snapshot.forEach((data) => {
        console.log('data:', data);
        childrenKeys.child(data.key).remove();
      })
    });
  }

  render() {
    console.log('BeleafsRoot is in render() with state:', this.state)
    return (
      <div className="beleafsRoot">
        {_.map(this.state.spans, (span: FBSpan, spanKey: string) => 
          spanKey !== '.key' && <SpanComponent key={spanKey} span={span} 
            addVertice={(vertice, parentVerticeKey)=>this.addVertice(spanKey, vertice, parentVerticeKey)} 
            removeVertice={(verticeKey, parentVerticeKey)=>this.removeVertice(spanKey, verticeKey, parentVerticeKey)} />
        )}
      </div>
    );
  }
}
reactMixin(BeleafsRoot.prototype, ReactFireMixin)

export default BeleafsRoot
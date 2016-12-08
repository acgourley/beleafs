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
  /* Flow Types (top ones for ReactFireMixin) */
  bindAsArray: Function;
  bindAsObject: Function;
  firebaseRefs: Object;
  props: {
    addVertice: Function,
    removeVertice: Function,
    verticeKey: string,
    parentVerticeKey: ?string,
    verticesRef: Object,
  };

  state: {
    vertice: FBVertice;
  };

  constructor(props) {
    super();
    this.state = {
      vertice: {},
    }
  }

  componentWillMount() {
    this.bindAsObject(this.props.verticesRef.child(this.props.verticeKey), 'vertice');
  }

  onAddClicked(e) {
    e.preventDefault(); 
    this.props.addVertice({
      statement: '',
      description: '',
      children: {},
    }, this.props.verticeKey); 
  }

  onStatementChange(e) {
    this.props.verticesRef.child(this.props.verticeKey).child('statement').set(e.target.value);
  }

  render() {
    const {addVertice, removeVertice, verticesRef, verticeKey, parentVerticeKey} = this.props;
    const {vertice} = this.state;
    console.log('DEBUG: inside VerticeComponent with props: ', this.props)
    return (
      <div>
        <textarea cols={100} onChange={this.onStatementChange.bind(this)} value={ vertice.statement } />

        <button onClick={this.onAddClicked.bind(this)}>{ `Add Leaffriend`}</button>
        {parentVerticeKey && !_.keys(vertice.childrenKeys).length && 
          <span className="delete" onClick={ removeVertice.bind(null, verticeKey, parentVerticeKey) }>
            DELETE
          </span>
        }

        <ul>
          {_.map(vertice.childrenKeys, (childVerticeKey: string) => 
            <li key={childVerticeKey}>
              {<VerticeComponent parentVerticeKey={verticeKey} verticeKey={childVerticeKey} 
                verticesRef={verticesRef} addVertice={addVertice} removeVertice={removeVertice}/> 
              }
            </li>
          )}
        </ul>
      </div>
    );
  }
}
reactMixin(VerticeComponent.prototype, ReactFireMixin)

class SpanComponent extends Component {

  /* Flow Types (top ones for ReactFireMixin) */
  bindAsArray: Function;
  bindAsObject: Function;
  firebaseRefs: Object;
  props: {
    addVertice: Function,
    removeVertice: Function,
    spanRef: Object,
  };

  state: {
    span: FBSpan,
  };

  constructor(props) {
    super();
    this.state = {
      span: {},
    }
  }

  componentWillMount() {
    this.bindAsObject(this.props.spanRef, 'span');
  }

  render() {
    const {addVertice, removeVertice, spanRef} = this.props;
    const {span} = this.state;
    console.log('SpanComponent is in render() with props:', this.props)

    return (
      <div>
        <h3>{span.title}</h3>
        <VerticeComponent parentVerticeKey={null} 
          verticeKey={span.rootVerticeKey} verticesRef={spanRef.child('vertices')} 
          addVertice={addVertice} removeVertice={removeVertice}/>
      </div>
    );
  }
}
reactMixin(SpanComponent.prototype, ReactFireMixin)


class BeleafsRoot extends Component {

  /* Flow Types (top ones for ReactFireMixin) */
  bindAsArray: Function;
  bindAsObject: Function;
  firebaseRefs: Object;
  state: {
    spans: {[key: string]: FBSpan},
    spansRef: Object,
  };

  constructor() {
    super();
    this.state = {
      spans: {},
      spansRef: firebase.database().ref('beleafs/spans'),
    }
  }

  componentWillMount() {
    this.bindAsObject(this.state.spansRef, 'spans');
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
          spanKey !== '.key' && <SpanComponent key={spanKey} spanRef={this.state.spansRef.child(spanKey)} 
            addVertice={(vertice, parentVerticeKey)=>this.addVertice(spanKey, vertice, parentVerticeKey)} 
            removeVertice={(verticeKey, parentVerticeKey)=>this.removeVertice(spanKey, verticeKey, parentVerticeKey)} />
        )}
      </div>
    );
  }
}
reactMixin(BeleafsRoot.prototype, ReactFireMixin)

export default BeleafsRoot
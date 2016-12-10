//@flow
import firebase from 'firebase';
import ReactFireMixin from 'reactfire';
import React, { Component } from 'react';
import reactMixin from 'react-mixin'
import './BeleafsRoot.css';
import _ from 'lodash';
import {FBSpan, FBVertice} from './types'
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
          childrenKeys: {0: 1, 1: 2, ...}
        },
        ...
      },
    },
    ...
  }

*/


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
    editMode: ?boolean,
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
    const {addVertice, removeVertice, verticesRef, verticeKey, parentVerticeKey, editMode} = this.props;
    const {vertice} = this.state;


    /*let katexHTML = ""
    try {
      katexHTML = global.katex.renderToString( vertice.statement);//"c = \\pm\\sqrt{a^2 + b^2}");
    } catch (e) {
      console.log("error parsing tex:", e)
    }*/
    let processedStatement = vertice.statement;
    if(!editMode) {
      const re = /<katexmath>(.*?)<\/katexmath>/g;
      let m = ""
      do {
        m = re.exec(processedStatement);
        console.log('match:', m)
        if (m) {
            console.log(m[1]);
            processedStatement = processedStatement.replace(m[0], global.katex.renderToString(m[1]));
            console.log('replaced one math block, result:', processedStatement)
        }
      } while (m);

    }
    console.log('DEBUG: in VerticeComponent render with props:', this.props)
    const suffix = (vertice.childrenKeys && _.keys(vertice.childrenKeys).length > 0) ? '<b class="suffix">thus </b>' : ''
    return (
      <div className={'vertice' + (parentVerticeKey ? '' : ' rootVertice')} >
        <div>
          {_.map(vertice.childrenKeys, (childVerticeKey: string) => 
            <VerticeComponent parentVerticeKey={verticeKey} verticeKey={childVerticeKey} 
              verticesRef={verticesRef} addVertice={addVertice} removeVertice={removeVertice} editMode={editMode}/> 
          )}
        </div>
        {!editMode && <div className="verticeContent" dangerouslySetInnerHTML={{__html: suffix + processedStatement }}/>}

        {editMode && <textarea cols={100} onChange={this.onStatementChange.bind(this)} value={ vertice.statement } />}
        {editMode && <button onClick={this.onAddClicked.bind(this)}>{ `Add Leaffriend`}</button>}
        {editMode && parentVerticeKey && !_.keys(vertice.childrenKeys).length && 
          <span className="delete" onClick={ removeVertice.bind(null, verticeKey, parentVerticeKey) }>
            DELETE
          </span>
        }

        
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
    editMode: ?boolean,
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

  onTitleChange(e) {
    this.props.spanRef.child('title').set(e.target.value);
  }

  render() {
    const {addVertice, removeVertice, spanRef, editMode} = this.props;
    const {span} = this.state;
    console.log('DEBUG: in SpanComponent render with props:', this.props, 'and state', this.state)
    const ready = span && span.rootVerticeKey;
    if(editMode) {
      if(!span.rootVerticeKey) {
        console.log("adding root vertice")
         addVertice({}, null);
      }
    }
    return (
      <div>
        {ready && <div>
          {editMode && <div><span>Title:</span> <input value={span.title} onChange={this.onTitleChange.bind(this)}/></div> }
          {!editMode && <h3>{span.title}</h3>}
          <VerticeComponent parentVerticeKey={null} 
            verticeKey={span.rootVerticeKey} verticesRef={spanRef.child('vertices')} 
            addVertice={addVertice} removeVertice={removeVertice} editMode={editMode}/>
        </div>}
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
  props: {
    params: {
      spanKey: string,
      editMode: ?string,
    }
  }
  state: {
    span: ?FBSpan,
    spanRef: ?Object,
  };

  constructor() {
    super();
    this.state = {
      span: undefined,
      spanRef: undefined,
    }
  }

  componentWillMount() {
    const spanRef = firebase.database().ref('beleafs/spans').child(this.props.params.spanKey);
    this.bindAsObject(spanRef, 'span');
    this.setState({spanRef})
  }

  addVertice(spanKey: string, vertice: FBVertice, parentVerticeKey: ?string) {
    const verticeToSave: FBVertice = {
      statement: vertice.statement || '',
      description: vertice.description || '',
      childrenKeys: {},
    }

    const savedVerticeRef = this.firebaseRefs.span.child('vertices').push(verticeToSave);
    if(!this.state.span.rootVerticeKey) {
      this.firebaseRefs.span.child('rootVerticeKey').set(savedVerticeRef.key)
    }
    console.log('DEBUG: savedVertice.key is:', savedVerticeRef.key);
    if(parentVerticeKey) {
      const parentVerticeRef = this.firebaseRefs.span.child('vertices').child(parentVerticeKey).child('childrenKeys');
      const savedChildKey = parentVerticeRef.push(savedVerticeRef.key);
      console.log('DEBUG: savedChildKey is:', savedChildKey);
    }
  }

  removeVertice(spanKey: string, verticeKey: string, parentVerticeKey: string) {
    this.firebaseRefs.span.child(spanKey).child('vertices').child(verticeKey).remove();
    const childrenKeys = this.firebaseRefs.span.child('vertices').child(parentVerticeKey).child('childrenKeys')
    childrenKeys.orderByValue().equalTo(verticeKey).on("value", function(snapshot) {
      console.log('snapshot:', snapshot)
      snapshot.forEach((data) => {
        console.log('data:', data);
        childrenKeys.child(data.key).remove();
      })
    });
  }

  render() {
    const {params} = this.props;
    const {span} = this.state;
    const validSpan = span && _.has(span, 'title') //a blank string is a valid title so check with _.has
    const notFoundSpan = span && !_.has(span, 'title')
    const loadingSpan = !span;
    console.log('debug: rendering with span:', span, _.keys(span).length)
    return (
      <div className="beleafsRoot">
        {validSpan && <SpanComponent spanRef={this.state.spanRef} 
            addVertice={(vertice, parentVerticeKey)=>this.addVertice(params.spanKey, vertice, parentVerticeKey)} 
            removeVertice={(verticeKey, parentVerticeKey)=>this.removeVertice(params.spanKey, verticeKey, parentVerticeKey)}
            editMode={params.editMode} />
        }
        {loadingSpan && <p>Loading span...</p>}
        {notFoundSpan && <p>Could not load span <b>{params.spanKey}</b></p>}
      </div>
    );
  }
}
reactMixin(BeleafsRoot.prototype, ReactFireMixin)

export default BeleafsRoot
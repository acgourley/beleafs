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
    return (
      <div className="vertice" >
        <div>
          {_.map(vertice.childrenKeys, (childVerticeKey: string) => 
            <VerticeComponent parentVerticeKey={verticeKey} verticeKey={childVerticeKey} 
              verticesRef={verticesRef} addVertice={addVertice} removeVertice={removeVertice} editMode={editMode}/> 
          )}
        </div>
        {editMode && <textarea cols={100} onChange={this.onStatementChange.bind(this)} value={ vertice.statement } />}
        {!editMode && <div dangerouslySetInnerHTML={{__html: processedStatement }}/>}


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

  render() {
    const {addVertice, removeVertice, spanRef, editMode} = this.props;
    const {span} = this.state;
    console.log('DEBUG: in SpanComponent render with props:', this.props, 'and state', this.state)

    return (
      <div>
        {span && <div>
          <h3>{span.title}</h3>
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
      span: {},
      spanRef: null,
    }
  }

  componentWillMount() {
    if(!this.props.params.spanKey || this.props.params.spanKey.length === 0)
      this.props.params.spanKey = 'span0'; //hack
    const spanRef = firebase.database().ref('beleafs/spans').child(this.props.params.spanKey);
    this.bindAsObject(spanRef, 'span');
    this.setState({spanRef})
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
    const {params} = this.props;
    const validSpan = this.state.span && this.state.span.title;
    return (
      <div className="beleafsRoot">
        {validSpan && <SpanComponent spanRef={this.state.spanRef} 
            addVertice={(vertice, parentVerticeKey)=>this.addVertice(params.spanKey, vertice, parentVerticeKey)} 
            removeVertice={(verticeKey, parentVerticeKey)=>this.removeVertice(params.spanKey, verticeKey, parentVerticeKey)}
            editMode={params.editMode} />
        }
        {!validSpan && <p>Unknown span key <b>{params.spanKey}</b></p>}
      </div>
    );
  }
}
reactMixin(BeleafsRoot.prototype, ReactFireMixin)

export default BeleafsRoot
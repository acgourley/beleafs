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

type dataOperations = {
  createVerticeUnder: (vertice: FBVertice, parentVerticeKey: ?string) => boolean; 
  removeVerticeFrom: (verticeKey: string, parentVerticeKey: string) => boolean;
  moveTopwards: (verticeKey: string, parentVerticeKey: string) => Promise<boolean>;
  moveBottomwards: (verticeKey: string, parentVerticeKey: string) => Promise<boolean>;
  moveDeeper: (verticeKey: string, parentVerticeKey: string) => Promise<boolean>;
  moveShallower: (verticeKey: string, parentVerticeKey: string) => Promise<boolean>;
};

class VerticeComponent extends Component {
  /* Flow Types (top ones for ReactFireMixin) */
  bindAsArray: Function;
  bindAsObject: Function;
  firebaseRefs: Object;
  props: {
    dataOperations: dataOperations,
    verticeKey: string,
    parentVerticeKey: ?string,
    verticesRef: Object,
    editMode: ?boolean,
  };

  state: {
    vertice: FBVertice;
    childrenKeys: Array<{'.key': string, '.value': string}>;
  };

  constructor(props) {
    super();
    this.state = {
      vertice: {},
      childrenKeys: [],
    }
  }
  
  componentWillMount() {
    this.bindAsObject(this.props.verticesRef.child(this.props.verticeKey), 'vertice');
    this.bindAsArray(this.props.verticesRef.child(this.props.verticeKey).child('childrenKeys'), 'childrenKeys');
  }

  onAddClicked(e) {
    e.preventDefault(); 
    this.props.dataOperations.createVerticeUnder({
      statement: '',
      description: '',
      children: {},
    }, this.props.verticeKey); 
  }

  onStatementChange(e) {
    this.props.verticesRef.child(this.props.verticeKey).child('statement').set(e.target.value);
  }

  render() {
    const {dataOperations, verticesRef, verticeKey, parentVerticeKey, editMode} = this.props;
    const {vertice, childrenKeys} = this.state;


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
          {_.map(childrenKeys, (childrenKeysEntry) => {
              const childVerticeKey = childrenKeysEntry['.value'];
              return <VerticeComponent key={childVerticeKey} parentVerticeKey={verticeKey} verticeKey={childVerticeKey} 
              verticesRef={verticesRef} dataOperations={dataOperations} editMode={editMode}/> 
            }
          )}
        </div>
        {!editMode && <div className="verticeContent" dangerouslySetInnerHTML={{__html: suffix + processedStatement }}/>}

        {editMode && <textarea cols={100} onChange={this.onStatementChange.bind(this)} value={ vertice.statement } />}
        {editMode && <button onClick={this.onAddClicked.bind(this)}>{ `Add Leaffriend`}</button>}
        
        {editMode && parentVerticeKey && 
          <span className="move" onClick={ dataOperations.moveTopwards.bind(null, verticeKey, parentVerticeKey) }>
            UP
          </span>
        }
        {editMode && parentVerticeKey && 
          <span className="move" onClick={ dataOperations.moveBottomwards.bind(null, verticeKey, parentVerticeKey) }>
            DOWN
          </span>
        }
        {editMode && parentVerticeKey && 
          <span className="move" onClick={ dataOperations.moveShallower.bind(null, verticeKey, parentVerticeKey) }>
            LEFT
          </span>
        }
        {editMode && parentVerticeKey && 
          <span className="move" onClick={ dataOperations.moveDeeper.bind(null, verticeKey, parentVerticeKey) }>
            RIGHT
          </span>
        }
        {editMode && parentVerticeKey && !_.keys(vertice.childrenKeys).length && 
          <span className="delete" onClick={ dataOperations.removeVerticeFrom.bind(null, verticeKey, parentVerticeKey) }>
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
    dataOperations: dataOperations,
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
    const {dataOperations, spanRef, editMode} = this.props;
    const {span} = this.state;
    console.log('DEBUG: in SpanComponent render with props:', this.props, 'and state', this.state)
    const ready = span && span.rootVerticeKey;
    if(editMode) {
      if(!span.rootVerticeKey) {
        console.log("adding root vertice")
        this.props.dataOperations.createVerticeUnder({}, null);
      }
    }
    return (
      <div>
        {ready && <div>
          {editMode && <div><span>Title:</span> <input value={span.title} onChange={this.onTitleChange.bind(this)}/></div> }
          {!editMode && <h3>{span.title}</h3>}
          <VerticeComponent parentVerticeKey={null} 
            verticeKey={span.rootVerticeKey} verticesRef={spanRef.child('vertices')} 
            dataOperations={dataOperations} editMode={editMode}/>
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
  dataOperations: dataOperations;

  props: {
    params: {
      spanKey: string,
      editMode: ?string,
    }
  };
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
    const spanVerticesRef = spanRef.child('vertices');
    this.dataOperations = {
      createVerticeUnder: (vertice: FBVertice, parentVerticeKey: ?string) => {
        const verticeToSave: FBVertice = {
          statement: vertice.statement || '',
          description: vertice.description || '',
          childrenKeys: {},
        }

        const savedVerticeRef = this.firebaseRefs.span.child('vertices').push(verticeToSave);
        if(this.state.span && !this.state.span.rootVerticeKey) {
          spanRef.child('rootVerticeKey').set(savedVerticeRef.key)
        }
        console.log('DEBUG: savedVertice.key is:', savedVerticeRef.key);
        if(parentVerticeKey) {
          const parentVerticeRef = spanVerticesRef.child(parentVerticeKey).child('childrenKeys');
          const savedChildKey = parentVerticeRef.push(savedVerticeRef.key);
          console.log('DEBUG: savedChildKey is:', savedChildKey);
        }
        return true;
      },
      removeVerticeFrom: (verticeKey: string, parentVerticeKey: string) => {
        //TODO: Don't take parent key - search tree for ALL parents and to remove it. Soon vertices can have multiple parents.
        spanVerticesRef.child(verticeKey).remove();
        const childrenKeys = this.firebaseRefs.span.child('vertices').child(parentVerticeKey).child('childrenKeys')
        childrenKeys.orderByValue().equalTo(verticeKey).once("value", function(snapshot) {          
          snapshot.forEach((data) => {
            data.ref.remove();
          })
        })
        return true;
      },
      moveTopwards: (verticeKey: string, parentVerticeKey: string) => {
        const verticeRef = spanVerticesRef.child(verticeKey)
        const siblingsRef = spanVerticesRef.child(parentVerticeKey).child('childrenKeys')
        return siblingsRef.orderByKey().once("value", (siblingsSnap) => {
          let targetSiblingSnap, skywardBrotherSnap = null;
          siblingsSnap.forEach(siblingSnap => {
            if(skywardBrotherSnap && siblingSnap.val() === verticeKey) 
              targetSiblingSnap = siblingSnap
            else if(!targetSiblingSnap) 
              skywardBrotherSnap = siblingSnap;
          })
          //skywardBrother is the ref inside childrenKeys which points to the sibling node above the target
          //targetRef is the ref inside childrenKeys which points to the the target 
          if(skywardBrotherSnap && targetSiblingSnap) {
            const swapKeyUpdate = {
              [skywardBrotherSnap.key]: targetSiblingSnap.val(),
              [targetSiblingSnap.key]: skywardBrotherSnap.val(),
            }
            console.log('swapKeyUpdate', swapKeyUpdate);
            return siblingsRef.update(swapKeyUpdate).then(()=>true);
          } else
            console.log('moveTopwards failed to find a target vertice under a skyward brother!');
          return false;
        })
        
      },
      moveBottomwards: (verticeKey: string, parentVerticeKey: string) => {
        const verticeRef = spanVerticesRef.child(verticeKey)
        const siblingsRef = spanVerticesRef.child(parentVerticeKey).child('childrenKeys')
        return siblingsRef.orderByKey().once("value", (siblingsSnap) => {
          let targetSiblingSnap, groundwardsBrotherSnap = null;
          siblingsSnap.forEach(siblingSnap => {
            if(targetSiblingSnap && !groundwardsBrotherSnap) groundwardsBrotherSnap = siblingSnap;
            else if(siblingSnap.val() === verticeKey) targetSiblingSnap = siblingSnap
          })
          //groundwardsBrotherSnap is the ref inside childrenKeys which points to the sibling node below the target
          //targetRef is the ref inside childrenKeys which points to the the target 
          if(groundwardsBrotherSnap && targetSiblingSnap) {
            const swapKeyUpdate = {
              [groundwardsBrotherSnap.key]: targetSiblingSnap.val(),
              [targetSiblingSnap.key]: groundwardsBrotherSnap.val(),
            }
            console.log('swapKeyUpdate', swapKeyUpdate);
            return siblingsRef.update(swapKeyUpdate).then(()=>true);
          } else {
            if(!groundwardsBrotherSnap) console.log('moveBottomwards failed to find a eligable groundwards sibling to switch with!');
            if(!targetSiblingSnap) console.log('moveBottomwards failed to find a target vertice!');
          }
          return false;

        })
      },
      moveDeeper: (verticeKey: string, parentVerticeKey: string) => {
        const verticeRef = spanVerticesRef.child(verticeKey)
        const siblingsRef = spanVerticesRef.child(parentVerticeKey).child('childrenKeys')
        return siblingsRef.orderByKey().once("value", (siblingsSnap) => {
          let targetSiblingSnap, groundwardsBrotherSnap = null;
          siblingsSnap.forEach(siblingSnap => {
            if(targetSiblingSnap && !groundwardsBrotherSnap) groundwardsBrotherSnap = siblingSnap;
            else if(siblingSnap.val() === verticeKey) targetSiblingSnap = siblingSnap
          })
          //groundwardsBrotherSnap is the ref inside childrenKeys which points to the sibling node above the target
          //targetRef is the ref inside childrenKeys which points to the the target 
          if(groundwardsBrotherSnap && targetSiblingSnap) {
            const newParentVerticeKey = groundwardsBrotherSnap.val();
            return spanVerticesRef.transaction((vertices) => {
              if (vertices) {
                if(!vertices[newParentVerticeKey].childrenKeys)
                  vertices[newParentVerticeKey].childrenKeys = {}
                vertices[newParentVerticeKey].childrenKeys[targetSiblingSnap.key] = targetSiblingSnap.val()
                vertices[parentVerticeKey].childrenKeys[targetSiblingSnap.key] = null
                return vertices;
              }
            }).then(()=>true);
          } else {
            if(!groundwardsBrotherSnap) console.log('moveBottomwards failed to find a eligable groundwards sibling to switch with!');
            if(!targetSiblingSnap) console.log('moveBottomwards failed to find a target vertice!');
          }
          return false;

        })
      },
      moveShallower: (targetVerticeKey: string, parentVerticeKey: string) => {
        return spanVerticesRef.transaction((vertices) => {
          var foundOldParentChildKey;
          var newParentChildKey;
          _.each(vertices[parentVerticeKey].childrenKeys, (verticeChildVal, verticeChildKey) => {
            if(verticeChildVal === targetVerticeKey){
              foundOldParentChildKey = verticeChildKey
              vertices[parentVerticeKey].childrenKeys[foundOldParentChildKey] = null; //erase it
            }
          })
          _.each(vertices, ((verticeVal, verticeKey) => {
            if(verticeVal.childrenKeys)
              _.each(verticeVal.childrenKeys, (verticeChildVal, verticeChildKey) => {
                if(verticeChildVal === parentVerticeKey) {//found a parent of the parent - but there may be many! this is not the best solution.
                  verticeVal.childrenKeys[foundOldParentChildKey] = targetVerticeKey;
                  newParentChildKey = foundOldParentChildKey;
                }
              })
          }))
          if(foundOldParentChildKey && newParentChildKey)
            return vertices;
        })
      },
    }
    this.bindAsObject(spanRef, 'span');
    this.setState({spanRef})
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
        {validSpan && this.state.spanRef && <SpanComponent spanRef={this.state.spanRef} 
            dataOperations={this.dataOperations}
            editMode={params.editMode === 'edit'} />
        }
        {loadingSpan && <p>Loading span...</p>}
        {notFoundSpan && <p>Could not load span <b>{params.spanKey}</b></p>}
      </div>
    );
  }
}
reactMixin(BeleafsRoot.prototype, ReactFireMixin)

export default BeleafsRoot
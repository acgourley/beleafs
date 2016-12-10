
/* Flow Types */

export type FBVertice = {
  '.key': ?string,
  statement: string,
  description: string,
  childrenKeys: ?{[key: string] : string}
};

export type FBSpan = {
  '.key': string,
  title: string,
  rootVerticeKey: string,
  vertices: {[key: string] : FBVertice}
};
/* @flow */

class A {}
class B extends A {}
class C extends B {}

var React = require('react');
var Example = React.createClass({
  propTypes: {
    x: React.PropTypes.instanceOf(B),
  }
});

(<Example x={new A} />); // error: A ~> B
(<Example x={new B} />); // OK
(<Example x={new C} />); // OK (C ~> B)
(<Example x="wrong" />); // error: string ~> B

class Poly<T> {x:T}
var PolyExample = React.createClass({
  propTypes: {
    x: React.PropTypes.instanceOf(Poly).isRequired,
  },
  m() {
    (this.props.x.x: empty); // OK, T instantiated to `any`
  }
});

// Different instantiations don't interact
(<PolyExample x={(new Poly(): Poly<string>)} />); // OK
(<PolyExample x={(new Poly(): Poly<number>)} />); // OK

class PolyDefault<T=string> {x:T}
var PolyDefaultExample = React.createClass({
  propTypes: {
    x: React.PropTypes.instanceOf(PolyDefault).isRequired,
  },
  m() {
    (this.props.x.x: empty); // OK, T instantiated to `any`
  }
});

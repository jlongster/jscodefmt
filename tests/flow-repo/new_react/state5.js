var React = require('React');

class C extends React.Component {
  foo(): number {
    return this.state.x; // error: need to declare type of state
  }
}

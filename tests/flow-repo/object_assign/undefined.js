/* @flow */

var React = require('react');

type DefaultProps = {
  foo: number,
}

type Props = {
  foo: number,
}

class MyReactThing extends React.Component {
  props: Props;
  static defaultProps: DefaultProps;
  getFoo(): number { return this.props.foo; }
}

<MyReactThing />; // works
<MyReactThing foo={undefined} />; // also works

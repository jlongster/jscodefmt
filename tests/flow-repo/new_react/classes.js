var React = require('React');

type DefaultProps = { };
type Props = { x: number };
type State = { y: number };

class Foo extends React.Component {
  props: Props;
  state: State;
  static defaultProps: DefaultProps;

  is_mounted: boolean;

  static bar(): void {}

  qux(): void {
    var _: string = this.props.x;
  }

  constructor(props) {
    super(props);
    this.state = { y: "" };
  }

  setState(o: { y_: string }): void { }

  componentDidMount(): void {
    this.is_mounted = true;
  }

  componentWillReceiveProps(
    nextProps: Object,
    nextContext: any
  ): void {
    this.qux();
  }

}

Foo.defaultProps = 0;
var foo: $jsx<number> = <Foo/>;

Foo.bar();

var FooLegacy = React.createClass({
  is_mounted: (undefined: ?boolean),

  propTypes: {
    x: React.PropTypes.number.isRequired
  },

  getDefaultProps(): DefaultProps { return {} },

  statics: {
    bar(): void {}
  },

  qux(): void {
    var _: string = this.props.x;
  },

  getInitialState(): { y: string } {
    return { y: "" };
  },

  setState(o: { y_: string }): void { },

  componentDidMount(): void {
    this.is_mounted = true;
  },

  componentWillReceiveProps(
    nextProps: Object,
    nextContext: any
  ): void {
    this.qux();
  },
});

FooLegacy.defaultProps = 0;
var foo_legacy: $jsx<number> = <FooLegacy/>;

FooLegacy.bar();

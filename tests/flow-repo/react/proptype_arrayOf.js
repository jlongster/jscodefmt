/* @flow */

var React = require('react');
var Example = React.createClass({
  propTypes: {
    arr: React.PropTypes.arrayOf(React.PropTypes.number).isRequired,
  },
});

var ok_empty = <Example arr={[]} />
var ok_numbers = <Example arr={[1, 2]} />

var fail_missing = <Example />
var fail_not_array = <Example arr={2} />
var fail_mistyped_elems = <Example arr={[1, "foo"]} />

/* Since the `number` proptype argument is not required, React will actually
   allow `null` and `undefined` elements in the `arr` prop, but Flow has
   currently ignores the innter prop type's required flag. */
var todo_required = <Example arr={[null]} />

var OptionalExample = React.createClass({
  propTypes: {
    arr: React.PropTypes.arrayOf(React.PropTypes.number),
  }
});

(<OptionalExample />); // OK
(<OptionalExample arr={[0]} />); // OK
(<OptionalExample arr={[""]} />); // error: string ~> number

var AnyExample = React.createClass({
  propTypes: {
    arr: React.PropTypes.arrayOf((0:any)), // OK
  },
});

(<AnyExample arr={0} />); // error: still needs to be an array
(<AnyExample arr={[0]} />); // OK

var InvalidExample = React.createClass({
  propTypes: {
    arr: React.PropTypes.arrayOf(0), // error: number not a prop type
  },
});

/* @flow */

var React = require('react');
var Example = React.createClass({
  propTypes: {
    obj: React.PropTypes.objectOf(React.PropTypes.number).isRequired
  },
});

var ok_empty = <Example obj={{}} />
var ok_numbers = <Example obj={{foo: 1, bar: 2}} />

var fail_missing = <Example />
var fail_not_object = <Example obj={2} />
var fail_mistyped_props = <Example obj={{foo: "foo"}} />

/* Since the `number` proptype argument is not required, React will actually
   allow `null` and `undefined` elements in the `obj` prop, but Flow has
   currently ignores the innter prop type's required flag. */
var todo_required = <Example obj={{p:null}} />

var OptionalExample = React.createClass({
  propTypes: {
    obj: React.PropTypes.objectOf(React.PropTypes.number),
  }
});

(<OptionalExample />); // OK
(<OptionalExample obj={{p:0}} />); // OK
(<OptionalExample obj={{p:""}} />); // error: string ~> number

var AnyExample = React.createClass({
  propTypes: {
    obj: React.PropTypes.objectOf((0:any)), // OK
  },
});

(<AnyExample obj={0} />); // error: still needs to be an object
(<AnyExample obj={{p:0}} />); // OK

var InvalidExample = React.createClass({
  propTypes: {
    obj: React.PropTypes.objectOf(0), // error: number not a prop type
  },
});

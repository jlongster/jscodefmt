var React = require('react');
var TestProps = React.createClass({
    // Do something illegal inside of propTypes and make sure Flow notices
    propTypes: {
      arr: React.PropTypes.array,
      arr_rec: React.PropTypes.array.isRequired,
      bool: React.PropTypes.bool,
      bool_rec: React.PropTypes.bool.isRequired,
      func: React.PropTypes.func,
      func_rec: React.PropTypes.func.isRequired,
      number: React.PropTypes.number,
      number_rec: React.PropTypes.number.isRequired,
      object: React.PropTypes.object,
      object_rec: React.PropTypes.object.isRequired,
      string: React.PropTypes.string,
      string_rec: React.PropTypes.string.isRequired,

      any: React.PropTypes.any,
      any_rec: React.PropTypes.any.isRequired,
      element: React.PropTypes.element,
      element_rec: React.PropTypes.element.isRequired,
      node: React.PropTypes.node,
      node_rec: React.PropTypes.node.isRequired,

      arrayOf: React.PropTypes.arrayOf(React.PropTypes.string),
      arrayOf_rec: React.PropTypes.arrayOf(React.PropTypes.string).isRequired,
      instanceOf: React.PropTypes.instanceOf(Object),
      instanceOf_rec: React.PropTypes.instanceOf(Object).isRequired,
      objectOf: React.PropTypes.objectOf(React.PropTypes.string),
      objectOf_rec: React.PropTypes.objectOf(React.PropTypes.string).isRequired,
      oneOf: React.PropTypes.oneOf(["yes", "no"]),
      oneOf_rec: React.PropTypes.oneOf(["yes", "no"]).isRequired,
      oneOfType: React.PropTypes.oneOfType(
        [React.PropTypes.string, React.PropTypes.number]
      ),
      oneOfType_rec: React.PropTypes.oneOfType(
        [React.PropTypes.string, React.PropTypes.number]
      ).isRequired,
      shape: React.PropTypes.shape({
        foo: React.PropTypes.string,
        bar: React.PropTypes.number,
      }),
      shape_rec: React.PropTypes.shape({
        foo: React.PropTypes.string,
        bar: React.PropTypes.number,
      }).isRequired,

      // And do something bad here
      bad_one: React.PropTypes.imaginaryType,
      bad_two: React.PropTypes.string.inRequired,
    },
});

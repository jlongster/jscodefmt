const React = require("react");

// Custom validator must match `ReactPropsCheckType`
var Example = React.createClass({
  propTypes: {
    foo(props, propName, componentName, href) {
      (props: empty); // ok: props is `any`
      (propName: empty); // error: propName is a string
      (componentName: empty); // error: componentName is a string
      (href: empty); // error: href is an optional string
      return (0: mixed); // error: should return ?Error
    },
  }
});

// Inferred prop type is optional `any`
(<Example />);
(<Example foo={(0: mixed)} />);

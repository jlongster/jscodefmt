var React = require('react');
var PropTypes = React.PropTypes;

var C = React.createClass({
  propTypes: {
    statistics: PropTypes.arrayOf(PropTypes.shape({
      label: PropTypes.string.isRequired,
      value: PropTypes.number,
    })).isRequired,
  }
});

<C statistics={[
  {},
  {label:"",value:undefined},
]}/>; // error (label is required, value not required)

var props: Array<{label: string, value?: number}> = [
  {},
  {label:"",value:undefined},
]; // error (same as ^)

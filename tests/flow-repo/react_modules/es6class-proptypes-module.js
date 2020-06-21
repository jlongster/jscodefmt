/* @flow */
import React from 'react';

class Hello extends React.Component<void, {name: string}, void> {
  defaultProps = {};
  propTypes = {
    name: React.PropTypes.string.isRequired,
  };

  render(): React.Element<*> {
    return <div>{this.props.name}</div>;
  }
}

module.exports = Hello;

/* @flow */
import React from 'react';
import Hello from './es6class-proptypes-module';

class HelloLocal extends React.Component<void, {name: string}, void> {
  defaultProps = {};
  propTypes = {
    name: React.PropTypes.string.isRequired,
  };
  render(): React.Element<*> {
    return <div>{this.props.name}</div>;
  }
}

class Callsite extends React.Component<void, {}, void> {
  render(): React.Element<*> {
    return (
      <div>
        <Hello />
        <HelloLocal />
      </div>
    );
  }
}

module.exports = Callsite;

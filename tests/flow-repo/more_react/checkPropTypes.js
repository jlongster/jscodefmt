/* @flow */

import { PropTypes, checkPropTypes } from "react";

checkPropTypes({ foo: PropTypes.string }, { foo: 'foo' }, 'value', 'TestComponent'); // OK

checkPropTypes({ foo: PropTypes.string }, { foo: 'foo' }); // error: missing arguments
checkPropTypes({ foo: PropTypes.string }, { foo: 'foo' }, 'value'); // error: missing argument

checkPropTypes({ bar: PropTypes.string }, { foo: 'foo' }, 'value', 'TestComponent'); // error: property not found

checkPropTypes({ foo: PropTypes.string }, { foo: 'foo' }, 'value', 'TestComponent', () => 123); // error: number ~> string
checkPropTypes({ foo: PropTypes.string }, { foo: 'foo' }, 'value', 'TestComponent', () => null); // OK
checkPropTypes({ foo: PropTypes.string }, { foo: 'foo' }, 'value', 'TestComponent', () => undefined); // OK

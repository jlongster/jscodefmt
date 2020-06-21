// @flow

var React = require('react');

class CustomComponent extends React.Component {
  props: {
    prop: string
  };
}

var a: React.Element<{prop: string}> = <CustomComponent prop="asdf" />;
var b: React.Element<{prop1: string}> = <CustomComponent prop="asdf" />; // Error: Props<{prop}> ~> Props<{prop1}>

// Since intrinsics are typed as `any` out of the box, we can pass any
// attributes to intrinsics!
var c: React.Element<any> = <div not_a_real_attr="asdf" />;
// However, we don't allow such elements to be viewed as React elements with
// different attributes.
var d: React.Element<{doesntmatch: string}> = <div not_a_real_attr="asdf" />;
// No error as long as expectations are consistent, though.
var e: React.Element<{not_a_real_attr: string}> = <div not_a_real_attr="asdf" />;

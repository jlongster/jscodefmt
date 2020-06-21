declare var x: {
  x: { foo: string }
};
declare var y: {
  // $FlowFixMe - this location is only mentioned in the extra section
  x: { bar: number }
};
x = y;

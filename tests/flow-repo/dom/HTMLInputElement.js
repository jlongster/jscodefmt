// @flow

let tests = [
  // setRangeText
  function(el: HTMLInputElement) {
    el.setRangeText('foo');
    el.setRangeText('foo', 123); // end is required
    el.setRangeText('foo', 123, 234);
    el.setRangeText('foo', 123, 234, 'select');
    el.setRangeText('foo', 123, 234, 'bogus'); // invalid value
  }
];

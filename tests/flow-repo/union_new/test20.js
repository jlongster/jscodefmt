// @noflow

// Array#reduce

[0,1].reduce((x,y,i) => y);

["a", "b"].reduce(
  (regex, representation, index) => {
    return regex + (index ? '|' : '') + '(' + representation + ')';
  },
  '',
);

[""].reduce((acc,str) => acc * str.length);

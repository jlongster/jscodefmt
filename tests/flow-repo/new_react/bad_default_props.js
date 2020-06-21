var React = require('React');

type T1 = { }
type T2 = { x: number }
type T3 = { x: number, y: number }

class C1 extends React.Component<T1, T2, any> { // error
}

class C2 extends React.Component<void, T2, any> { // OK
}

// no need to add type arguments to React.Component
class C3 extends React.Component { // OK
  static defaultProps: T1;
  props: T2;
}

class C4 extends React.Component { // OK, recommended
  // no need to declare defaultProps unless necessary
  props: T2;
}

class C5 extends React.Component<T2, T3, any> { // error
}

class C6 extends React.Component { // OK, recommended
  static defaultProps: T2;
  props: T3;
}

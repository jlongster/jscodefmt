class A {
  n: number;
  constructor(n: number) {
    this.n = n;
  }
  clone(): A {
    return new this.constructor(this.n);
  }
  badClone(): number {
    return new this.constructor(this.n); // Error A ~> number
  }
}

var a1 = new A(1);
var a2: A = new a1.constructor(2);
var a3: A = a2.clone();

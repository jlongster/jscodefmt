// passing a union-like thing into an overload is ok
// if overload handles each branch of union-like thing

// unions
declare function f(x: string): void;
declare function f(x: number): void;
declare var x_f: string | number;
f(x_f); // ok

// maybe
declare function g(x: null): void;
declare function g(x: void): void;
declare function g(x: string): void;
declare var x_g: ?string;
g(x_g); // ok

// optional
declare function h(x: void): void;
declare function h(x: string): void;
declare var x_h: {p?: string};
h(x_h.p); // ok

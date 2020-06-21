declare class C {
    static x: number;
    static foo(x: number): void;

    constructor(x: string): void;
}

C.x = "";
C.foo("");

(C.name: string);
(C.name: number); // error, it's a string

declare class D extends C { }
new D(123); // error, number ~> string

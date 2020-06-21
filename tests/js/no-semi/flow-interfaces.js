declare class A {
    one: boolean;
    two: { three: string }
    | number;
}

// NOTE: Flow and Babel both fail to apply ASI here
// declare class B {
//     one: boolean
//     two: { three: string }
//     | number
// }

declare interface C {
    one: boolean;
    two: { three: string }
    | number;
}

// NOTE: Flow and Babel both fail to apply ASI here
// declare interface D {
//     one: boolean
//     two: { three: string }
//     | number
// }

interface E {
    one: boolean;
    two: { three: string }
    | number;
}

// NOTE: Flow and Babel both fail to apply ASI here
// interface F {
//     one: boolean
//     two: { three: string }
//     | number
// }

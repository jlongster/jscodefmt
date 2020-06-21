type Banana = {
  eat: string => boolean,
};

type Hex = {n: 0x01};

type T1 = { method: (a) => void };

type T2 = { method(a): void };

declare class X { method(a): void }

declare function f(a): void;

var f: (a) => void;

interface F1 { m(string): number }

interface F2 { m: (string) => number }

function f1(o: { f: (string) => void }) {}

function f2(o: { f(string): void }) {}

type f3 = (...arg) => void;

type f4 = (/* comment */ arg) => void;

type f5 = (arg /* comment */) => void;

type f6 = (?arg) => void;

class Y {
  constructor(
    ideConnectionFactory: child_process$ChildProcess => FlowIDEConnection =
        defaultIDEConnectionFactory,
  ) {
  }
}

interface F {
  ideConnectionFactoryLongLongLong: (child_process$ChildProcess) => FlowIDEConnection
}

type ExtractType = <A>(B<C>) => D

type T3 = ?(() => A);

type T4 = ?(() => A) | B;

type T5 = ?() => A | B;

type T6 = (?() => A) | B;

// https://github.com/babel/babel/issues/7924
//type T = ??() => A;

type T7 = ?(?(() => A));

type T8 = ?(?() => A) | B;

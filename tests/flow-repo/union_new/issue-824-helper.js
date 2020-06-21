import A from "./issue-824";

export class B extends A {
  which(): number {
    return 1;
  }
}
export class C extends A {
  which(): number {
    return 2;
  }
}

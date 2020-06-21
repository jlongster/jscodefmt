declare class FakeUint8Array {
  set(index: number, value: number): void;
  set(array: FakeUint8Array | Array<number>, offset?: number): void;
}

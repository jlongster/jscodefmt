// @noflow

// scaling test for full type resolution

declare class C {
  addListener(event: string, listener: Function): C;
  emit(event: string, ...args:Array<any>): boolean;
  listeners(event: string): Array<Function>;
  listenerCount(event: string): number;
  on(event: string, listener: Function): C;
  once(event: string, listener: Function): C;
  removeAllListeners(event?: string): C;
  removeListener(event: string, listener: Function): C;
  setMaxListeners(n: number): void;
}

declare class D extends C {
  listen(port: number, hostname?: string, backlog?: number, callback?: Function): D;
  listen(path: string, callback?: Function): D;
  listen(handle: Object, callback?: Function): D;
  close(callback?: Function): D;
  address(): number;
  connections: number;
  maxConnections: number;
  getConnections(callback: Function): void;
  ref():  D;
  unref():  D;
}

(0: D | number);

interface Interface {
  m(): void;
}
import type { ObjectType } from './test';

function subtypeCheck(x: Interface): ObjectType { return x; }

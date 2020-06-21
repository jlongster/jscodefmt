// @flow

import { foo } from "./c1";

export function bar(props: { x: number }) {
  foo({ x: 0 });
}

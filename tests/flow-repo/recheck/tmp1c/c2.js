// @flow

import { foo } from "./c1";

export function bar(props: { y: number }) {
  foo({ y: 0 });
}

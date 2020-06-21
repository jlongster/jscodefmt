// @flow

import type { Action } from './e1';

const f = (): Action => {
  return { type: 'FOO' };
}

import { LIFE } from './e1';

(LIFE: 42);

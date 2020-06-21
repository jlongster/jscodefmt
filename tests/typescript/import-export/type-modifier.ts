export type { SomeThing };
export type { A as B };
export type { B as C } from './a';
export type { foo } from 'bar';
export type { foo };

// this should be treated as a normal import statement
import type from './foo';

import type { SomeThing } from "./some-module.js";
import type { foo, bar } from 'baz';
import type { foo as bar } from 'baz';
import type * as foo from './bar';
import type foo from 'bar';
import type foo, { bar } from 'bar';

/**
 * At the moment, all type params are invariant with
 * the exception of the single param to the Promise class,
 * which is covariant.
 *
 * Explicit variance control via annotation is coming,
 * but not immediately. In the meantime, Promise's
 * participation in async/await makes certain kinds of
 * errors onerous (and nonobvious) without covariance.
 *
 * @flow
 */

async function foo(x: boolean): Promise<?{bar: string}> {
  if (x) {
    return {bar: 'baz'};  // OK, because of covariant type param
  } else {
    return null;
  }
}

async function run() {
  console.log(await foo(true));
  console.log(await foo(false));
}

run()

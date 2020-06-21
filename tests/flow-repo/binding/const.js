const x = 0;

// errors: const cannot be reassigned
x++;
x--;
x += 0;
x -= 0;
x /= 0;
x %= 0;
x <<= 0
x >>= 0;
x >>>= 0;
x |= 0;
x ^= 0;
x &= 0;

// regression tests -- OK to assign consts like this:

const { foo } = { foo: "foo" }
const [ bar ] = ["bar"];
(foo: number); // error: string ~> number
(bar: number); // error: string ~> number

declare var bazzes: { baz: string }[];
for (const { baz } of bazzes) {
  (baz: number); // error: string ~> number
}

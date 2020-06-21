// This file triggers a violation of the "disjoint-or-nested ranges invariant"
// that we implicitly assume in type-at-pos and coverage implementations. In
// particular, when unchecked it causes a crash with coverage --color.

declare module foo {
}

declare module bar {
}

// TODO

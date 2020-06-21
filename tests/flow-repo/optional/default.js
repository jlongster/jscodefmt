function f<T>(foo, bar = foo): [T, T] {
  return [foo, bar];
}

// @flow

// make sure that full resolution jobs don't cache improperly to signal success
// when they have failed earlier

function foo(value: Indirect<string> | number): Indirect<string> | number {
  const castedValue: number = typeof value === 'number' ? value : 0;
  return castedValue;
}

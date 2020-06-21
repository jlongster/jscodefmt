const c = () => {};

function a() {
  return function b() {
    return () => {
      return function() {
        return c;
      }
    }
  }
}

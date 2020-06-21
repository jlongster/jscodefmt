// https://babeljs.io/docs/en/babel-plugin-proposal-private-methods

// Test for `classPrivateProperties` and `classPrivateMethods`

class Counter extends HTMLElement {
  #xValue = 0;

  get #x() { return this.#xValue; }
  set #x(value) {
    this.#xValue = value;
    window.requestAnimationFrame(
      this.#render.bind(this));
  }

  #clicked() {
    this.#x++;
  }
}

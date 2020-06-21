const helpers1 = /** @type {Helpers} */ ((
  (helpers = {}) => helpers
)());

const helpers2 = /** @type {Helpers} */ ((
  function() { return something }
)());

// TODO: @param is misplaced https://github.com/prettier/prettier/issues/5850
const helpers = /** @type {Helpers} */ ((
  /** @param {Partial<Helpers>} helpers */
  (helpers = {}) => helpers
)());

// @flow

require('module_completely_absent');

// node_modules/module_outside_of_root/ sits outside of the Flow project root.
// Flow should give a descriptive error about this
require('module_outside_of_root');

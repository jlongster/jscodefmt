// @flow

import {name} from "testproj2";

(name: "node_modules/testproj2"); // Error: Resolve from sibling 'custom_resolve_dir' first!
(name: "subdir/custom_resolve_dir/testproj2");

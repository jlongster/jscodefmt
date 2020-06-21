// @flow

import {name} from "testproj";

(name: "node_modules/testproj");
(name: "custom_resolve_dir/testproj"); // Error: Resolve from node_modules first!

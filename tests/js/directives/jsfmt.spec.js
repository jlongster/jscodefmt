const { outdent } = require("outdent");

run_spec(
  {
    dirname: __dirname,
    snippets: [
      {
        code: outdent`
          'use strict';

          // comment
        `,
        output:
          outdent`
            "use strict";

            // comment
          ` + "\n",
      },
      {
        code: outdent`
          'use strict';
          // comment
        `,
        output:
          outdent`
            "use strict";
            // comment
          ` + "\n",
      },
      {
        code:
          outdent`
            'use strict';

            // comment
          ` + "\n",
        output:
          outdent`
            "use strict";

            // comment
          ` + "\n",
      },
    ],
  },
  ["babel", "flow", "typescript"]
);
